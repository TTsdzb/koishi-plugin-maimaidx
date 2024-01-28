import { Context } from "koishi";
import { extendChartInfo, extendMusicInfo, loadMusicAndChart } from "./types";

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
  await loadMusicAndChart(ctx);
}
