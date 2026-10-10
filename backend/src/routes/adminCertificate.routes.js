
const express = require("express");
const requireAuth = require("../middleware/requireAuth");

const {
  listAdminCertificates,
  createCertificate,
  updateCertificate,
  deleteCertificate,
} = require("../controllers/certificate.controller");

const router = express.Router();

// All routes require an authenticated administrator.
router.use(requireAuth);

router.get("/", listAdminCertificates);
router.post("/", createCertificate);
router.patch("/:id", updateCertificate);
router.delete("/:id", deleteCertificate);

module.exports = router;
