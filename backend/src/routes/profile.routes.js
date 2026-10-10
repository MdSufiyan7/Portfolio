
const express = require("express");

const {
  getPublicProfile,
} = require("../controllers/profile.controller");

const router = express.Router();

router.get("/", getPublicProfile);

module.exports = router;
