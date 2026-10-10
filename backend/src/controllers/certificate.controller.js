
const mongoose = require("mongoose");
const Certificate = require("../models/Certificate");

const {
  certificateCreateSchema,
  certificateUpdateSchema,
} = require("../validators/certificate.validator");

function sendValidationError(res, error) {
  return res.status(400).json({
    success: false,
    message: "Invalid certificate data",
    errors: error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    })),
  });
}

// Public: return published certificates only.
exports.listPublicCertificates = async (req, res, next) => {
  try {
    const certificates = await Certificate.find({
      status: "published",
    })
      .select(
        "title issuer description issueDate expiryDate credentialId credentialUrl mediaUrl sortOrder createdAt"
      )
      .sort({ sortOrder: 1, createdAt: -1 })
      .limit(100)
      .lean();

    res.json({
      success: true,
      data: certificates,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: list drafts and published certificates.
exports.listAdminCertificates = async (req, res, next) => {
  try {
    const certificates = await Certificate.find()
      .sort({ updatedAt: -1 })
      .limit(200)
      .lean();

    res.json({
      success: true,
      data: certificates,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: create a certificate.
exports.createCertificate = async (req, res, next) => {
  const parsed = certificateCreateSchema.safeParse(req.body);

  if (!parsed.success) {
    return sendValidationError(res, parsed.error);
  }

  try {
    const certificate = await Certificate.create(parsed.data);

    return res.status(201).json({
      success: true,
      data: certificate,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: update a certificate.
exports.updateCertificate = async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid certificate ID",
    });
  }

  const parsed = certificateUpdateSchema.safeParse(req.body);

  if (!parsed.success) {
    return sendValidationError(res, parsed.error);
  }

  try {
    const certificate = await Certificate.findByIdAndUpdate(
      req.params.id,
      { $set: parsed.data },
      { new: true, runValidators: true }
    );

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found",
      });
    }

    return res.json({
      success: true,
      data: certificate,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: delete a certificate.
exports.deleteCertificate = async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid certificate ID",
    });
  }

  try {
    const certificate = await Certificate.findByIdAndDelete(
      req.params.id
    );

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found",
      });
    }

    return res.json({
      success: true,
      message: "Certificate deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
