
const express = require("express");
const requireAuth = require("../middleware/requireAuth");

const {
  getAdminProfile,
  updateProfile,
} = require("../controllers/profile.controller");

const router = express.Router();

// Protect every route below this line.
router.use(requireAuth);

router.get("/", getAdminProfile);
router.patch("/", updateProfile);

module.exports = router;
