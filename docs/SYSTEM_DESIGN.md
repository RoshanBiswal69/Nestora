# System Design Write-up

## Complaint History Model

Every complaint embeds a `statusHistory` array directly inside its document rather than living in a separate `history` collection. Each entry captures `status`, `changedBy` (a reference to the acting user), an optional `note`, and a `timestamp`. At creation time, a complaint is seeded with one history entry — `Open`, "Complaint raised" — so a complaint's full lifecycle is always reconstructable from a single document with zero joins. This embedded-array approach was chosen over a normalized `ComplaintHistory` collection for three reasons: complaints have a bounded, small number of status transitions (at most three: Open → In Progress → Resolved, since Resolved is terminal), the history is always read together with the complaint and never queried independently, and MongoDB's document model rewards data that's read together being stored together. The trade-off is that the array can't be efficiently queried in isolation (e.g. "find all history entries by admin X across all complaints") — but that query isn't part of the product's requirements, so the simplicity wins.

Status transitions are enforced server-side, not client-side: the PATCH endpoint checks `complaint.status === 'Resolved'` and rejects further updates with a 400, which is what gives the "once Resolved, it's closed" rule teeth. Every PATCH that actually changes the status pushes a new history entry before saving, using `req.user._id` as `changedBy` so the audit trail is tied to an authenticated, server-verified actor rather than anything the client could spoof.

## Overdue Detection

Overdue status is a derived boolean (`isOverdue`) stored on the complaint, recalculated lazily rather than via a background cron job. A `updateOverdueComplaints()` utility runs at the start of every read path that an admin would use to triage complaints (the admin complaint list and the dashboard) — never on resident reads, since residents don't need this side effect and it would be wasted work. The function does two bulk updates: any complaint still `Open` or `In Progress` whose `createdAt` is older than `now - thresholdDays` gets flagged true, and any complaint that's since become `Resolved` gets flagged false (covering the case where a complaint was overdue, then resolved, and shouldn't keep showing as overdue in stale data).

The threshold itself lives in a generic `Settings` collection as a `{key, value}` pair (`overdueThresholdDays`) rather than a hardcoded constant or environment variable, so an admin can change it at runtime through the Settings page without a redeploy. Sort order on the admin complaint list is `{isOverdue: -1, priority: -1, createdAt: -1}`, which is what makes overdue items "surface at the top" as required — it's a query-level guarantee, not something the frontend has to reimplement.

This trades a small amount of staleness (an admin's view could be up to one page-load behind the true overdue state) for avoiding a scheduled job in a project scoped to free-tier deployment. At scale, the natural evolution is a cron-triggered call to the same utility function.

## Photo Handling

Photos are handled with Multer paired with multer-storage-cloudinary, which 
uploads files directly to Cloudinary instead of local disk. Each upload is 
placed under the folder `nestora/complaints` in Cloudinary, with 
a transformation applied (max 1600×1600, crop limit) to keep storage and 
bandwidth reasonable without degrading visible quality. Only common image 
MIME types are accepted, and size is capped at 5MB — both enforced in the 
Multer config before the file is transferred.

Cloudinary returns a permanent, publicly accessible URL for each uploaded 
file. That URL — not a filename, not a relative path — is what gets persisted 
on the complaint document in MongoDB (`complaint.photo`). The frontend renders 
it directly as an `<img src={complaint.photo} />` with no URL reconstruction 
needed.

This approach sidesteps the main deployment concern with disk-based uploads: 
Render's free-tier filesystem is ephemeral and resets on every redeploy, which 
would silently break any previously uploaded photo while its database reference 
survived. With Cloudinary, the file lives in object storage completely 
independent of the backend server's lifecycle — a full redeploy or server 
restart has no effect on previously uploaded images.

The upgrade path from here (if needed at scale) is switching to a private 
Cloudinary delivery URL with signed access tokens, without touching any route 
logic since routes only ever handle `complaint.photo` as an opaque string.

## Notification Flow

Email is handled by Nodemailer against any SMTP provider (documented for Gmail with an App Password, since that's a reliable free-tier option). Notifications fire from exactly two trigger points: the complaint PATCH route, after a successful status change, and the notice POST route, when `isImportant` is true. Both are fire-and-forget — wrapped in try/catch inside the email utility itself so that a transient SMTP failure never blocks or rolls back the underlying database write that triggered it. This was a deliberate choice: a resident's complaint update should never fail because an email provider is down. If `EMAIL_USER` isn't configured in the environment, the email functions short-circuit silently, so the app is fully functional in environments where email isn't set up yet (e.g. early local development).
