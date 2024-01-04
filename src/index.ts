import { Context, Logger, Schema } from "koishi";
import { extendDatabase, loadData } from "./database";
import { drawMusic } from "./images";
import { registerCommands } from "./commands";

export const name = "maimaidx";
export const using = ["database", "puppeteer"];

export interface Config {
  assetsPath: string;
  botName: string;
}

export const Config: Schema<Config> = Schema.object({
  assetsPath: Schema.path()
    .default(
      "https://closure-static.oss-cn-hongkong.aliyuncs.com/maimai-assets"
    )
    .description(
      "资源文件的存储路径。一般无需修改，但如果生成图片出现问题，你可以下载到本地或自建服务。请查看[文档](https://github.com/TTsdzb/koishi-plugin-maimaidx#%E6%B3%A8%E6%84%8F)。"
    ),
  botName: Schema.string()
    .default("Koishi")
    .description("生成图片时要展示的Bot名称。"),
});

export function apply(ctx: Context, config: Config) {
  const logger = new Logger("maimaidx");
  logger.info(config);

  // Register i18n
  ctx.i18n.define("zh-CN", require("./locales/zh-CN"));

  // Extend database model
  extendDatabase(ctx);

  // Load data from Diving-fish when ready
  ctx.on("ready", async () => {
    await loadData(ctx);
  });

  // Register commands provided by plugin
  registerCommands(ctx, config);

  ctx.command("test").action(async (_) => {
    return drawMusic(
      config,
      (
        await ctx.database.get("maimaidx.music_info", {
          id: 10301,
        })
      )[0],
      await ctx.database.get("maimaidx.chart_info", {
        music: 10301,
      })
    );
  });
}
