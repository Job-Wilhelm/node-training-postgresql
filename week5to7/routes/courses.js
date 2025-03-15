const express = require("express");

const router = express.Router();
const config = require("../config/index");
const courses = require("../controllers/courses");
const isAuth = require("../middlewares/isAuth");

router.get("/", courses.getAllCourses);

router.post("/:courseId", isAuth, courses.postBookCourse);

router.delete("/:courseId", isAuth, courses.deleteCancelCourse);

module.exports = router;
