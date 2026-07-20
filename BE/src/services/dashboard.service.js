
import { Order } from "../models/order.model.js";
import { Account } from "../models/account.model.js";
import { User } from "../models/user.model.js";
import { Transaction } from "../models/transaction.model.js";

export const dashboardService = {
  async getDashboardStats() {
    const [
      totalRevenueResult,
      soldAccountsCount,
      totalUsersCount,
      recentTransactions,
      chartDataResult
    ] = await Promise.all([
      // 1. Total Revenue (Orders) - Only completed orders
      Order.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: null, total: { $sum: "$price" } } }
      ]),

      // 2. Sold Accounts Count
      Account.countDocuments({ status: "SOLD" }),

      // 3. Total System Users
      User.countDocuments({}),

      // 4. Recent Transactions
      Transaction.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("userId", "name email"),

      // 5. Chart Data (Last 90 days)
      (async () => {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 90);
        startDate.setHours(0, 0, 0, 0);

        const dailyRevenue = await Order.aggregate([
            {
              $match: {
                createdAt: { $gte: startDate },
                status: "completed",
              },
            },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "+07:00" } },
                revenue: { $sum: "$price" },
              },
            },
          ]);

        // Merge and Fill dates
        const chartData = [];
        const dataMap = new Map();
        
        dailyRevenue.forEach(item => {
           if (!dataMap.has(item._id)) dataMap.set(item._id, { date: item._id, revenue: 0, topup: 0 });
           dataMap.get(item._id).revenue = item.revenue;
        });

        // Fill missing days
        const current = new Date(startDate);
        const end = new Date();
        
        while (current <= end) {
          const year = current.getFullYear();
          const month = String(current.getMonth() + 1).padStart(2, '0');
          const day = String(current.getDate()).padStart(2, '0');
          const dateStr = `${year}-${month}-${day}`;

          if (dataMap.has(dateStr)) {
            chartData.push(dataMap.get(dateStr));
          } else {
            chartData.push({ date: dateStr, revenue: 0, topup: 0 });
          }
          current.setDate(current.getDate() + 1);
        }
        
        return chartData.sort((a, b) => a.date.localeCompare(b.date));
      })()
    ]);

    const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;
    return {
      totalRevenue,
      totalTopup: 0,
      soldAccountsCount,
      totalUsersCount,
      recentTransactions, 
      chartData: chartDataResult
    };
  }
};
