import { Context, Logger, Schema } from "koishi";

export const name = "maimaidx";
export const using = ["database", "puppeteer"];

export interface Config {
  assetsPath: string;
}

export const Config: Schema<Config> = Schema.object({
  assetsPath: Schema.path().required().description("资源文件的存储路径"),
});

export function apply(ctx: Context, config: Config) {
  const logger = new Logger("maimaidx");
  logger.info(config);
}
