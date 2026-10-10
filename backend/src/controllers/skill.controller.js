
const mongoose = require("mongoose");
const Skill = require("../models/Skill");

const {
  skillCreateSchema,
  skillUpdateSchema,
} = require("../validators/skill.validator");

function sendValidationError(res, error) {
  return res.status(400).json({
    success: false,
    message: "Invalid skill data",
    errors: error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    })),
  });
}

// Public visitors only see published skills.
exports.listPublicSkills = async (req, res, next) => {
  try {
    const skills = await Skill.find({
      status: "published",
    })
      .select(
        "name category description proficiency sortOrder createdAt updatedAt"
      )
      .sort({ category: 1, sortOrder: 1, name: 1 })
      .limit(200)
      .lean();

    return res.json({
      success: true,
      data: skills,
    });
  } catch (error) {
    return next(error);
  }
};

// The admin can see drafts too.
exports.listAdminSkills = async (req, res, next) => {
  try {
    const skills = await Skill.find()
      .sort({ category: 1, sortOrder: 1, name: 1 })
      .limit(300)
      .lean();

    return res.json({
      success: true,
      data: skills,
    });
  } catch (error) {
    return next(error);
  }
};

exports.createSkill = async (req, res, next) => {
  const parsed = skillCreateSchema.safeParse(req.body);

  if (!parsed.success) {
    return sendValidationError(res, parsed.error);
  }

  try {
    const skill = await Skill.create(parsed.data);

    return res.status(201).json({
      success: true,
      data: skill,
    });
  } catch (error) {
    return next(error);
  }
};

exports.updateSkill = async (req, res, next) => {
  const parsed = skillUpdateSchema.safeParse(req.body);

  if (!parsed.success) {
    return sendValidationError(res, parsed.error);
  }

  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid skill ID",
    });
  }

  try {
    const skill = await Skill.findByIdAndUpdate(
      req.params.id,
      { $set: parsed.data },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: "Skill not found",
      });
    }

    return res.json({
      success: true,
      data: skill,
    });
  } catch (error) {
    return next(error);
  }
};

exports.deleteSkill = async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid skill ID",
    });
  }

  try {
    const skill = await Skill.findByIdAndDelete(req.params.id);

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: "Skill not found",
      });
    }

    return res.json({
      success: true,
      message: "Skill deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
};
