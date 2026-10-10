
const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 180,
    },

    issuer: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 3000,
      default: "",
    },

    issueDate: {
      type: String,
      default: "",
    },

    expiryDate: {
      type: String,
      default: "",
    },

    credentialId: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "",
    },

    credentialUrl: {
      type: String,
      trim: true,
      maxlength: 2048,
      default: "",
    },

    mediaUrl: {
      type: String,
      trim: true,
      maxlength: 2048,
      default: "",
    },

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
      index: true,
    },

    sortOrder: {
      type: Number,
      min: 0,
      max: 10000,
      default: 0,
    },
  },
  {
    timestamps: true,
    strict: "throw",
  }
);

certificateSchema.index({
  status: 1,
  sortOrder: 1,
  createdAt: -1,
});

module.exports = mongoose.model("Certificate", certificateSchema);
