const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

const sendComplaintStatusEmail = async (resident, complaint, newStatus, note) => {
  if (!process.env.EMAIL_USER) return; // Skip if email not configured

  try {
    const transporter = createTransporter();
    const statusColors = {
      'Open': '#ef4444',
      'In Progress': '#f59e0b',
      'Resolved': '#10b981'
    };

    const brandName = process.env.SOCIETY_NAME || 'Nestora Community Management';

    await transporter.sendMail({
      from: `"${brandName}" <${process.env.EMAIL_USER}>`,
      to: resident.email,
      subject: `[Nestora] Ticket Update: ${complaint.title} — ${newStatus}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <div style="background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%); padding: 28px 24px; text-align: left;">
            <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">Nestora</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 13px;">${brandName}</p>
          </div>
          <div style="padding: 32px 24px; background: #ffffff;">
            <p style="color: #334155; margin-top: 0; font-size: 15px;">Hello <strong>${resident.name}</strong>,</p>
            <p style="color: #475569; font-size: 14.5px; line-height: 1.6;">Your maintenance ticket has been updated by administration.</p>
            
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; margin: 24px 0;">
              <h2 style="color: #0f172a; margin-top: 0; font-size: 17px; font-weight: 700;">${complaint.title}</h2>
              <p style="color: #64748b; font-size: 13.5px; margin: 4px 0;"><strong>Category:</strong> ${complaint.category}</p>
              
              <div style="margin-top: 12px;">
                <span style="display: inline-block; background: ${statusColors[newStatus] || '#4f46e5'}18; color: ${statusColors[newStatus] || '#4f46e5'}; border: 1px solid ${statusColors[newStatus] || '#4f46e5'}40; padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 700;">
                  Status: ${newStatus}
                </span>
              </div>
              
              ${note ? `<div style="color: #334155; margin-top: 16px; padding: 14px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 13.5px; line-height: 1.6;"><strong style="color: #4f46e5;">Administrator Note:</strong><br/>${note}</div>` : ''}
            </div>

            <p style="color: #94a3b8; font-size: 12.5px; margin-bottom: 0; line-height: 1.5;">You can track complete history and ticket progress anytime by signing into your Nestora resident portal.</p>
          </div>
          <div style="background: #f8fafc; padding: 16px 24px; border-top: 1px solid #e2e8f0; text-align: center;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Nestora. Smart Community Management.</p>
          </div>
        </div>
      `
    });
  } catch (err) {
    console.error('Email send error:', err.message);
  }
};

const sendImportantNoticeEmail = async (residents, notice) => {
  if (!process.env.EMAIL_USER || !residents.length) return;

  try {
    const transporter = createTransporter();
    const brandName = process.env.SOCIETY_NAME || 'Nestora Community Management';
    const emails = residents.map(r => r.email).join(',');

    await transporter.sendMail({
      from: `"${brandName}" <${process.env.EMAIL_USER}>`,
      to: emails,
      subject: `📌 Important Community Notice: ${notice.title}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <div style="background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%); padding: 28px 24px;">
            <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">Nestora</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 4px 0 10px; font-size: 13px;">${brandName}</p>
            <span style="background: #ef4444; color: white; padding: 3px 10px; border-radius: 4px; font-size: 11.5px; font-weight: 700; display: inline-block; letter-spacing: 0.5px;">IMPORTANT COMMUNITY BULLETIN</span>
          </div>
          <div style="padding: 32px 24px; background: #ffffff;">
            <h2 style="color: #0f172a; margin-top: 0; font-size: 18px; font-weight: 800;">${notice.title}</h2>
            <div style="color: #334155; line-height: 1.7; white-space: pre-wrap; font-size: 14.5px; margin: 16px 0;">${notice.content}</div>
            <p style="color: #94a3b8; font-size: 12.5px; margin-top: 24px; margin-bottom: 0;">Posted on ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <div style="background: #f8fafc; padding: 16px 24px; border-top: 1px solid #e2e8f0; text-align: center;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Nestora. Smart Community Management.</p>
          </div>
        </div>
      `
    });
  } catch (err) {
    console.error('Notice email error:', err.message);
  }
};

module.exports = { sendComplaintStatusEmail, sendImportantNoticeEmail };
