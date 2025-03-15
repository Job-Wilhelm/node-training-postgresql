const app = require("../app");
const { dataSource } = require("../db/data-source");
const appError = require("../utils/appError");
const logger = require("../utils/logger")("CoachController");

const {
  isValidString,
  isValidUUID,
  isNotUndefined,
} = require("../utils/validUtils");

const coachController = {
  async getCouches(req, res, next) {
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
  },
  async getCertainCouch(req, res, next) {
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
  },
  async getCertainCouchCourses(req, res, next) {
    try {
      const { coachId } = req.params;
      if (!isNotUndefined(coachId) || !isValidString(coachId)) {
        logger.warn("欄位未填寫正確");
        next(appError(400, "欄位未填寫正確"));
        return;
      }
      const coach = await dataSource.getRepository("Coach").findOne({
        select: {
          id: true,
          user_id: true,
          User: {
            name: true,
          },
        },
        where: {
          id: coachId,
        },
        relations: {
          User: true,
        },
      });
      if (!coach) {
        logger.warn("找不到該教練");
        next(appError(400, "找不到該教練"));
        return;
      }
      logger.info(`coach: ${JSON.stringify(coach)}`);
      const courses = await dataSource.getRepository("Course").find({
        select: {
          id: true,
          name: true,
          description: true,
          start_at: true,
          max_participants: true,
          Skill: {
            name: true,
          },
        },
        where: {
          user_id: coach.user_id,
        },
        relations: {
          Skill: true,
        },
      });
      logger.info(`courses: ${JSON.stringify(courses)}`);
      res.status(200).json({
        status: "success",
        data: courses.map((course) => ({
          id: course.id,
          name: course.name,
          description: course.description,
          start_at: course.start_at,
          end_at: course.end_at,
          max_participants: course.max_participants,
          coach_name: coach.User.name,
          skill_name: course.Skill.name,
        })),
      });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  },
};

module.exports = coachController;
