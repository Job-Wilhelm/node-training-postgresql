const bcrypt = require("bcrypt");
const config = require("../config/index");
const { IsNull, In } = require("typeorm");

const { dataSource } = require("../db/data-source");
const appError = require("../utils/appError");
const { generateJWT } = require("../utils/jwtUtils");
const logger = require("../utils/logger")("UserController");
const {
  isValidString,
  isNotUndefined,
  isValidPassword,
  isValidEmailAddress,
} = require("../utils/validUtils");
const app = require("../app");
const CourseBooking = require("../entities/CourseBooking");

const userController = {
  async postSignup(req, res, next) {
    try {
      const { name, email, password } = req.body;
      // 驗證必填欄位
      if (
        !isNotUndefined(name) ||
        !isValidString(name) ||
        !isNotUndefined(email) ||
        !isValidEmailAddress(email) ||
        !isNotUndefined(password)
      ) {
        logger.warn("欄位未填寫正確");
        next(appError(400, "欄位未填寫正確"));
        return;
      }
      if (!isValidPassword(password)) {
        logger.warn(
          "建立使用者錯誤: 密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字"
        );
        next(
          appError(
            400,
            "密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字"
          )
        );
        return;
      }
      const userRepository = dataSource.getRepository("User");
      // 檢查 email 是否已存在
      const existingUser = await userRepository.findOne({
        select: ["id", "name", "password"],
        where: { email },
      });

      if (existingUser) {
        logger.warn("建立使用者錯誤: Email 已被使用");
        next(appError(409, "Email 已被使用"));
        return;
      }

      // 建立新使用者
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(password, salt);
      const newUser = userRepository.create({
        name,
        email,
        role: "USER",
        password: hashPassword,
      });

      const savedUser = await userRepository.save(newUser);
      logger.info("新建立的使用者ID:", savedUser.id);

      res.status(201).json({
        status: "success",
        data: {
          user: {
            id: savedUser.id,
            name: savedUser.name,
          },
        },
      });
    } catch (error) {
      logger.error("建立使用者錯誤:", error);
      next(error);
    }
  },
  async postLogin(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!isValidEmailAddress(email) || !isValidString(password)) {
        logger.warn("欄位未填寫正確");
        next(appError(400, "欄位未填寫正確"));
        return;
      }
      if (!isValidPassword(password)) {
        logger.warn(
          "密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字"
        );
        next(
          appError(
            400,
            "密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字"
          )
        );
        return;
      }
      const userRepo = dataSource.getRepository("User");
      const findUser = await userRepo.findOne({
        select: ["id", "name", "password"],
        where: {
          email,
        },
      });
      if (!findUser) {
        logger.warn("使用者不存在或密碼輸入錯誤");
        next(appError(400, "使用者不存在或密碼輸入錯誤"));
        return;
      }
      const isMatch = await bcrypt.compare(password, findUser.password);
      if (!isMatch) {
        logger.warn("使用者不存在或密碼輸入錯誤");
        next(appError(400, "使用者不存在或密碼輸入錯誤"));
        return;
      }
      const token = generateJWT({
        id: findUser.id,
        role: findUser.role,
      });

      res.status(201).json({
        status: "success",
        data: {
          token,
          user: {
            name: findUser.name,
          },
        },
      });
    } catch (error) {
      logger.error("登入錯誤", error);
      next(error);
    }
  },
  async getProfile(req, res, next) {
    try {
      const { id } = req.user;
      if (!isValidString(id)) {
        logger.warn("欄位未填寫正確");
        next(appError(400, "欄位未填寫正確"));
        return;
      }
      const findUser = await dataSource.getRepository("User").findOne({
        where: { id },
      });
      res.status(200).json({
        status: "success",
        data: {
          user: {
            email: findUser.email,
            name: findUser.name,
          },
        },
      });
    } catch (error) {
      logger.error("取得使用者資料錯誤", error);
      next(error);
    }
  },
  async putProfile(req, res, next) {
    try {
      const { id } = req.user;
      const { name } = req.body;
      if (!isNotUndefined(name) || !isValidString(name)) {
        logger.warn("欄位未填寫正確");
        next(appError(400, "欄位未填寫正確"));
        return;
      }
      const userRepo = dataSource.getRepository("User");
      const user = await userRepo.findOne({
        select: ["name"],
        where: {
          id,
        },
      });
      console.log(user.name, name);
      if (user.name === name) {
        next(appError(400, "使用者名稱未變更"));
        return;
      }
      const updatedResult = await userRepo.update(
        {
          name: user.name,
        },
        {
          name,
        }
      );
      if (updatedResult.affected === 0) {
        next(appError(400, "更新使用者失敗"));
        return;
      }
      const result = await userRepo.findOne({
        select: ["name"],
        where: {
          id,
        },
      });
      res.status(200).json({
        status: "success",
        data: {
          user: result,
        },
      });
    } catch (error) {
      logger.error("取得使用者資料錯誤:", error);
      next(error);
    }
  },
  async putNewPassword(req, res, next) {
    try {
      const { id } = req.user;
      const {
        password,
        new_password: newPassword,
        confirm_new_password: confirmNewPassword,
      } = req.body;
      if (
        !isNotUndefined(password) ||
        !isValidString(password) ||
        !isNotUndefined(newPassword) ||
        !isValidString(newPassword) ||
        !isNotUndefined(confirmNewPassword) ||
        !isValidString(confirmNewPassword)
      ) {
        logger.warn("欄位未填寫正確");
        next(appError(400, "欄位未填寫正確"));
        return;
      }
      if (
        !isValidPassword(password) ||
        !isValidPassword(newPassword) ||
        !isValidPassword(confirmNewPassword)
      ) {
        logger.warn(
          "密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字"
        );
        next(
          appError(
            400,
            "密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字"
          )
        );
        return;
      }
      if (newPassword === password) {
        logger.warn("新密碼不能與舊密碼相同");
        next(appError(400, "新密碼不能與舊密碼相同"));
        return;
      }
      if (newPassword !== confirmNewPassword) {
        logger.warn("新密碼與驗證新密碼不一致");
        next(appError(400, "新密碼與驗證新密碼不一致"));
        return;
      }
      const userRepo = dataSource.getRepository("User");
      const existingUser = await userRepo.findOne({
        select: ["password"],
        where: { id },
      });
      const isMatch = await bcrypt.compare(password, existingUser.password);
      if (!isMatch) {
        next(appError(400, "密碼輸入錯誤"));
        return;
      }
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(newPassword, salt);
      const updatedResult = await userRepo.update(
        { id },
        { password: hashPassword }
      );
      if (updatedResult.affected === 0) {
        next(appError(400, "更新密碼失敗"));
        return;
      }
      res.status(200).json({
        status: "success",
        data: null,
      });
    } catch (error) {
      logger.error("更新密碼錯誤", error);
      next(error);
    }
  },
  async getPurchasedPackage(req, res, next) {
    try {
      const { id } = req.user;
      const creditPurchaseRepo = dataSource.getRepository("CreditPurchase");
      const creditPurchase = await creditPurchaseRepo.find({
        select: {
          purchased_credits: true,
          price_paid: true,
          purchase_at: true,
          CreditPackage: {
            name: true,
          },
        },
        where: {
          user_id: id,
        },
        relations: {
          CreditPackage: true,
        },
      });
      res.status(200).json({
        status: "success",
        data: creditPurchase.map((item) => {
          return {
            name: item.CreditPackage.name,
            purchased_credits: item.purchased_credits,
            price_paid: parseInt(item.price_paid, 10),
            purchase_at: item.purchase_at,
          };
        }),
      });
    } catch (error) {
      logger.error("取得使用者資料錯誤", error);
      next(error);
    }
  },
  async getCourseBooking(req, res, next) {
    try {
      const { id } = req.user;
      const creditPurchaseRepo = dataSource.getRepository("CreditPurchase");
      const courseBookingRepo = dataSource.getRepository("CourseBooking");
      const userCredit = await creditPurchaseRepo.sum("purchased_credits", {
        user_id: id,
      });
      const userUsedCredit = await courseBookingRepo.count({
        where: {
          user_id: id,
          cancelled_at: IsNull(),
        },
      });
      const courseBookingList = await courseBookingRepo.find({
        select: {
          course_id: true,
          Course: {
            name: true,
            start_at: true,
            end_at: true,
            meeting_url: true,
            user_id: true,
          },
        },
        where: {
          user_id: id,
        },
        order: {
          Course: {
            start_at: "ASC",
          },
        },
        relations: {
          Course: true,
        },
      });
      const coachUserIdMap = {};
      if (courseBookingList.length > 0) {
        courseBookingList.forEach((courseBooking) => {
          coachUserIdMap[courseBooking.Course.user_id] =
            courseBooking.Course.user_id;
        });
        const userRepo = dataSource.getRepository("User");
        const coachUsers = await userRepo.find({
          select: ["id", "name"],
          where: {
            id: In(Object.values(coachUserIdMap)),
          },
        });
        coachUsers.forEach((user) => {
          coachUserIdMap[user.id] = user.name;
        });
        logger.debug(`courseBookingList: ${JSON.stringify(courseBookingList)}`);
        logger.debug(`coachUsers:${JSON.stringify(coachUsers)}`);
      }
      res.status(200).json({
        status: "success",
        data: {
          credit_remain: userCredit - userUsedCredit,
          credit_usage: userUsedCredit,
          course_booking: courseBookingList.map((courseBooking) => {
            return {
              course_id: courseBooking.course_id,
              name: courseBooking.Course.name,
              start_at: courseBooking.Course.end_at,
              end_at: courseBooking.Course.end_at,
              meeting_url: courseBooking.Course.meeting_url,
              coach_name: coachUserIdMap[courseBooking.Course.user_id],
            };
          }),
        },
      });
    } catch (error) {
      logger.error("取得使用者課程錯誤", error);
      next(error);
    }
  },
};

module.exports = userController;
