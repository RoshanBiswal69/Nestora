const User = require('../models/User');

async function seedAdmin() {
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) return;
  try {
    const existing = await User.findOne({ email: process.env.ADMIN_EMAIL.toLowerCase().trim() });
    if (existing) return;

    await User.create({
      name: process.env.ADMIN_NAME || 'Nestora Admin',
      email: process.env.ADMIN_EMAIL.toLowerCase().trim(),
      password: process.env.ADMIN_PASSWORD,
      role: 'admin'
    });
    console.log('Seeded Nestora administrator account:', process.env.ADMIN_EMAIL);
  } catch (err) {
    console.error('Error seeding admin account:', err.message);
  }
}

module.exports = seedAdmin;
