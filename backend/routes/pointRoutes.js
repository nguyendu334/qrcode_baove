const express = require("express");

const router = express.Router();

const controller = require("../controllers/pointController");

router.get("/", controller.getPoints);

router.get("/qr/:token", controller.getPointByToken);

router.post("/", controller.createPoint);

router.put("/:id", controller.updatePoint);

router.delete("/:id", controller.deletePoint);

module.exports = router;
