import { Discount } from "../models/discount.model.js";
import { AccountPackage } from "../models/account-package.model.js";
import { Account } from "../models/account.model.js";
import { paginationUtils } from "../utils/pagination.util.js";

export const discountService = {
  /**
   * Get all discounts with pagination
   */
  async getAllDiscounts(query) {
    const { page, limit, skip } = paginationUtils.getPaginationParams(query);

    const filter = {};
    if (query.isActive !== undefined) {
      filter.isActive = query.isActive === "true";
    }

    // Auto-deactivate expired discounts
    await this.deactivateExpiredDiscounts();

    const [discounts, total] = await Promise.all([
      Discount.find(filter)
        .populate("applicablePackages")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Discount.countDocuments(filter),
    ]);

    return {
      discounts,
      meta: paginationUtils.createPaginationMeta(page, limit, total),
    };
  },

  /**
   * Deactivate expired discounts
   */
  async deactivateExpiredDiscounts() {
    const now = new Date();
    await Discount.updateMany(
      {
        isActive: true,
        endDate: { $lt: now },
      },
      {
        $set: { isActive: false },
      }
    );
  },

  /**
   * Get discount by ID
   */
  async getDiscountById(discountId) {
    const discount = await Discount.findById(discountId).populate(
      "applicablePackages"
    );
    if (!discount) throw new Error("Discount not found");
    return discount;
  },

  /**
   * Create discount and apply to packages/accounts
   */
  async createDiscount(discountData) {
    console.log("Creating discount with data:", discountData);
    
    const discount = await Discount.create(discountData);
    console.log("Discount created:", discount._id);

    // Apply discount to packages and accounts
    if (discount.applicablePackages && discount.applicablePackages.length > 0) {
      console.log("Applying discount to packages:", discount.applicablePackages);
      await this.applyDiscountToPackages(
        discount.applicablePackages,
        discount.discountPercent
      );
    }

    const populated = await discount.populate("applicablePackages");
    console.log("Discount populated and returning");
    return populated;
  },

  /**
   * Update discount and reapply to packages/accounts
   */
  async updateDiscount(discountId, updateData) {
    const oldDiscount = await Discount.findById(discountId);
    if (!oldDiscount) throw new Error("Discount not found");

    // Revert old discount first
    if (oldDiscount.applicablePackages && oldDiscount.applicablePackages.length > 0) {
      await this.revertDiscountFromPackages(oldDiscount.applicablePackages);
    }

    // Update discount
    const discount = await Discount.findByIdAndUpdate(discountId, updateData, {
      new: true,
      runValidators: true,
    });

    // Apply new discount
    if (discount.applicablePackages && discount.applicablePackages.length > 0) {
      await this.applyDiscountToPackages(
        discount.applicablePackages,
        discount.discountPercent
      );
    }

    return discount.populate("applicablePackages");
  },

  /**
   * Delete discount and revert prices
   */
  async deleteDiscount(discountId) {
    const discount = await Discount.findById(discountId);
    if (!discount) throw new Error("Discount not found");

    // Revert discount from packages/accounts
    if (discount.applicablePackages && discount.applicablePackages.length > 0) {
      await this.revertDiscountFromPackages(discount.applicablePackages);
    }

    await Discount.findByIdAndDelete(discountId);
    return discount;
  },

  /**
   * Bulk delete discounts
   */
  async bulkDeleteDiscounts(discountIds) {
    if (!Array.isArray(discountIds) || discountIds.length === 0) {
      throw new Error("Discount IDs must be a non-empty array");
    }

    const discounts = await Discount.find({ _id: { $in: discountIds } });
    
    // Revert prices for each discount involved
    for (const discount of discounts) {
      if (discount.applicablePackages && discount.applicablePackages.length > 0) {
        await this.revertDiscountFromPackages(discount.applicablePackages);
      }
    }

    const result = await Discount.deleteMany({ _id: { $in: discountIds } });
    return { deletedCount: result.deletedCount };
  },

  /**
   * Apply discount to packages and their accounts
   */
  async applyDiscountToPackages(packageIds, discountPercent) {
    const packages = await AccountPackage.find({ _id: { $in: packageIds } });

    for (const pkg of packages) {
      if (pkg.mode === "RANDOM" || pkg.mode === "CLONE") {
        // For RANDOM and CLONE mode: update package price and all accounts in that package
        if (pkg.price) {
          const discountedPrice = Math.max(1, Math.round(
            pkg.price * (1 - discountPercent / 100)
          ));
          pkg.discountPrice = discountedPrice;
          await pkg.save();
        }

        // Update all accounts belonging to this package
        const accounts = await Account.find({
          packageId: pkg._id,
          status: "AVAILABLE",
        });

        for (const account of accounts) {
          if (account.price && !account.originalPrice) {
            account.originalPrice = account.price;
            account.price = Math.max(1, Math.round(
              account.price * (1 - discountPercent / 100)
            ));
            await account.save();
          }
        }
      } else if (pkg.mode === "LIST") {
        // For LIST mode: only update accounts belonging to this package
        const accounts = await Account.find({
          packageId: pkg._id,
          status: "AVAILABLE",
        });

        for (const account of accounts) {
          if (account.price && !account.originalPrice) {
            account.originalPrice = account.price;
            account.price = Math.max(1, Math.round(
              account.price * (1 - discountPercent / 100)
            ));
            await account.save();
          }
        }
      }
    }
  },

  /**
   * Revert discount from packages and their accounts
   */
  async revertDiscountFromPackages(packageIds) {
    const packages = await AccountPackage.find({ _id: { $in: packageIds } });

    for (const pkg of packages) {
      if (pkg.mode === "RANDOM" || pkg.mode === "CLONE") {
        // For RANDOM and CLONE mode: revert package price
        pkg.discountPrice = null;
        await pkg.save();

        // Revert all accounts belonging to this package
        const accounts = await Account.find({
          packageId: pkg._id,
        });

        for (const account of accounts) {
          if (account.originalPrice) {
            account.price = account.originalPrice;
            account.originalPrice = null;
            await account.save();
          }
        }
      } else if (pkg.mode === "LIST") {
        // For LIST mode: revert accounts
        const accounts = await Account.find({
          packageId: pkg._id,
        });

        for (const account of accounts) {
          if (account.originalPrice) {
            account.price = account.originalPrice;
            account.originalPrice = null;
            await account.save();
          }
        }
      }
    }
  },
};
