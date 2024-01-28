import { Context, Logger } from "koishi";
import { z } from "zod";
import {
  ApiChartStat,
  ApiMusic,
  fetchMusic,
  fetchChartStats,
} from "./diving_fish";
import { extractMusicInfo } from "./music";

/**
 * Scheme representing information of a chart (谱面).
 *
 * A music have multiple charts, and a chart refers to
 * only one music.
 */
export const ChartInfo = z.object({
  id: z.number().int(),
  music: z.number().int(),
  order: z.number().int(),
  ds: z.number(),
  level: z.string(),
  notes: z.number().int().array(),
  charter: z.string(),
  stat: ApiChartStat,
});

export type ChartInfo = z.infer<typeof ChartInfo>;

/**
 * Declaration of interface corresponding to `ChartInfo`.
 *
 * This is specifically for the database.
 */
export interface IChartInfo extends ChartInfo {}

declare module "koishi" {
  /**
   * Database table declaration.
   */
  interface Tables {
    "maimaidx.chart_info": IChartInfo;
  }
}

/**
 * Extend table `maimaidx.chart_info` on the given context.
 * @param ctx The context of koishi
 */
export function extendChartInfo(ctx: Context) {
  ctx.model.extend(
    "maimaidx.chart_info",
    {
      id: "unsigned",
      music: "unsigned",
      order: "unsigned",
      ds: "float",
      level: "string",
      notes: "json",
      charter: "string",
      stat: "json",
    },
    {
      primary: "id",
      autoInc: false,
      foreign: {
        music: ["maimaidx.music_info", "id"],
      },
    }
  );
}

/**
 * Extract `ChartInfo` of a music from `ApiMusic` and `ApiChartStat`.
 *
 * Note that a music contains multiple charts.
 * @param music Music object returned by the API
 * @param stats Chart stats of the music
 * @returns Basic info of the charts
 */
export function extractChartInfo(
  music: ApiMusic,
  stats: ApiChartStat[]
): ChartInfo[] {
  let charts: ChartInfo[] = [];
  for (let i = 0; i < music.charts.length; i++) {
    charts.push(
      ChartInfo.parse({
        id: music.cids[i],
        music: music.id,
        order: i,
        ds: music.ds[i],
        level: music.level[i],
        stat: stats ? stats[i] : {},
        ...music.charts[i],
      })
    );
  }
  return charts;
}

/**
 * Load music information and chart stats from Diving-fish.
 *
 * Some information of chart is stored in `ApiMusic`,
 * so their loading function is bundled.
 * @param ctx Context of koishi
 */
export async function loadMusicAndChart(ctx: Context) {
  const logger = new Logger("maimaidx");

  let musics = [];
  let charts = [];

  try {
    const apiMusics = await fetchMusic(ctx);
    const apiChartStats = await fetchChartStats(ctx);

    apiMusics.forEach((apiMusic) => {
      musics.push(extractMusicInfo(apiMusic));
      charts = [
        ...charts,
        ...extractChartInfo(
          apiMusic,
          apiChartStats.charts[apiMusic.id.toString()]
        ),
      ];
    });
  } catch (e) {
    logger.error(`Error occurred while loading data from API:`);
    logger.error(e);
    logger.warn(
      "Switching to caches in the database. Note that if this is your first time using this plugin, you will encounter problems."
    );
    return;
  }

  await ctx.database.remove("maimaidx.chart_info", {});
  await ctx.database.remove("maimaidx.music_info", {});

  await ctx.database.upsert("maimaidx.music_info", musics);
  await ctx.database.upsert("maimaidx.chart_info", charts);

  logger.info("Maimai data loaded.");
}
