import { Context, Logger, Schema } from "koishi";
import { extendDatabase, loadData } from "./database";
import { drawMusic } from "./images";

export const name = "maimaidx";
export const using = ["database", "puppeteer"];

export interface Config {
  assetsPath: string;
  botName: string;
}

export const Config: Schema<Config> = Schema.object({
  assetsPath: Schema.path().required().description("资源文件的存储路径"),
  botName: Schema.string()
    .default("Koishi")
    .description("生成图片时要展示的Bot名称"),
});

export function apply(ctx: Context, config: Config) {
  const logger = new Logger("maimaidx");
  logger.info(config);

  extendDatabase(ctx);

  ctx.on("ready", async () => {
    await loadData(ctx);
  });

  ctx.command("test").action(async (_) => {
    return drawMusic(
      config,
      (
        await ctx.database.get("maimai_music_info", {
          id: 301,
        })
      )[0],
      await ctx.database.get("maimai_chart_info", {
        music: 301,
      })
    );
  });
}
