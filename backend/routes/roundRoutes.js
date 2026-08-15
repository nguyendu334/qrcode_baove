const express = require("express");

const router = express.Router();

const { getRounds } = require("../controllers/roundController");

router.get("/", getRounds);

module.exports = router;
