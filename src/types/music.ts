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

/**
 * Scheme representing information of a chart (谱面).
 *
 * A music have multiple charts, and a chart refers to
 * only one music.
 */
export const ChartInfo = z.object({
  id: z.number().int(),
  music: z.number().int(),
  ds: z.number(),
  level: z.string(),
  notes: z.number().int().array(),
  charter: z.string(),
});

export type ChartInfo = z.infer<typeof ChartInfo>;
export type MusicInfo = z.infer<typeof MusicInfo>;

/**
 * Declaration of interface corresponding to `ChartInfo`.
 *
 * This is specifically for the database.
 */
export interface IChartInfo extends ChartInfo {}

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
    maimai_music_info: IMusicInfo;
    maimai_chart_info: IChartInfo;
  }
}

/**
 * Extend table `maimai_music_info` on the given context.
 * @param ctx The context of koishi
 */
export function extendMusicInfo(ctx: Context) {
  ctx.model.extend(
    "maimai_music_info",
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
 * Extend table `maimai_chart_info` on the given context.
 * @param ctx The context of koishi
 */
export function extendChartInfo(ctx: Context) {
  ctx.model.extend(
    "maimai_chart_info",
    {
      id: "unsigned",
      music: "unsigned",
      ds: "float",
      level: "string",
      notes: "json",
      charter: "string",
    },
    {
      primary: "id",
      autoInc: false,
      foreign: {
        music: ["maimai_music_info", "id"],
      },
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

/**
 * Extract `ChartInfo` of a music from `ApiMusic`.
 *
 * Note that a music contains multiple charts.
 * @param music Music object returned by the API
 * @returns Basic info of the charts
 */
export function extractChartInfo(music: ApiMusic): ChartInfo[] {
  let charts: ChartInfo[] = [];
  for (let i = 0; i < music.charts.length; i++) {
    charts.push(
      ChartInfo.parse({
        id: music.cids[i],
        music: music.id,
        ds: music.ds[i],
        level: music.level[i],
        ...music.charts[i],
      })
    );
  }
  return charts;
}
