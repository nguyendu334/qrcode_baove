const express = require("express");

const router = express.Router();

const controller = require("../controllers/guardController");

router.get("/", controller.getGuards);

router.post("/", controller.createGuard);

router.put("/:id", controller.updateGuard);

router.delete("/:id", controller.deleteGuard);

module.exports = router;
