import { accountTypeService } from "../services/account-type.service.js";
import { responseUtils } from "../utils/response.util.js";

export const accountTypeController = {
  async getAllAccountTypes(req, res, next) {
    try {
      const { accountTypes, meta } = await accountTypeService.getAllAccountTypes(req.query);
      return responseUtils.successWithMeta(res, accountTypes, meta);
    } catch (error) {
      next(error);
    }
  },

  async getAccountTypeById(req, res, next) {
    try {
      const accountType = await accountTypeService.getAccountTypeById(req.params.id);
      return responseUtils.success(res, accountType);
    } catch (error) {
      if (error.message === "Account type not found") {
        return responseUtils.notFound(res, error.message);
      }
      next(error);
    }
  },

  async createAccountType(req, res, next) {
    try {
      const accountType = await accountTypeService.createAccountType(req.body);
      return responseUtils.success(
        res,
        accountType,
        "Account type created successfully",
        201
      );
    } catch (error) {
      if (error.message.includes("already exists")) {
        return responseUtils.badRequest(res, error.message);
      }
      next(error);
    }
  },

  async updateAccountType(req, res, next) {
    try {
      const accountType = await accountTypeService.updateAccountType(
        req.params.id,
        req.body
      );
      return responseUtils.success(
        res,
        accountType,
        "Account type updated successfully"
      );
    } catch (error) {
      if (error.message === "Account type not found") {
        return responseUtils.notFound(res, error.message);
      }
      next(error);
    }
  },

  async deleteAccountType(req, res, next) {
    try {
      await accountTypeService.deleteAccountType(req.params.id);
      return responseUtils.success(res, null, "Account type deleted successfully");
    } catch (error) {
      if (error.message === "Account type not found") {
        return responseUtils.notFound(res, error.message);
      }
      if (error.message.includes("Cannot delete")) {
        return responseUtils.badRequest(res, error.message);
      }
      next(error);
    }
  },

  async bulkDeleteAccountTypes(req, res, next) {
    try {
      const { ids } = req.body;
      const result = await accountTypeService.bulkDeleteAccountTypes(ids);
      return responseUtils.success(
        res,
        result,
        `Deleted ${result.deletedCount} account type(s) successfully`
      );
    } catch (error) {
      if (error.message.includes("must be a non-empty array") || error.message.includes("Cannot delete")) {
        return responseUtils.badRequest(res, error.message);
      }
      next(error);
    }
  },
};
