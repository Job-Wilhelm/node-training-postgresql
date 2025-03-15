const express = require("express");

const router = express.Router();
const config = require("../config/index");
const users = require("../controllers/users");
const isAuth = require("../middlewares/isAuth");

// 新增使用者
router.post("/signup", users.postSignup);

router.post("/login", users.postLogin);

router.get("/profile", isAuth, users.getProfile);

router.put("/profile", isAuth, users.putProfile);

router.put("/password", isAuth, users.putNewPassword);

router.get("/credit-package", isAuth, users.getPurchasedPackage);

router.get("/courses", isAuth, users.getCourseBooking);

module.exports = router;
