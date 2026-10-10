
const express = require("express");

const {
  listPublicSkills,
} = require("../controllers/skill.controller");

const router = express.Router();

router.get("/", listPublicSkills);

module.exports = router;
