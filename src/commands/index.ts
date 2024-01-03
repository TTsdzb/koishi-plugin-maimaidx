/**
 * Commands provided by the plugin.
 */

import { Context } from "koishi";
import { Config } from "..";

import { registerCommandSearch } from "./search";

/**
 * Register all commands provided by the plugin.
 * @param ctx The context of koishi
 * @param config Config object of the plugin
 */
export function registerCommands(ctx: Context, config: Config) {
  registerCommandSearch(ctx, config);
}
