import { Context, Logger } from "koishi";
import { z } from "zod";
import { XrayApiAliases, fetchXrayMusicAliases } from "./xray";

/**
 * Schema representing an alias (别名) of a music.
 *
 * A music have multiple aliases, and an alias refers to
 * only one music.
 */
export const Alias = z.object({
  id: z.number().int().optional(),
  music: z.coerce.number().int(),
  alias: z.string(),
});

export type Alias = z.infer<typeof Alias>;

/**
 * Declaration of interface corresponding to `Alias`.
 *
 * This is specifically for the database.
 */
export interface IAlias extends Alias {}

declare module "koishi" {
  /**
   * Database table declaration.
   */
  interface Tables {
    "maimaidx.alias": IAlias;
  }
}

/**
 * Extend table `maimaidx.alias` on the given context.
 * @param ctx The context of Koishi
 */
export function extendAlias(ctx: Context) {
  ctx.model.extend(
    "maimaidx.alias",
    {
      id: "unsigned",
      music: "unsigned",
      alias: "string",
    },
    {
      primary: "id",
      autoInc: true,
      foreign: {
        music: ["maimaidx.music_info", "id"],
      },
    }
  );
}

/**
 * Extract all `Alias` from `XrayApiAliases`.
 * @param apiAliases XrayApiAliases returned by the API
 * @returns List of all aliases
 */
export function extractAliases(apiAliases: XrayApiAliases): Alias[] {
  let aliases = [];

  for (let musicId in apiAliases) {
    for (let alias of apiAliases[musicId]) {
      aliases.push(
        Alias.parse({
          music: musicId,
          alias,
        })
      );
    }
  }

  return aliases;
}

/**
 * Load music aliases from Xray API.
 * @param ctx Context of Koishi
 */
export async function loadAliases(ctx: Context) {
  const logger = new Logger("maimaidx");

  let aliases: Alias[] = [];

  try {
    aliases = extractAliases(await fetchXrayMusicAliases(ctx));
  } catch (e) {
    logger.error(`Error occurred while loading alias from Xray API:`);
    logger.error(e);
    logger.warn(
      "Switching to caches in the database. Note that if this is your first time using this plugin, you will encounter problems."
    );
    return;
  }

  await ctx.database.remove("maimaidx.alias", {});
  await ctx.database.upsert("maimaidx.alias", aliases);

  logger.info("Maimai aliases loaded.");
}
