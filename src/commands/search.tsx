import { Context, escapeRegExp } from "koishi";
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
    .action(async (_, id) => {
      // Check if the argument is properly provided.
      if (id === undefined) return <i18n path=".pleaseProvideId" />;

      // Query the database for music.
      const musics = await ctx.database.get("maimaidx.music_info", {
        id,
      });

      // Check if the queried music exists.
      if (musics.length === 0)
        return <i18n path=".songWithIdNotFound">{[id]}</i18n>;

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
    .action(async (_, title) => {
      // Check if the argument is properly provided.
      if (title === undefined) return <i18n path=".pleaseProvideTitle" />;

      // Query the database for music.
      const musics = await ctx.database.get("maimaidx.music_info", {
        title: { $regex: escapeRegExp(title) },
      });

      // Check if the queried music exists.
      if (musics.length === 0)
        return <i18n path=".songWithTitleNotFound">{[title]}</i18n>;

      // If there's only one music, return its information
      if (musics.length === 1) {
        const charts = await ctx.database.get("maimaidx.chart_info", {
          music: musics[0].id,
        });

        return drawMusic(config, musics[0], charts);
      }

      // If there're too many results, prompt the user.
      if (musics.length >= 30)
        return (
          <i18n path="commands.mai.search.messages.tooManyResults">
            {[musics.length]}
          </i18n>
        );

      // There're more than one music but not too many, prompt the user.
      let results = musics.map((music) => (
        <p>
          {music.id}: {music.title}
        </p>
      ));
      return (
        <>
          <i18n path="commands.mai.search.messages.followingResultsFound" />
          {results}
        </>
      );
    })
    .shortcut(/^查歌\s?(.+)$/i, { args: ["$1"] });

  // Search music by alias.
  ctx
    .command("mai.search.alias <alias:text>")
    .action(async (_, alias) => {
      // Check if the argument is properly provided.
      if (alias === undefined) return <i18n path=".pleaseProvideAlias" />;

      // Query the database for music.
      const musicAliases = await ctx.database.get("maimaidx.alias", {
        alias: { $regex: `^${escapeRegExp(alias)}$` },
      });
      const musics = await ctx.database.get(
        "maimaidx.music_info",
        musicAliases.map((alias) => alias.music)
      );

      // Check if the queried music exists.
      if (musics.length === 0)
        return <i18n path=".songWithAliasNotFound">{[alias]}</i18n>;

      // If there's only one music, return its information
      if (musics.length === 1) {
        const charts = await ctx.database.get("maimaidx.chart_info", {
          music: musics[0].id,
        });

        return drawMusic(config, musics[0], charts);
      }

      // If there're too many results, prompt the user.
      if (musics.length >= 30)
        return (
          <i18n path="commands.mai.search.messages.tooManyResults">
            {[musics.length]}
          </i18n>
        );

      // There're more than one music but not too many, prompt the user.
      let results = musics.map((music) => (
        <p>
          {music.id}: {music.title}
        </p>
      ));
      return (
        <>
          <i18n path="commands.mai.search.messages.followingResultsFound" />
          {results}
        </>
      );
    })
    .shortcut(/^(.+)是什么歌$/i, { args: ["$1"] });
}
