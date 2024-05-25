import { Context, escapeRegExp, $ } from "koishi";

export const name = "maimaidxCommandsSearch";
export const inject = ["maimaidxSongDatabase", "maimaidxImages"];

/**
 * Provide search command.
 */
export function apply(ctx: Context) {
  const itemPerPage = 30;

  // Search music by ID.
  ctx
    .command("mai.search.id <id:posint>")
    .action(async (_, id) => {
      // Check if the argument is properly provided.
      if (id === undefined) return <i18n path=".pleaseProvideId" />;

      // Query the database for music.
      const music = await ctx.maimaidxSongDatabase.queryMusicById(id);

      // Check if the queried music exists.
      if (music === undefined)
        return <i18n path=".songWithIdNotFound">{id}</i18n>;

      // Get the charts of the music.
      const charts = await ctx.maimaidxSongDatabase.getCharts(music);

      return ctx.maimaidxImages.drawMusic(music, charts);
    })
    .shortcut(/^id\s?(\d{1,5})$/i, { args: ["$1"] });

  // Search music by title.
  ctx
    .command("mai.search.title <title:text>")
    .action(async (_, title) => {
      // Check if the argument is properly provided.
      if (title === undefined) return <i18n path=".pleaseProvideTitle" />;

      // Query the database for music.
      const musics = await ctx.maimaidxSongDatabase.queryMusicByTitle(title);

      // Check if the queried music exists.
      if (musics.length === 0)
        return <i18n path=".songWithTitleNotFound">{title}</i18n>;

      // If there's only one music, return its information.
      if (musics.length === 1) {
        const charts = await ctx.maimaidxSongDatabase.getCharts(musics[0]);

        return ctx.maimaidxImages.drawMusic(musics[0], charts);
      }

      // If there're too many results, prompt the user.
      if (musics.length >= 30)
        return (
          <i18n path="commands.mai.search.messages.tooManyResults">
            {musics.length}
          </i18n>
        );

      // There're more than one music but not too many, prompt the user.
      return (
        <>
          <i18n path="commands.mai.search.messages.followingResultsFound" />
          {ctx.maimaidxImages.drawSearchResults(musics)}
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
      const musics = await ctx.maimaidxSongDatabase.queryMusicByAlias(alias);

      // Check if the queried music exists.
      if (musics.length === 0)
        return <i18n path=".songWithAliasNotFound">{alias}</i18n>;

      // If there's only one music, return its information.
      if (musics.length === 1) {
        const charts = await ctx.maimaidxSongDatabase.getCharts(musics[0]);

        return ctx.maimaidxImages.drawMusic(musics[0], charts);
      }

      // There're more than one music, prompt the user.
      return (
        <>
          <i18n path="commands.mai.search.messages.followingResultsFound" />
          {ctx.maimaidxImages.drawSearchResults(musics)}
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

      // Query and check if queried music exists.
      const result = await ctx.maimaidxSongDatabase.queryMusicByArtistPaged(
        artist,
        page
      );
      if (result.total === 0)
        return <i18n path=".songWithArtistNotFound">{artist}</i18n>;

      // Check if overflow.
      if (result.page > result.total)
        return (
          <i18n path="commands.mai.search.messages.pageOverflow">
            <>{page}</>
            <>{result.total}</>
          </i18n>
        );

      // Return paged search result.
      return (
        <>
          <i18n path="commands.mai.search.messages.followingResultsFound" />
          {ctx.maimaidxImages.drawSearchResults(result.data, [
            {
              title: "曲师",
              font: "siyuan",
              value: (music) => music.artist,
            },
          ])}
          <i18n path="commands.mai.search.messages.page">
            <>{page}</>
            <>{result.total}</>
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

      // Query and check if queried music exists.
      const results = await ctx.maimaidxSongDatabase.queryMusicByCharterPaged(
        charter,
        page
      );
      if (results.total === 0)
        return <i18n path=".songWithCharterNotFound">{charter}</i18n>;

      // Check if overflow.
      if (page > results.total)
        return (
          <i18n path="commands.mai.search.messages.pageOverflow">
            <>{page}</>
            <>{results.total}</>
          </i18n>
        );

      // Return paged search result.
      return (
        <>
          <i18n path="commands.mai.search.messages.followingResultsFound" />
          {ctx.maimaidxImages.drawSearchResultsWithChart(results.data, [
            {
              title: "谱师",
              font: "siyuan",
              value: (music) => music.chart.charter,
            },
          ])}
          <i18n path="commands.mai.search.messages.page">
            <>{page}</>
            <>{results.total}</>
          </i18n>
        </>
      );
    })
    .shortcut(/^谱师查歌\s?(.+)\s(\d+)$/i, {
      args: ["$1"],
      options: { page: "$2" },
    })
    .shortcut(/^谱师查歌\s?(.+)$/i, { args: ["$1"] });

  // Search music by BPM.
  ctx
    .command("mai.search.bpm <low:posint> <high:posint>")
    .option("page", "-p [page:posint]", { fallback: 1 })
    .action(async ({ options }, low, high) => {
      // Check if the argument is properly provided.
      if (low === undefined || high === undefined)
        return <i18n path=".pleaseProvideBpmBounds" />;
      const page = options.page;

      // Query and check if queried music exists.
      const results = await ctx.maimaidxSongDatabase.queryMusicByBpmPaged(low, high, page);
      if (results.total === 0)
        return (
          <i18n path=".songWithBpmNotFound">
            <>{low}</>
            <>{high}</>
          </i18n>
        );

      // Check if overflow.
      if (page > results.total)
        return (
          <i18n path="commands.mai.search.messages.pageOverflow">
            <>{page}</>
            <>{results.total}</>
          </i18n>
        );

      // Return paged search result.
      return (
        <>
          <i18n path="commands.mai.search.messages.followingResultsFound" />
          {ctx.maimaidxImages.drawSearchResults(results.data, [
            {
              title: "BPM",
              font: "torus",
              value: (music) => music.bpm,
            },
          ])}
          <i18n path="commands.mai.search.messages.page">
            <>{page}</>
            <>{results.total}</>
          </i18n>
        </>
      );
    })
    .shortcut(/^BPM查歌\s?(\d+)\s(\d+)\s(\d+)$/i, {
      args: ["$1", "$2"],
      options: { page: "$3" },
    })
    .shortcut(/^BPM查歌\s?(\d+)\s(\d+)$/i, { args: ["$1", "$2"] });

  // Search music by base.
  ctx
    .command("mai.search.base <base:posint>")
    .option("page", "-p [page:posint]", { fallback: 1 })
    .action(async ({ options }, base) => {
      // Check if the argument is properly provided.
      if (base === undefined) return <i18n path=".pleaseProvideBase" />;
      const page = options.page;

      // Query and check if queried music exists.
      const results = await ctx.maimaidxSongDatabase.queryMusicByBasePaged(base, page);
      if (results.total === 0)
        return (
          <i18n path=".songWithBaseNotFound">
            <>{base}</>
            <>{base + 1}</>
          </i18n>
        );

      // Check if overflow
      if (page > results.total)
        return (
          <i18n path="commands.mai.search.messages.pageOverflow">
            <>{page}</>
            <>{results.total}</>
          </i18n>
        );

      // Return paged search result.
      return (
        <>
          <i18n path="commands.mai.search.messages.followingResultsFound" />
          {ctx.maimaidxImages.drawSearchResultsWithChart(results.data, [
            {
              title: "定数",
              font: "torus",
              value: (music) => music.chart.difficulty.toFixed(1),
            },
          ])}
          <i18n path="commands.mai.search.messages.page">
            <>{page}</>
            <>{results.total}</>
          </i18n>
        </>
      );
    })
    .shortcut(/^定数查歌\s?(\d+)\s(\d+)$/i, {
      args: ["$1"],
      options: { page: "$2" },
    })
    .shortcut(/^定数查歌\s?(\d+)$/i, { args: ["$1"] });
}
