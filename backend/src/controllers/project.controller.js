
const mongoose = require("mongoose");
const Project = require("../models/Project");

const {
  projectCreateSchema,
  projectUpdateSchema,
} = require("../validators/project.validator");

function slugify(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function invalidInput(res, error) {
  return res.status(400).json({
    success: false,
    message: "Invalid project data",
    errors: error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    })),
  });
}

function handleDatabaseError(error, res, next) {
  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "A project with that slug already exists",
    });
  }

  return next(error);
}

// Public: published projects only
exports.listPublicProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({
      status: "published",
    })
      .select(
        "title slug description technologies imageUrl githubUrl liveUrl featured sortOrder createdAt updatedAt"
      )
      .sort({
        featured: -1,
        sortOrder: 1,
        createdAt: -1,
      })
      .limit(100)
      .lean();

    res.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
};

// Public: retrieve an individual published project
exports.getPublicProject = async (req, res, next) => {
  try {
    const project = await Project.findOne({
      slug: req.params.slug,
      status: "published",
    })
      .select(
        "title slug description technologies imageUrl githubUrl liveUrl featured createdAt updatedAt"
      )
      .lean();

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

// Admin: list drafts and published projects
exports.listAdminProjects = async (req, res, next) => {
  try {
    const projects = await Project.find()
      .sort({ updatedAt: -1 })
      .limit(200)
      .lean();

    res.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: create a project
exports.createProject = async (req, res, next) => {
  const parsed = projectCreateSchema.safeParse(req.body);

  if (!parsed.success) {
    return invalidInput(res, parsed.error);
  }

  const data = parsed.data;
  const slug = data.slug || slugify(data.title);

  if (!slug) {
    return res.status(400).json({
      success: false,
      message: "Provide a title that can generate a valid slug",
    });
  }

  try {
    const project = await Project.create({
      ...data,
      slug,
    });

    return res.status(201).json({
      success: true,
      data: project,
    });
  } catch (error) {
    return handleDatabaseError(error, res, next);
  }
};

// Admin: partially update a project
exports.updateProject = async (req, res, next) => {
  const parsed = projectUpdateSchema.safeParse(req.body);

  if (!parsed.success) {
    return invalidInput(res, parsed.error);
  }

  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid project ID",
    });
  }

  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: parsed.data },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    return res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    return handleDatabaseError(error, res, next);
  }
};

// Admin: delete a project
exports.deleteProject = async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid project ID",
    });
  }

  try {
    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    return res.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
