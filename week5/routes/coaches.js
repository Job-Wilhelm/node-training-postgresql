const express = require("express");

const router = express.Router();
const { dataSource } = require("../db/data-source");
const logger = require("../utils/logger")("Coach");

const { isValidString, isValidUUID } = require("../utils/validUtils");

//get 教練 API
router.get("/", async (req, res, next) => {
  try {
    const { per, page } = req.query;
    if (!isValidString(per) || !isValidString(page)) {
      res.status(400).json({
        status: "failed",
        message: "欄位未填寫正確",
      });
      return;
    }
    const recentPer = parseInt(per);
    const recentPage = parseInt(page);
    if (recentPer <= 0 || recentPage <= 0) {
      res.status(400).json({
        status: "failed",
        message: "欄位未填寫正確",
      });
      return;
    }
    const coaches = await dataSource
      .getRepository("Coach")
      .createQueryBuilder("Coach")
      .leftJoinAndSelect("Coach.User", "User")
      .offset((recentPage - 1) * recentPer)
      .limit(recentPer)
      .select(["Coach.id AS id", "User.name AS name"])
      .getRawMany();

    res.status(200).json({
      status: "success",
      data: coaches,
    });
    return;
  } catch (error) {
    logger.error(error);
    next(error);
  }
});

//GET教練詳細資訊

router.get("/:coachId", async (req, res, next) => {
  try {
    const { coachId } = req.params;
    //兩種情況會回傳欄位未填寫正確 : 1.uuid格式錯誤 2.不是字串格式
    if (!isValidUUID(coachId) || !isValidString(coachId)) {
      res.status(400).json({
        status: "failed",
        message: "欄位未填寫正確",
      });
      return;
    }
    const coachRepo = dataSource.getRepository("Coach");
    const existingCoach = await coachRepo.findOne({ where: { id: coachId } });
    if (!existingCoach) {
      res.status(400).json({
        status: "failed",
        message: "找不到該教練",
      });
      return;
    }
    const userId = existingCoach.user_id;
    const user = await dataSource.getRepository("User").findOne({
      select: ["name", "role"],
      where: { id: userId },
    });
    res.status(200).json({
      status: "success",
      data: { user: user, coach: existingCoach },
    });
    return;
  } catch (error) {
    logger.error(error);
    next(error);
  }
});

module.exports = router;
