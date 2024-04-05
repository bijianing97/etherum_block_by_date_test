import { logger } from "./logger";
import moment from "moment";
import EthDater from "ethereum-block-by-date";
import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

class Test {
  private ethDater: EthDater;

  constructor() {}

  private awake?: () => void;
  private interval = 3600;

  private async _work() {
    const hourAgo = moment.utc().subtract(1, "hour");
    const block = await this.ethDater.getDate(hourAgo.toDate());
    logger.info("Test", "blockNumber:", block);
  }

  private async work() {
    while (true) {
      // calculate sleep interval
      const now = Math.floor(Date.now() / 1000);
      const next = Math.ceil(now / this.interval) * this.interval;
      const interval = next - now;

      logger.info("Test", "interval:", interval, "next:", next);

      // sleep a while...
      await new Promise<void>((r) =>
        setTimeout((this.awake = r), interval * 1000)
      ).finally(() => (this.awake = undefined));

      try {
        await this._work();
      } catch (err) {
        logger.error("LiquidateInfo", "catch error:", err);
      }

      // sleep a while...
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  async init() {
    this.ethDater = new EthDater(
      new ethers.providers.JsonRpcProvider(process.env.PROVIDER)
    );
  }

  async start() {
    this.work();
  }
}

(async () => {
  const test = new Test();
  await test.init();
  await test.start();
})();
