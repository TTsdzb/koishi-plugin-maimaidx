import { Context } from "koishi";
import {
  extendAlias,
  extendChartInfo,
  loadAliases,
  loadMusicAndChart,
} from "./types";
import MusicInfo from "./types/music";

/**
 * Extend all table on the database.
 * @param ctx Context object of Koishi
 */
export function extendDatabase(ctx: Context) {
  MusicInfo.extendDatabase(ctx);
  extendChartInfo(ctx);
  extendAlias(ctx);
}

/**
 * Load and store data of the plugin.
 *
 * This should be called on ready.
 * @param ctx Context object of Koishi
 */
export async function loadData(ctx: Context) {
  await loadMusicAndChart(ctx);
  await loadAliases(ctx);
}
