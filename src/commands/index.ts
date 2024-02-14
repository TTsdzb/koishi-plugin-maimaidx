import { Context } from "koishi";
import { registerCommandSearch } from "./search";

export const name = "maimaidxCommands";
export const inject = ["maimaidxImages"];

/**
 * Commands provided by the plugin.
 */
export function apply(ctx: Context) {
  registerCommandSearch(ctx);
}
