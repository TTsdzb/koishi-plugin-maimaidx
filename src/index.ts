import { Context, Logger, Schema } from "koishi";
import { extendDatabase, loadData } from "./database";
import MaimaidxImages from "./images";
import MaimaidxDivingFishSongCover from "./song-cover/diving-fish";
import * as commands from "./commands";

export const name = "maimaidx";
export const inject = ["database", "puppeteer"];

export interface Config {
  assetsPath: string;
}

export const Config: Schema<Config> = Schema.object({
  assetsPath: Schema.path().default("https://static.closure.cc/maimai-assets"),
}).i18n({
  "zh-CN": require("./locales/zh-CN")._config,
});

export function apply(ctx: Context, config: Config) {
  ctx = ctx.isolate("maimaidxSongCover").isolate("maimaidxImages");

  const nickname = ctx.root.config.nickname
    ? ctx.root.config.nickname instanceof Array
      ? ctx.root.config.nickname.length === 0
        ? "Koishi"
        : ctx.root.config.nickname[0]
      : ctx.root.config.nickname
    : "Koishi";

  const logger = new Logger("maimaidx");
  logger.debug(config);

  // Load internal services
  ctx.plugin(MaimaidxDivingFishSongCover);
  ctx.plugin<MaimaidxImages.Config>(MaimaidxImages, {
    assetsPath: config.assetsPath,
    botName: nickname,
  });

  // Register i18n
  ctx.i18n.define("zh-CN", require("./locales/zh-CN"));

  // Extend database model
  extendDatabase(ctx);

  // Load data from Diving-fish when ready
  ctx.on("ready", async () => {
    await loadData(ctx);
  });

  // Register commands provided by plugin
  ctx.plugin(commands);
}
