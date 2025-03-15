const express = require("express");

const router = express.Router();
const coaches = require("../controllers/coaches");

//get 教練 API
router.get("/", coaches.getCouches);

//GET教練詳細資訊

router.get("/:coachId", coaches.getCertainCouch);

//GET指定教練的課程

router.get("/:coachId/courses", coaches.getCertainCouchCourses);

module.exports = router;
