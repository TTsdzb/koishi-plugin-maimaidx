import { Context } from "koishi";
import { Config } from "..";
import { drawMusic } from "../images";

/**
 * Provide search command.
 *
 * This is used to query songs in the database.
 * @param ctx The context of koishi
 * @param config Config object of the plugin
 */
export function registerCommandSearch(ctx: Context, config: Config) {
  // Search music by ID.
  ctx
    .command("mai.search.id <id:number>")
    .action(async ({ session }, id) => {
      // Check if the argument is properly provided.
      if (id === undefined) return session.text(".pleaseProvideId");

      // Query the database for music.
      const musics = await ctx.database.get("maimai_music_info", {
        id,
      });

      // Check if the queried music exists.
      if (musics.length === 0) return session.text(".songWithIdNotFound", [id]);
      else {
        const charts = await ctx.database.get("maimai_chart_info", {
          music: id,
        });

        return drawMusic(config, musics[0], charts);
      }
    })
    .shortcut(/^id\s?(\d{1,5})$/i, { args: ["$1"] });
}
