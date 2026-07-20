import { AccountType } from "../models/account-type.model.js";
import { AccountPackage } from "../models/account-package.model.js";
import { Account } from "../models/account.model.js";
import { paginationUtils } from "../utils/pagination.util.js";

export const accountTypeService = {
  async getAllAccountTypes(query) {
    const { page, limit, skip } = paginationUtils.getPaginationParams(query);

    const filter = {};
    if (query.isActive !== undefined) {
      filter.isActive = query.isActive === "true";
    }
    if (query.search) {
      filter.$or = [
        { code: { $regex: query.search, $options: "i" } },
        { name: { $regex: query.search, $options: "i" } },
      ];
    }

    const [accountTypes, total] = await Promise.all([
      AccountType.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      AccountType.countDocuments(filter),
    ]);

    return { accountTypes, meta: paginationUtils.createPaginationMeta(page, limit, total) };
  },

  async getAccountTypeById(id) {
    const accountType = await AccountType.findById(id);
    if (!accountType) throw new Error("Account type not found");
    return accountType;
  },

  async createAccountType(data) {
    if (data.code) data.code = data.code.toUpperCase();

    const exists = await AccountType.findOne({ code: data.code });
    if (exists) throw new Error("Account type with this code already exists");

    return AccountType.create(data);
  },

  async updateAccountType(id, data) {
    if (data.code) data.code = data.code.toUpperCase();

    const accountType = await AccountType.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!accountType) throw new Error("Account type not found");

    return accountType;
  },

  async deleteAccountType(id) {
    // Check if type is being used
    const [packageCount, accountCount] = await Promise.all([
      AccountPackage.countDocuments({ typeId: id }),
      Account.countDocuments({ typeId: id }),
    ]);

    if (packageCount > 0) {
      throw new Error(`Cannot delete: ${packageCount} packages are using this type`);
    }
    if (accountCount > 0) {
      throw new Error(`Cannot delete: ${accountCount} accounts are using this type`);
    }

    const accountType = await AccountType.findByIdAndDelete(id);
    if (!accountType) throw new Error("Account type not found");
    return accountType;
  },

  async bulkDeleteAccountTypes(typeIds) {
    if (!Array.isArray(typeIds) || typeIds.length === 0) {
      throw new Error("Account type IDs must be a non-empty array");
    }

    // Check if any types are being used
    const [packageCount, accountCount] = await Promise.all([
      AccountPackage.countDocuments({ typeId: { $in: typeIds } }),
      Account.countDocuments({ typeId: { $in: typeIds } }),
    ]);

    if (packageCount > 0) {
      throw new Error(`Cannot delete: ${packageCount} packages are using these types`);
    }
    if (accountCount > 0) {
      throw new Error(`Cannot delete: ${accountCount} accounts are using these types`);
    }

    const result = await AccountType.deleteMany({ _id: { $in: typeIds } });
    return { deletedCount: result.deletedCount };
  },
};
