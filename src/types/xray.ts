import { Context } from "koishi";
import { z } from "zod";

/**
 * Scheme for parsing alias from Xray API.
 *
 * This will be converted into another scheme
 * before storing into database.
 */
export const XrayApiAliases = z.record(z.string().array());

export type XrayApiAliases = z.infer<typeof XrayApiAliases>;

/**
 * Get all music alias from Xray API.
 * @param ctx Context object of Koishi
 * @returns Fetched alias record
 */
export async function fetchXrayMusicAliases(
  ctx: Context
): Promise<XrayApiAliases> {
  return XrayApiAliases.parse(
    await ctx.http.get("https://download.fanyu.site/maimai/alias.json")
  );
}
