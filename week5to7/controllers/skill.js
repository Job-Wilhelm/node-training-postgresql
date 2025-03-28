const { dataSource } = require("../db/data-source");
const appError = require("../utils/appError");
const logger = require("../utils/logger")("SkillController");
const { isValidString, isNotUndefined } = require("../utils/validUtils");

const skillController = {
  async getAllSkills(req, res, next) {
    try {
      const skill = await dataSource.getRepository("Skill").find({
        select: ["id", "name"],
      });
      res.status(200).json({
        status: "success",
        data: skill,
      });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  },

  async postSkill(req, res, next) {
    try {
      const { name } = req.body;
      if (!isNotUndefined(name) || !isValidString(name)) {
        next(appError(400, "欄位未填寫正確"));
        return;
      }
      const skillRepo = await dataSource.getRepository("Skill");
      const existSkill = await skillRepo.find({
        where: {
          name,
        },
      });
      if (existSkill.length > 0) {
        next(appError(409, "資料重複"));
        return;
      }
      const newSkill = await skillRepo.create({
        name,
      });
      const result = await skillRepo.save(newSkill);
      res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  },

  async deleteSkill(req, res, next) {
    try {
      const { skillId } = req.params;
      if (!isNotUndefined(skillId) || !isValidString(skillId)) {
        next(appError(400, "ID錯誤"));
        return;
      }
      const result = await dataSource.getRepository("Skill").delete(skillId);
      if (result.affected === 0) {
        next(appError(400, "ID錯誤"));
        return;
      }
      res.status(200).json({
        status: "success",
      });
      res.end();
    } catch (error) {
      logger.error(error);
      next(error);
    }
  },
};

module.exports = skillController;
