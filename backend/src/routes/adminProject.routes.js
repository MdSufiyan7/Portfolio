
const express = require("express");
const requireAuth = require("../middleware/requireAuth");

const {
  listAdminProjects,
  createProject,
  updateProject,
  deleteProject,
} = require("../controllers/project.controller");

const router = express.Router();

// All routes in this router require an authenticated administrator.
router.use(requireAuth);

router.get("/", listAdminProjects);
router.post("/", createProject);
router.patch("/:id", updateProject);
router.delete("/:id", deleteProject);

module.exports = router;
