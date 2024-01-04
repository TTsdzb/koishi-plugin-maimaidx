import { Context } from "koishi";
import { z } from "zod";
import { ApiMusic } from "./diving_fish";

/**
 * Scheme representing basic information of a music (乐曲).
 */
export const MusicInfo = z.object({
  id: z.number().int(),
  title: z.string(),
  type: z.string(),
  artist: z.string(),
  genre: z.string(),
  bpm: z.number().int(),
  release_date: z.string(),
  from: z.string(),
  is_new: z.boolean(),
});

export type MusicInfo = z.infer<typeof MusicInfo>;

/**
 * Declaration of interface corresponding to `MusicInfo`.
 *
 * This is specifically for the database.
 */
export interface IMusicInfo extends MusicInfo {}

declare module "koishi" {
  /**
   * Database table declaration.
   */
  interface Tables {
    "maimaidx.music_info": IMusicInfo;
  }
}

/**
 * Extend table `maimaidx.music_info` on the given context.
 * @param ctx The context of koishi
 */
export function extendMusicInfo(ctx: Context) {
  ctx.model.extend(
    "maimaidx.music_info",
    {
      id: "unsigned",
      title: "string",
      type: "string",
      artist: "string",
      genre: "string",
      bpm: "unsigned",
      release_date: "string",
      from: "string",
      is_new: "boolean",
    },
    {
      primary: "id",
      autoInc: false,
    }
  );
}

/**
 * Extract `MusicInfo` of a music from `ApiMusic`.
 * @param music Music object returned by the API
 * @returns Basic info of the music
 */
export function extractMusicInfo(music: ApiMusic): MusicInfo {
  return MusicInfo.parse({
    ...music,
    ...music.basic_info,
  });
}
