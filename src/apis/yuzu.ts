import { Context } from "koishi";
import { z } from "zod";

/**
 * Scheme for parsing alias from Yuzu API.
 *
 * This will be converted into another scheme
 * before storing into database.
 */
export const YuzuApiAliases = z.object({
  status_code: z.number(),
  content: z.array(
    z.object({
      SongID: z.number(),
      Name: z.string(),
      Alias: z.array(z.string()),
    })
  ),
});

export type YuzuApiAliases = z.infer<typeof YuzuApiAliases>;

/**
 * Get all music alias from Yuzu API.
 * @param ctx Context object of Koishi
 * @returns Fetched alias record
 */
export async function fetchYuzuMusicAliases(
  ctx: Context
): Promise<YuzuApiAliases> {
  return YuzuApiAliases.parse(
    await ctx.http.get("https://www.yuzuchan.moe/api/maimaidx/maimaidxalias")
  );
}
