import { Context, Logger } from "koishi";
import { YuzuApiAliases, fetchYuzuMusicAliases } from "./yuzu";

/**
 * Represents alias (别名) of a music.
 *
 * A music have multiple aliases, and an alias refers to
 * only one music.
 */
interface Alias {
  /**
   * ID of the alias.
   *
   * This usually only presents in the database.
   */
  id?: number;

  /**
   * ID of the music which the alias
   * refers to.
   */
  musicId: number;

  /**
   * Alias of the music.
   */
  alias: string;
}

namespace Alias {
  /**
   * Extend table `maimaidx.alias` on the given context.
   * @param ctx The context of Koishi
   */
  export function extendDatabase(ctx: Context) {
    ctx.model.extend(
      "maimaidx.alias",
      {
        id: "unsigned",
        musicId: "unsigned",
        alias: "string",
      },
      {
        primary: "id",
        autoInc: true,
        foreign: {
          musicId: ["maimaidx.music_info", "id"],
        },
      }
    );
  }

  /**
   * Extract all `Alias` from `YuzuApiAliases`.
   * @param apiAliases YuzuApiAliases returned by the API
   * @returns List of all aliases
   */
  export function fromYuzuApiAliases(apiAliases: YuzuApiAliases): Alias[] {
    const aliases: Alias[] = [];

    apiAliases.content.forEach((song) => {
      song.Alias.forEach((alias) =>
        aliases.push({
          musicId: song.SongID,
          alias,
        })
      );
    });

    return aliases;
  }

  /**
   * Load music aliases from Yuzu API.
   * @param ctx Context of Koishi
   */
  export async function loadAliases(ctx: Context) {
    const logger = new Logger("maimaidx");

    let aliases: Alias[] = [];

    try {
      aliases = Alias.fromYuzuApiAliases(await fetchYuzuMusicAliases(ctx));
    } catch (e) {
      logger.error(`Error occurred while loading alias from Yuzu API:`);
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
}

declare module "koishi" {
  /**
   * Database table declaration.
   */
  interface Tables {
    "maimaidx.alias": Alias;
  }
}

export default Alias;
