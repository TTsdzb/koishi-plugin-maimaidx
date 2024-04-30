import { Context, Logger } from "koishi";
import {
  ApiChartStat,
  ApiMusic,
  fetchMusic,
  fetchChartStats,
} from "./diving_fish";
import MusicInfo from "./music";

/**
 * Represents basic information of a chart (谱面).
 *
 * A music have multiple charts, and a chart refers to
 * only one music.
 */
interface ChartInfo {
  /**
   * ID of the chart.
   */
  id: number;

  /**
   * ID of the music which the chart
   * belongs to.
   */
  musicId: number;

  /**
   * The order of the chart in the music.
   */
  order: number;

  /**
   * Actual difficulty (定数) of the chart.
   */
  difficulty: number;

  /**
   * Display difficulty of the chart.
   */
  level: string;

  /**
   * Number of notes of the chart.
   */
  notes: number[];

  /**
   * Charter of the chart.
   */
  charter: string;

  /**
   * Statistic information of the chart.
   */
  stat: ApiChartStat;
}

namespace ChartInfo {
  /**
   * Extend table `maimaidx.chart_info` on the given context.
   * @param ctx The context of Koishi
   */
  export function extendDatabase(ctx: Context) {
    ctx.model.extend(
      "maimaidx.chart_info",
      {
        id: "unsigned",
        musicId: "unsigned",
        order: "unsigned",
        difficulty: "float",
        level: "string",
        notes: "json",
        charter: "string",
        stat: "json",
      },
      {
        primary: "id",
        autoInc: false,
        foreign: {
          musicId: ["maimaidx.music_info", "id"],
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
  export function fromDivingFishApiMusicAndCharts(
    music: ApiMusic,
    stats: ApiChartStat[]
  ): ChartInfo[] {
    let charts: ChartInfo[] = [];
    // The order of charts is essential so we use classic for loop.
    for (let i = 0; i < music.charts.length; i++) {
      charts.push({
        id: music.cids[i],
        musicId: music.id,
        order: i,
        difficulty: music.ds[i],
        level: music.level[i],
        notes: music.charts[i].notes,
        charter: music.charts[i].charter,
        stat: stats ? stats[i] : {},
      });
    }
    return charts;
  }

  /**
   * Load music information and chart stats from Diving-fish.
   *
   * Some information of chart is stored in `ApiMusic`,
   * so their loading function is bundled.
   * @param ctx Context of Koishi
   */
  export async function loadMusicAndChart(ctx: Context) {
    const logger = new Logger("maimaidx");

    let musics = [];
    let charts = [];

    try {
      const apiMusics = await fetchMusic(ctx);
      const apiChartStats = await fetchChartStats(ctx);

      apiMusics.forEach((apiMusic) => {
        musics.push(MusicInfo.fromDivingFishApiMusic(apiMusic));
        charts = charts.concat(
          ChartInfo.fromDivingFishApiMusicAndCharts(
            apiMusic,
            apiChartStats.charts[apiMusic.id.toString()]
          )
        );
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
}

declare module "koishi" {
  /**
   * Database table declaration.
   */
  interface Tables {
    "maimaidx.chart_info": ChartInfo;
  }
}

export default ChartInfo;
