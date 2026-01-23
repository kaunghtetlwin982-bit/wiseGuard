
import { ServiceBroker } from "moleculer";
import * as dotenv from "dotenv";
import config from "../config/config";
// import userService from "../service/userSevice/service";
import vpnService from "../service/vpnService/service";

console.log("Initializing Service Broker with Redis transporter...",);

dotenv.config();
console.log("Redis Config:", {
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
});
let theBroker = new ServiceBroker(
  {
  namespace: "BlogErina",
  nodeID: "endpoint-node123444",
  logLevel: "info",

  transporter: {
    type: "Redis",
    options: {
      host: config.redis.host,
      port: Number(config.redis.port),
      password: config.redis.password,
      db: 0,
      // tls: {},
    },
  },
  cacher: {
    type: "Redis",
    options: {
      redis: {
        host: config.redis.host,
        port: Number(config.redis.port),
        password: config.redis.password,
        db: 0,
      },
    },
  },

    logger: true,
    created(broker) {
        broker.logger.info("created");
        // Load services when broker is created
        // broker.createService(userService);
        broker.createService(vpnService);
    },
    started(broker) {
        broker.logger.info("started");
    },
    stopped(broker) {
        broker.logger.info("stopped");
    },

}
);

export default  theBroker;
