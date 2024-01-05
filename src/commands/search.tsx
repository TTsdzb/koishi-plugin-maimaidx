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
    .command("mai.search.id <id:posint>")
    .action(async ({ session }, id) => {
      // Check if the argument is properly provided.
      if (id === undefined) return session.text(".pleaseProvideId");

      // Query the database for music.
      const musics = await ctx.database.get("maimaidx.music_info", {
        id,
      });

      // Check if the queried music exists.
      if (musics.length === 0) return session.text(".songWithIdNotFound", [id]);

      // Draw and return information for the user.
      // There should be only one music when query by id.
      const charts = await ctx.database.get("maimaidx.chart_info", {
        music: id,
      });

      return drawMusic(config, musics[0], charts);
    })
    .shortcut(/^id\s?(\d{1,5})$/i, { args: ["$1"] });

  // Search music by title.
  ctx
    .command("mai.search.title <title:text>")
    .action(async ({ session }, title) => {
      // Check if the argument is properly provided.
      if (title === undefined) return session.text(".pleaseProvideTitle");

      // Query the database for music.
      const musics = await ctx.database.get("maimaidx.music_info", {
        title: { $regex: `.*${title}.*` },
      });

      // Check if the queried music exists.
      if (musics.length === 0)
        return session.text(".songWithTitleNotFound", [title]);

      // If there's only one music, return its information
      if (musics.length === 1) {
        const charts = await ctx.database.get("maimaidx.chart_info", {
          music: musics[0].id,
        });

        return drawMusic(config, musics[0], charts);
      }

      // If there're too many results, prompt the user.
      if (musics.length >= 30)
        return session.text(".tooManyResults", [musics.length]);

      // There're more than one music but not too many, prompt the user.
      let results = [];
      musics.forEach((music) => {
        results.push(
          <p>
            {music.id}: {music.title}
          </p>
        );
      });
      return (
        <>
          <i18n path=".followingResultsFound" />
          {results}
        </>
      );
    });
}
