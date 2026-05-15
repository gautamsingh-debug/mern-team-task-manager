const mongoose = require("mongoose");
require("dotenv").config();
const User = require("./models/User");

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
    const users = await User.find({}, "name email role");
    console.log("Users in DB:");
    users.forEach(u => console.log(`- ${u.name} (${u.email}): role=${u.role}`));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkUsers();
