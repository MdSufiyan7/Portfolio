
const express = require("express");
const requireAuth = require("../middleware/requireAuth");

const {
  listAdminSkills,
  createSkill,
  updateSkill,
  deleteSkill,
} = require("../controllers/skill.controller");

const router = express.Router();

router.use(requireAuth);

router.get("/", listAdminSkills);
router.post("/", createSkill);
router.patch("/:id", updateSkill);
router.delete("/:id", deleteSkill);

module.exports = router;
