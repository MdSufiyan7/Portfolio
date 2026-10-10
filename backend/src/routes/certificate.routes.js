
const express = require("express");

const {
  listPublicCertificates,
} = require("../controllers/certificate.controller");

const router = express.Router();

router.get("/", listPublicCertificates);

module.exports = router;
