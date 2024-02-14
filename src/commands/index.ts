import { Context } from "koishi";
import * as search from "./search";

export const name = "maimaidxCommands";

/**
 * Commands provided by the plugin.
 */
export function apply(ctx: Context) {
  ctx.plugin(search);
}
