import { Context, Logger, Schema } from "koishi";
import { extendDatabase, loadData } from "./database";
import MaimaidxImages from "./images";
import * as commands from "./commands";

export const name = "maimaidx";
export const inject = ["database"];

export interface Config {
  assetsPath: string;
  botName: string;
}

export const Config: Schema<Config> = Schema.object({
  assetsPath: Schema.path()
    .default("https://static.closure.cc/maimai-assets")
    .description(
      "资源文件的存储路径。一般无需修改，但如果生成图片出现问题，你可以下载到本地或自建服务。请查看[文档](https://github.com/TTsdzb/koishi-plugin-maimaidx#%E6%B3%A8%E6%84%8F)。"
    ),
  botName: Schema.string()
    .default("Koishi")
    .description("生成图片时要展示的Bot名称。"),
});

export function apply(ctx: Context, config: Config) {
  ctx = ctx.isolate(["maimaidxImages"]);

  const logger = new Logger("maimaidx");
  logger.debug(config);

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
