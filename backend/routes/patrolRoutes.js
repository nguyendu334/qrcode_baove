const express = require("express");

const router = express.Router();

const controller = require("../controllers/patrolController");

router.post("/check", controller.checkPatrol);

router.get("/history", controller.getHistory);

router.get("/history/month", controller.getMonthlyHistory);

router.get("/dashboard", controller.getDashboard);

module.exports = router;
