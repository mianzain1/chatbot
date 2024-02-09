// models/UserSettingsModel.js

const mongoose = require('mongoose');

const userSettingsSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    defaultResponse: { type: String, default: "No similar question found in the database" },
    responseDelay: { type: Number, default: 0 }, // Time delay in milliseconds
    // Add more settings as needed
});

const UserSettingsModel = mongoose.model('UserSettings', userSettingsSchema);

module.exports = UserSettingsModel;
