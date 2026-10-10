
const express = require("express");
const path = require("node:path");
const cors = require("cors");
const helmet = require("helmet");
const session = require("express-session");
const { MongoStore } = require("connect-mongo");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/auth.routes");
const projectRoutes = require("./routes/project.routes");
const adminProjectRoutes = require("./routes/adminProject.routes");
const certificateRoutes = require("./routes/certificate.routes");
const adminCertificateRoutes = require("./routes/adminCertificate.routes");

const profileRoutes = require("./routes/profile.routes");
const adminProfileRoutes = require("./routes/adminProfile.routes");
const skillsRoutes = require("./routes/skills.routes");
const adminSkillRoutes = require("./routes/adminSkill.routes");

const {
  generateToken,
  csrfSynchronisedProtection,
} = require("./middleware/csrf");

const app = express();
// Trust Render's reverse proxy so secure session cookies work.
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.disable("x-powered-by");

// 1. Security headers
app.use(helmet());

// 2. CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "X-CSRF-Token"],
  })
);

// 3. Parse JSON
app.use(express.json({ limit: "100kb" }));

// 4. General rate limiting
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 200,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  })
);

// 5. Session configuration
app.use(
  session({
    name: "portfolio.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: "sessions",
    }),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 8,
    },
  })
);

// 6. Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
    message: "Portfolio CMS API is running",
  });
});

// 7. Issue initial CSRF token before CSRF protection
app.get("/api/auth/csrf", (req, res, next) => {
  try {
    const csrfToken = generateToken(req);

    req.session.save((error) => {
      if (error) {
        return next(error);
      }

      res.set("Cache-Control", "no-store");

      return res.json({
        success: true,
        csrfToken,
      });
    });
  } catch (error) {
    next(error);
  }
});

// 8. CSRF protection — register once
app.use(csrfSynchronisedProtection);




// 9. Register API routes
app.use("/api/auth", authRoutes);

app.use("/api/projects", projectRoutes);
app.use("/api/admin/projects", adminProjectRoutes);

app.use("/api/certificates", certificateRoutes);
app.use("/api/admin/certificates", adminCertificateRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/admin/profile", adminProfileRoutes);

app.use("/api/skills", skillsRoutes);
app.use("/api/admin/skills", adminSkillRoutes);

// Serve the React frontend in production.
if (process.env.NODE_ENV === "production") {
  const frontendDistPath = path.resolve(
    __dirname,
    "../../frontend/dist"
  );

  // Serve built CSS, JavaScript, images, and other assets.
  app.use(express.static(frontendDistPath));

  // Support React Router URLs such as /admin/login.
  app.use((req, res, next) => {
    const isApiRequest =
      req.path === "/api" || req.path.startsWith("/api/");

    if (
      req.method === "GET" &&
      !isApiRequest &&
      req.accepts("html")
    ) {
      return res.sendFile(
        path.join(frontendDistPath, "index.html"),
        (error) => {
          if (error) next(error);
        }
      );
    }

    next();
  });
}

// 10. 404 handler — after all routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
  });
});

// 11. Central error handler — last
app.use((err, req, res, next) => {
  if (err.code === "EBADCSRFTOKEN") {
    return res.status(403).json({
      success: false,
      message: "Invalid or missing CSRF token. Refresh and try again.",
    });
  }

  console.error("Request failed:", err.message);

  if (res.headersSent) {
    return next(err);
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

module.exports = app;
