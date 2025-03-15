const { dataSource } = require("../db/data-source");
const appError = require("../utils/appError");
const logger = require("../utils/logger")("CreditPackageController");
const {
  isValidString,
  isNumber,
  isNotUndefined,
} = require("../utils/validUtils");

const creditPackageController = {
  async getAllCreditPackages(req, res, next) {
    try {
      const creditPackage = await dataSource
        .getRepository("CreditPackage")
        .find({
          select: ["id", "name", "credit_amount", "price"],
        });
      res.status(200).json({
        status: "success",
        data: creditPackage,
      });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  },
  async postCreditPackage(req, res, next) {
    try {
      const { name, credit_amount, price } = req.body;
      if (
        !isNotUndefined(name) ||
        !isValidString(name) ||
        !isNotUndefined(credit_amount) ||
        !isNumber(credit_amount) ||
        !isNotUndefined(price) ||
        !isNumber(price)
      ) {
        next(appError(400, "欄位未填寫正確"));
        return;
      }
      const creditPurchaseRepo = await dataSource.getRepository(
        "CreditPackage"
      );
      const existPackage = await creditPurchaseRepo.find({
        where: {
          name: name,
        },
      });
      if (existPackage.length > 0) {
        next(appError(409, "資料重複"));
        return;
      }
      const newCreditPurchase = await creditPurchaseRepo.create({
        name,
        credit_amount,
        price,
      });
      const result = await creditPurchaseRepo.save(newCreditPurchase);
      res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  },
  async postUserBuy(req, res, next) {
    try {
      const { id } = req.user;
      const { creditPackageId } = req.params;
      const creditPackageRepo = dataSource.getRepository("CreditPackage");
      const creditPackage = await creditPackageRepo.findOne({
        where: {
          id: creditPackageId,
        },
      });
      if (!creditPackage) {
        next(appError(400, "ID錯誤"));
        return;
      }
      const creditPurchaseRepo = dataSource.getRepository("CreditPurchase");
      const newPurchase = await creditPurchaseRepo.create({
        user_id: id,
        credit_package_id: creditPackageId,
        purchased_credits: creditPackage.credit_amount,
        price_paid: creditPackage.price,
        purchase_at: new Date().toISOString(),
      });
      await creditPurchaseRepo.save(newPurchase);
      res.status(200).json({
        status: "success",
        data: null,
      });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  },
  async deleteCreditPackage(req, res, next) {
    try {
      const { creditPackageId } = req.params;
      if (!isNotUndefined(creditPackageId) || !isValidString(creditPackageId)) {
        next(appError(400, "欄位未填寫正確"));
        return;
      }
      const result = await dataSource
        .getRepository("CreditPackage")
        .delete(creditPackageId);
      if (result.affected === 0) {
        next(appError(400, "ID錯誤"));
        return;
      }
      res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  },
};

module.exports = creditPackageController;
