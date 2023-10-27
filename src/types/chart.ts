import { Context } from "koishi";
import { z } from "zod";
import { ApiChartStat, ApiMusic } from "./diving_fish";

/**
 * Scheme representing information of a chart (谱面).
 *
 * A music have multiple charts, and a chart refers to
 * only one music.
 */
export const ChartInfo = z.object({
  id: z.number().int(),
  music: z.number().int(),
  order: z.number().int(),
  ds: z.number(),
  level: z.string(),
  notes: z.number().int().array(),
  charter: z.string(),
  stat: ApiChartStat,
});

export type ChartInfo = z.infer<typeof ChartInfo>;

/**
 * Declaration of interface corresponding to `ChartInfo`.
 *
 * This is specifically for the database.
 */
export interface IChartInfo extends ChartInfo {}

declare module "koishi" {
  /**
   * Database table declaration.
   */
  interface Tables {
    maimai_chart_info: IChartInfo;
  }
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
      order: "unsigned",
      ds: "float",
      level: "string",
      notes: "json",
      charter: "string",
      stat: "json",
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
 * Extract `ChartInfo` of a music from `ApiMusic` and `ApiChartStat`.
 *
 * Note that a music contains multiple charts.
 * @param music Music object returned by the API
 * @param stats Chart stats of the music
 * @returns Basic info of the charts
 */
export function extractChartInfo(
  music: ApiMusic,
  stats: ApiChartStat[]
): ChartInfo[] {
  let charts: ChartInfo[] = [];
  for (let i = 0; i < music.charts.length; i++) {
    charts.push(
      ChartInfo.parse({
        id: music.cids[i],
        music: music.id,
        order: i,
        ds: music.ds[i],
        level: music.level[i],
        stat: stats[i],
        ...music.charts[i],
      })
    );
  }
  return charts;
}
