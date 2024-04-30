import { Context } from "koishi";
import { extendAlias, loadAliases } from "./types";
import MusicInfo from "./types/music";
import ChartInfo from "./types/chart";

/**
 * Extend all table on the database.
 * @param ctx Context object of Koishi
 */
export function extendDatabase(ctx: Context) {
  MusicInfo.extendDatabase(ctx);
  ChartInfo.extendDatabase(ctx);
  extendAlias(ctx);
}

/**
 * Load and store data of the plugin.
 *
 * This should be called on ready.
 * @param ctx Context object of Koishi
 */
export async function loadData(ctx: Context) {
  await ChartInfo.loadMusicAndChart(ctx);
  await loadAliases(ctx);
}
