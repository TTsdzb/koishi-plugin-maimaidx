import { Context } from "koishi";
import { z } from "zod";

/**
 * Scheme for parsing alias from Xray API.
 *
 * This will be converted into another scheme
 * before storing into database.
 */
export const XrayApiAlias = z.record(z.string().array());

export type XrayApiAlias = z.infer<typeof XrayApiAlias>;

/**
 * Get all music alias from Xray API.
 * @param ctx Context object of Koishi
 * @returns Fetched alias record
 */
export async function fetchXrayMusicAlias(ctx: Context): Promise<XrayApiAlias> {
  return XrayApiAlias.parse(
    await ctx.http.get("https://download.fanyu.site/maimai/alias.json")
  );
}
