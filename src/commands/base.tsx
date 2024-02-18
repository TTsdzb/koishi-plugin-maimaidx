import { Context, $ } from "koishi";

export const name = "maimaidxCommandsBase";
export const inject = ["maimaidxImages"];

/**
 * Provide base command.
 */
export function apply(ctx: Context) {
  ctx
    .command("mai.base <base:posint>")
    .action(async (_, base) => {
      // Check if the argument is properly provided.
      if (base === undefined) return <i18n path=".pleaseProvideBase" />;

      // Query the database for music.
      const musics = await ctx.database
        .join(
          {
            musicInfo: "maimaidx.music_info",
            chart: "maimaidx.chart_info",
          },
          ({ musicInfo, chart }) => $.eq(musicInfo.id, chart.music)
        )
        .where((row) =>
          $.and($.gte(row.chart.ds, base), $.lt(row.chart.ds, base + 1))
        )
        .orderBy((row) => row.chart.ds)
        .execute();

      // Check if the queried music exists.
      if (musics.length === 0)
        return (
          <i18n path=".songWithBaseNotFound">
            <>{base}</>
            <>{base + 1}</>
          </i18n>
        );

      // Return image
      return ctx.maimaidxImages.drawBaseTable(musics, base.toString());
    })
    .shortcut(/^(\d+)\s?定数表$/i, { args: ["$1"] });
}
