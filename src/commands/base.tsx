import { Context, $ } from "koishi";

export const name = "maimaidxCommandsBase";
export const inject = ["maimaidxSongDatabase", "maimaidxImages"];

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
      const musics = await ctx.maimaidxSongDatabase.queryMusicByBase(base);

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
