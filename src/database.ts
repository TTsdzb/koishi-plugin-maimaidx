import { Context, Logger } from "koishi";
import {
  extendChartInfo,
  extendMusicInfo,
  extractMusicInfo,
  extractChartInfo,
  loadChartStats,
  loadMusic,
} from "./types";

/**
 * Extend all table on the database.
 * @param ctx Context object of Koishi
 */
export function extendDatabase(ctx: Context) {
  extendMusicInfo(ctx);
  extendChartInfo(ctx);
}

/**
 * Load and store data of the plugin.
 *
 * This should be called on ready.
 * @param ctx Context object of Koishi
 */
export async function loadData(ctx: Context) {
  const logger = new Logger("maimaidx");

  let musics = [];
  let charts = [];

  try {
    const apiMusics = await loadMusic(ctx);
    const apiChartStats = await loadChartStats(ctx);

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

  await ctx.database.remove("maimai_chart_info", {});
  await ctx.database.remove("maimai_music_info", {});

  await ctx.database.upsert("maimai_music_info", musics);
  await ctx.database.upsert("maimai_chart_info", charts);

  logger.info("Maimai data loaded.");
}
