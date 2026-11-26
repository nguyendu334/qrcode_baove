const express = require("express");

const router = express.Router();

const {
  getRounds,
  updatePatrolRound,
  createPatrolRound,
} = require("../controllers/roundController");

router.get("/", getRounds);
router.put("/:id", updatePatrolRound);
router.post("/rounds", createPatrolRound);

module.exports = router;
