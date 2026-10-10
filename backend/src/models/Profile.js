
const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    // One profile document for the entire portfolio
    _id: {
      type: String,
      default: "main",
    },

    name: {
      type: String,
      trim: true,
      required: true,
      maxlength: 120,
      default: "Md Sufiyan",
    },

    role: {
      type: String,
      trim: true,
      required: true,
      maxlength: 120,
      default: "Software Developer",
    },

    email: {
      type: String,
      trim: true,
      maxlength: 254,
      default: "your.email@example.com",
    },

    location: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "Nepal",
    },

    heroIntro: {
      type: String,
      trim: true,
      maxlength: 1200,
      default: "",
    },

    aboutLead: {
      type: String,
      trim: true,
      maxlength: 1200,
      default: "",
    },

    aboutBody: {
      type: String,
      trim: true,
      maxlength: 5000,
      default: "",
    },

    experience: {
      type: String,
      trim: true,
      maxlength: 5000,
      default: "",
    },

    resumeUrl: {
      type: String,
      trim: true,
      maxlength: 2048,
      default: "",
    },

    githubUrl: {
      type: String,
      trim: true,
      maxlength: 2048,
      default: "",
    },

    linkedinUrl: {
      type: String,
      trim: true,
      maxlength: 2048,
      default: "",
    },
  },
  {
    timestamps: true,
    strict: "throw",
  }
);

module.exports = mongoose.model("Profile", profileSchema);
