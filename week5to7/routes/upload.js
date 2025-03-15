const express = require("express");
const uploadController = require("../controllers/upload");
const isAuth = require("../middlewares/isAuth");
const uploadImage = require("../middlewares/uploadImage");

const router = express.Router();

router.post("/", isAuth, uploadImage, uploadController.postUploadImage);

module.exports = router;
