
const express = require("express");

const {
  listPublicProjects,
  getPublicProject,
} = require("../controllers/project.controller");

const router = express.Router();

router.get("/", listPublicProjects);
router.get("/:slug", getPublicProject);

module.exports = router;
