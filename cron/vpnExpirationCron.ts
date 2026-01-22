import * as cron from "node-cron";
import logic from "../service/vpnService/logic";

// Cron job to expire VPN keys every midnight at 01 second
// Format: "second minute hour day month dayOfWeek"
cron.schedule("1 0 0 * * *", async () => {
  console.log("🔄 Running VPN key expiration cron job at", new Date().toISOString());

  try {
    await logic.expireVpnKeys();
    console.log("✅ VPN key expiration completed successfully");
  } catch (error) {
    console.error("❌ Error in VPN key expiration cron job:", error);
  }
}, {
  timezone: "UTC" // You can change this to your timezone
});

console.log("⏰ VPN expiration cron job scheduled: Every midnight at 01 second UTC");

export default cron;