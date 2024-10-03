const mongoose = require("mongoose");


const UserSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  national_id: { type: String, required: true, unique: true },
  account_number: { type: String, required: true },
  bank: { type: String, required: true },
  employee: { type: Boolean, required: true, default : false },
});

UserSchema.index({ email: 1 });

module.exports = { User : mongoose.model("User", UserSchema) };
