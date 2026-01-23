import * as dotenv from "dotenv"
dotenv.config();
import express from "express";
import ServiceBroker from "./broker/broker";
import indexController from "./controller/indexController";
import config from "./config/config";
import connectToDatabase from "./helper/database_helper";
import "./cron/vpnExpirationCron"; // Import cron jobs

ServiceBroker.loadService(__dirname + "/service/vpnService/service");



ServiceBroker.start().then(async() => {
 await connectToDatabase();
  const app = express();

  console.log("Something fix");
  app.use(express.json());


  app.get("/", (req: any, res: any) => {
    res.send("Welcome to Student Management System API");
  })


  app.use("/api", indexController);

  const PORT = config.port || 8000;
  app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is listening on http://0.0.0.0:${PORT}`);
});

});
