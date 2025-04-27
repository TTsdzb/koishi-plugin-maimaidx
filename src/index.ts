import { Context, Logger, Schema } from "koishi";
import MaimaidxImages from "./images";
import MaimaidxDivingFishSongCover from "./song-cover/diving-fish";
import MaimaidxLocalSongCover from "./song-cover/local";
import MaimaidxXraySongCover from "./song-cover/xray";
import MaimaidxSongDatabase from "./song-database";
import * as commands from "./commands";

export const name = "maimaidx";
export const inject = ["http", "database", "puppeteer"];

export interface Config {
  assetsPath: string;
  coverProvider: "local" | "diving-fish" | "xray";
}

export const Config: Schema<Config> = Schema.object({
  assetsPath: Schema.path().required(),
  coverProvider: Schema.union([
    Schema.const("local"),
    Schema.const("diving-fish"),
    Schema.const("xray"),
  ])
    .role("radio")
    .default("local"),
}).i18n({
  "zh-CN": require("./locales/zh-CN")._config,
});

export function apply(ctx: Context, config: Config) {
  ctx = ctx
    .isolate("maimaidxSongCover")
    .isolate("maimaidxImages")
    .isolate("maimaidxSongDatabase");

  const nickname = ctx.root.config.nickname
    ? ctx.root.config.nickname instanceof Array
      ? ctx.root.config.nickname.length === 0
        ? "Koishi"
        : ctx.root.config.nickname[0]
      : ctx.root.config.nickname
    : "Koishi";

  const logger = new Logger("maimaidx");
  logger.debug(config);
  logger.debug(`Bot nickname: ${nickname}`);

  // Register i18n
  ctx.i18n.define("zh-CN", require("./locales/zh-CN"));

  // Load internal services
  switch (config.coverProvider) {
    case "local":
      ctx.plugin<MaimaidxLocalSongCover.Config>(MaimaidxLocalSongCover, {
        assetsPath: config.assetsPath,
      });
      break;
    case "xray":
      ctx.plugin(MaimaidxXraySongCover);
      break;
    case "diving-fish":
    default:
      ctx.plugin(MaimaidxDivingFishSongCover);
      break;
  }
  ctx.plugin<MaimaidxImages.Config>(MaimaidxImages, {
    assetsPath: config.assetsPath,
    botName: nickname,
  });
  ctx.plugin(MaimaidxSongDatabase);

  // Register commands provided by plugin
  ctx.plugin(commands);
}
