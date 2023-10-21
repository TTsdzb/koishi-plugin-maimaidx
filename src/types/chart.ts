import { Context } from "koishi";
import { z } from "zod";
import { ApiMusic } from "./diving_fish";

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
