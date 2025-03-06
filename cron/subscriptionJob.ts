import cron from "node-cron";
import db from "../src/lib/prisma";

// Run every day at midnight (00:00)
cron.schedule("0 0 * * *", async () => {
  console.log("🔄 Checking for expired subscriptions...");

  const now = new Date();

  // Find and update expired subscriptions
  const expiredSubscriptions = await db.subscription.deleteMany({
    where: {
      endDate: { lt: now }, // If endDate < current time, mark expired
    }
  });

  console.log(`✅ ${expiredSubscriptions.count} subscriptions expired.`);
});

console.log("⏳ Subscription cron job initialized...");