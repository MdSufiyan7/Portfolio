
const Admin = require("../models/Admin");

async function requireAuth(req, res, next) {
  try {
    const adminId = req.session?.adminId;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const admin = await Admin.findById(adminId)
      .select("_id email role")
      .lean();

    if (!admin || admin.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = requireAuth;
