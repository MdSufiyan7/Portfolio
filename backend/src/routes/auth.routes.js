
const express = require("express");
const bcrypt = require("bcryptjs");
const rateLimit = require("express-rate-limit");
const { z } = require("zod");

const Admin = require("../models/Admin");
const { generateToken } = require("../middleware/csrf");

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Try again later.",
  },
});

const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(72),
});

// POST /api/auth/login
router.post("/login", loginLimiter, async (req, res, next) => {
  try {
    if (!req.is("application/json")) {
      return res.status(415).json({
        success: false,
        message: "Content-Type must be application/json",
      });
    }

    const parsed = loginSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email and password.",
      });
    }

    const email = parsed.data.email.toLowerCase();
    const password = parsed.data.password;

    const admin = await Admin.findOne({ email }).select("+passwordHash");

    if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Prevent session fixation by issuing a new session after login.
    req.session.regenerate((sessionError) => {
      if (sessionError) return next(sessionError);

      req.session.adminId = admin._id.toString();

      // The session has changed, so generate a fresh CSRF token.
      const csrfToken = generateToken(req, true);

      req.session.save((saveError) => {
        if (saveError) return next(saveError);

        res.set("Cache-Control", "no-store");

        return res.json({
          success: true,
          user: {
            id: admin._id.toString(),
            email: admin.email,
            role: admin.role,
          },
          csrfToken,
        });
      });
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/me
router.get("/me", async (req, res, next) => {
  try {
    if (!req.session?.adminId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const admin = await Admin.findById(req.session.adminId)
      .select("email role")
      .lean();

    if (!admin) {
      req.session.destroy(() => {});
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    res.set("Cache-Control", "no-store");

    return res.json({
      success: true,
      user: {
        id: admin._id.toString(),
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/logout
router.post("/logout", (req, res, next) => {
  req.session.destroy((error) => {
    if (error) return next(error);

    res.clearCookie("portfolio.sid", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    res.set("Cache-Control", "no-store");

    return res.json({
      success: true,
      message: "Logged out successfully",
    });
  });
});

module.exports = router;
