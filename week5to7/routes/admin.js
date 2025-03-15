const express = require("express");

const router = express.Router();
const isAuth = require("../middlewares/isAuth");
const isCouch = require("../middlewares/isCoach");
const admin = require("../controllers/admin");

//post 新增教練課程資料

router.post("/coaches/courses", isAuth, isCouch, admin.postNewCourse);

//教練get自己的所有課程

router.get("/coaches/courses", isAuth, isCouch, admin.getCoachCourses);

//教練get自己的課程詳細資料

router.get(
  "/coaches/courses/:courseId",
  isAuth,
  isCouch,
  admin.getCoachCourseDetail
);

//put 修改教練課程資料

router.put(
  "/coaches/courses/:courseId",
  isAuth,
  isCouch,
  admin.putCourseDetail
);

//post 新增教練

router.post("/coaches/:userId", admin.postEnrollCouch);

//put修改教練自己資料

router.put("/coaches", isAuth, isCouch, admin.putCoachProfile);

//get教練自己的詳細資料

router.get("/coaches", isAuth, isCouch, admin.getCoachProfile);

//get教練自己的月營收資料

router.get("/coaches/revenue", isAuth, isCouch, admin.getCoachRevenue);

module.exports = router;
