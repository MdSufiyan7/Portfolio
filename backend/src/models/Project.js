
const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },

    technologies: {
      type: [String],
      default: [],
      validate: {
        validator: (items) =>
          items.length <= 30 &&
          items.every(
            (item) =>
              typeof item === "string" &&
              item.trim().length > 0 &&
              item.length <= 40
          ),
        message: "Invalid technologies list",
      },
    },

    imageUrl: {
      type: String,
      default: "",
      maxlength: 2048,
    },

    githubUrl: {
      type: String,
      default: "",
      maxlength: 2048,
    },

    liveUrl: {
      type: String,
      default: "",
      maxlength: 2048,
    },

    featured: {
      type: Boolean,
      default: false,
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

projectSchema.index({
  status: 1,
  featured: -1,
  sortOrder: 1,
  createdAt: -1,
});

module.exports = mongoose.model("Project", projectSchema);
