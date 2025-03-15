const express = require("express");

const router = express.Router();
const creditPackage = require("../controllers/creditPackage");
const isAuth = require("../middlewares/isAuth");

router.get("/", creditPackage.getAllCreditPackages);

router.post("/", creditPackage.postCreditPackage);

router.post("/:creditPackageId", isAuth, creditPackage.postUserBuy);

router.delete("/:creditPackageId", creditPackage.deleteCreditPackage);

module.exports = router;
