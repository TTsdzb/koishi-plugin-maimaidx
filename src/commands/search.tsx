import { Context, escapeRegExp, $ } from "koishi";
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
  const itemPerPage = 30;

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
        return <i18n path=".songWithIdNotFound">{id}</i18n>;

      // Draw and return information for the user.
      // There should be only one music when query by id.
      const charts = await ctx.database
        .select("maimaidx.chart_info")
        .where({
          music: id,
        })
        .orderBy("order")
        .execute();

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
      const musics = await ctx.database
        .select("maimaidx.music_info")
        .where({
          title: { $regex: escapeRegExp(title) },
        })
        .orderBy("id")
        .execute();

      // Check if the queried music exists.
      if (musics.length === 0)
        return <i18n path=".songWithTitleNotFound">{title}</i18n>;

      // If there's only one music, return its information
      if (musics.length === 1) {
        const charts = await ctx.database
          .select("maimaidx.chart_info")
          .where({
            music: musics[0].id,
          })
          .orderBy("order")
          .execute();

        return drawMusic(config, musics[0], charts);
      }

      // If there're too many results, prompt the user.
      if (musics.length >= 30)
        return (
          <i18n path="commands.mai.search.messages.tooManyResults">
            {musics.length}
          </i18n>
        );

      // There're more than one music but not too many, prompt the user.
      const results = musics.map((music) => (
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
      const musics = await ctx.database
        .select("maimaidx.music_info")
        .where(musicAliases.map((alias) => alias.music))
        .orderBy("id")
        .execute();

      // Check if the queried music exists.
      if (musics.length === 0)
        return <i18n path=".songWithAliasNotFound">{alias}</i18n>;

      // If there's only one music, return its information
      if (musics.length === 1) {
        const charts = await ctx.database
          .select("maimaidx.chart_info")
          .where({
            music: musics[0].id,
          })
          .orderBy("order")
          .execute();

        return drawMusic(config, musics[0], charts);
      }

      // If there're too many results, prompt the user.
      if (musics.length >= 30)
        return (
          <i18n path="commands.mai.search.messages.tooManyResults">
            {musics.length}
          </i18n>
        );

      // There're more than one music but not too many, prompt the user.
      const results = musics.map((music) => (
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

  // Search music by artist.
  ctx
    .command("mai.search.artist <artist:text>")
    .option("page", "-p [page:posint]", { fallback: 1 })
    .action(async ({ options }, artist) => {
      // Check if the argument is properly provided.
      if (artist === undefined) return <i18n path=".pleaseProvideArtist" />;
      const page = options.page;

      // Count all items and check if queried
      // music exists.
      const items = await ctx.database
        .select("maimaidx.music_info")
        .where({
          artist: { $regex: escapeRegExp(artist) },
        })
        .execute((row) => $.count(row.id));
      if (items === 0)
        return <i18n path=".songWithArtistNotFound">{artist}</i18n>;

      // Count pages and check if overflow
      const totalPages = Math.ceil(items / itemPerPage);
      if (page > totalPages)
        return (
          <i18n path="commands.mai.search.messages.pageOverflow">
            <>{page}</>
            <>{totalPages}</>
          </i18n>
        );

      // Query the database for music.
      const musics = await ctx.database
        .select("maimaidx.music_info")
        .where({
          artist: { $regex: escapeRegExp(artist) },
        })
        .orderBy("id")
        .limit(itemPerPage)
        .offset((page - 1) * itemPerPage)
        .execute();

      // If there's only one music, return its information
      if (musics.length === 1) {
        const charts = await ctx.database
          .select("maimaidx.chart_info")
          .where({
            music: musics[0].id,
          })
          .orderBy("order")
          .execute();

        return drawMusic(config, musics[0], charts);
      }

      // Return paged search result
      const results = musics.map((music) => (
        <p>
          {music.id}: {music.title}
        </p>
      ));
      return (
        <>
          <i18n path="commands.mai.search.messages.followingResultsFound" />
          {results}
          <i18n path="commands.mai.search.messages.page">
            <>{page}</>
            <>{totalPages}</>
          </i18n>
        </>
      );
    })
    .shortcut(/^曲师查歌\s?(.+)\s(\d+)$/i, {
      args: ["$1"],
      options: { page: "$2" },
    })
    .shortcut(/^曲师查歌\s?(.+)$/i, { args: ["$1"] });

  // Search music by charter.
  ctx
    .command("mai.search.charter <charter:text>")
    .option("page", "-p [page:posint]", { fallback: 1 })
    .action(async ({ options }, charter) => {
      // Check if the argument is properly provided.
      if (charter === undefined) return <i18n path=".pleaseProvideCharter" />;
      const page = options.page;

      // Count all items and check if queried
      // music exists.
      const items = await ctx.database
        .select("maimaidx.chart_info")
        .where({
          charter: { $regex: escapeRegExp(charter) },
        })
        .execute((row) => $.count(row.id));
      if (items === 0)
        return <i18n path=".songWithCharterNotFound">{charter}</i18n>;

      // Count pages and check if overflow
      const totalPages = Math.ceil(items / itemPerPage);
      if (page > totalPages)
        return (
          <i18n path="commands.mai.search.messages.pageOverflow">
            <>{page}</>
            <>{totalPages}</>
          </i18n>
        );

      // Query the database for music.
      const musics = await ctx.database
        .join(
          {
            t1: "maimaidx.music_info",
            t2: "maimaidx.chart_info",
          },
          ({ t1, t2 }) => $.eq(t1.id, t2.music)
        )
        .where({
          "t2.charter": { $regex: escapeRegExp(charter) },
        })
        .orderBy((row) => row.t1.id)
        .limit(itemPerPage)
        .offset((page - 1) * itemPerPage)
        .execute();

      // If there's only one music, return its information
      if (musics.length === 1) {
        const charts = await ctx.database
          .select("maimaidx.chart_info")
          .where({
            music: musics[0].t1.id,
          })
          .orderBy("order")
          .execute();

        return drawMusic(config, musics[0].t1, charts);
      }

      // Return paged search result
      const backgroundColors = [
        "#6fd43d",
        "#f8b709",
        "#ff818d",
        "#9f51dc",
        "#dbaaff",
      ];
      const results = musics.map((music) => (
        <tr
          style={`background-color: ${backgroundColors[music.t2.order]}; ${
            music.t2.order === 4 ? "color: #8c2cd5;" : ""
          }`}
        >
          <td style="font-family: torus">{music.t1.id}</td>
          <td>{music.t1.title}</td>
          <td>{music.t2.charter}</td>
        </tr>
      ));
      return (
        <>
          <i18n path="commands.mai.search.messages.followingResultsFound" />
          <html>
            <head>
              <style>
                {`
                  td {
                    padding: 0.5em 2em;
                  }
                  table,
                  th,
                  td {
                    border: 2px solid #c473ff;
                  }
                  @font-face {
                    font-family: "torus";
                    src: url("${config.assetsPath}/Torus SemiBold.otf");
                  }
                  @font-face {
                    font-family: "siyuan";
                    src: url("${config.assetsPath}/SourceHanSansSC-Bold.otf");
                  }
                `}
              </style>
            </head>
            <table style="font-size: 20px; border-collapse: collapse">
              <thead style="font-family: siyuan; color: #8c2cd5">
                <tr>
                  <th>乐曲ID</th>
                  <th>曲名</th>
                  <th>谱师</th>
                </tr>
              </thead>
              <tbody style="font-family: siyuan; color: white">{results}</tbody>
            </table>
          </html>
          <i18n path="commands.mai.search.messages.page">
            <>{page}</>
            <>{totalPages}</>
          </i18n>
        </>
      );
    })
    .shortcut(/^谱师查歌\s?(.+)\s(\d+)$/i, {
      args: ["$1"],
      options: { page: "$2" },
    })
    .shortcut(/^谱师查歌\s?(.+)$/i, { args: ["$1"] });
}
