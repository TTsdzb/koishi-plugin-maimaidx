import { Context, Logger, Schema } from "koishi";
import { extendDatabase, loadData } from "./database";
import MaimaidxImages from "./images";
import MaimaidxDivingFishSongCover from "./song-cover/diving-fish";
import * as commands from "./commands";

export const name = "maimaidx";
export const inject = ["database", "puppeteer"];

export interface Config {
  assetsPath: string;
  botName: string;
}

export const Config: Schema<Config> = Schema.object({
  assetsPath: Schema.path().default("https://static.closure.cc/maimai-assets"),
  botName: Schema.string().default("Koishi").hidden(),
}).i18n({
  "zh-CN": require("./locales/zh-CN")._config,
});

export function apply(ctx: Context, config: Config) {
  ctx = ctx.isolate("maimaidxSongCover").isolate("maimaidxImages");

  if (ctx.root.config.nickname) {
    if (ctx.root.config.nickname instanceof Array)
      config.botName = ctx.root.config.nickname[0];
    else config.botName = ctx.root.config.nickname;
  }

  const logger = new Logger("maimaidx");
  logger.debug(config);

  ctx.plugin(MaimaidxDivingFishSongCover, config);
  ctx.plugin(MaimaidxImages, config);

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
