import {
  Context,
  FlatKeys,
  Join2,
  Tables,
  Selection,
  Service,
  escapeRegExp,
  $,
} from "koishi";
import MusicInfo from "./types/music";
import ChartInfo from "./types/chart";
import Alias from "./types/alias";

type JoinedMusicAndChart = Join2.Output<
  Tables,
  { musicInfo: "maimaidx.music_info"; chart: "maimaidx.chart_info" }
>;

class MaimaidxSongDatabase extends Service {
  constructor(ctx: Context) {
    super(ctx, "maimaidxSongDatabase", false);

    ctx.on("maimaidx/request-game-data-refresh", async () => {
      await this.refreshGameData();
    });

    ctx.on("ready", async () => {
      // Extend all table on the database.
      MusicInfo.extendDatabase(ctx);
      ChartInfo.extendDatabase(ctx);
      Alias.extendDatabase(ctx);
      // Load data
      await ctx.parallel("maimaidx/request-game-data-refresh");
    });
  }

  /**
   * Load and store essential game data.
   */
  async refreshGameData() {
    await ChartInfo.loadMusicAndChart(this.ctx);
    await Alias.loadAliases(this.ctx);
  }

  /**
   * Execute a given query and returns the paged result of it.
   * @param selection Raw query to execute
   * @param countExecuteCallback Aggregate callback used to count items
   * @param orderBy Column used to order query result
   * @param page Queried page number, starts at `1`
   * @param limit Item limitation per page
   * @returns Paged query result of the query
   */
  protected async queryPaged<T>(
    selection: Selection<T>,
    countExecuteCallback: Selection.Callback<T, number, true>,
    orderBy: FlatKeys<T> | Selection.Callback<T>,
    page: number = 1,
    limit: number = 30
  ): Promise<MaimaidxSongDatabase.PagedQueryResult<T>> {
    // Count all items and check if queried
    // item exists.
    const items = await selection.execute(countExecuteCallback);
    if (items === 0)
      return {
        page,
        total: 0,
        limit,
        data: [],
      };

    // Count pages and check if overflow.
    const total = Math.ceil(items / limit);
    if (page > total)
      return {
        page,
        total,
        limit,
        data: [],
      };

    // Query the database for items.
    return {
      page,
      total,
      limit,
      data: (await selection
        .orderBy(orderBy)
        .limit(limit)
        .offset((page - 1) * limit)
        .execute()) as T[],
    };
  }

  /**
   * Query a music by its id.
   *
   * If music with the given id is not found,
   * returns `undefined`.
   * @param id Music id to query
   * @returns Music with the given id
   */
  async queryMusicById(id: number): Promise<MusicInfo> {
    // Query the database for music.
    const musics = await this.ctx.database.get("maimaidx.music_info", {
      id,
    });

    // Check if the queried music exists.
    if (musics.length === 0) return undefined;

    return musics[0];
  }

  /**
   * Query music by its title.
   *
   * This method matches given string in music's title,
   * and returns all music which title contains this pattern.
   * @param title Title pattern of the music to search
   * @returns All music matches the given title pattern
   */
  async queryMusicByTitle(title: string): Promise<MusicInfo[]> {
    return await this.ctx.database
      .select("maimaidx.music_info")
      .where({
        title: { $regex: escapeRegExp(title) },
      })
      .orderBy("id")
      .execute();
  }

  /**
   * Query music by alias.
   *
   * Given alias must be exact match of music's alias.
   * @param alias Alias of the music
   * @returns All music with the given alias
   */
  async queryMusicByAlias(alias: string): Promise<MusicInfo[]> {
    return (
      await this.ctx.database
        .join(
          {
            music: "maimaidx.music_info",
            alias: "maimaidx.alias",
          },
          (row) => $.eq(row.music.id, row.alias.musicId)
        )
        .where((row) => $.eq(row.alias.alias, alias))
        .orderBy((row) => row.music.id)
        .execute()
    ).map((result) => result.music);
  }

  /**
   * Query music and corresponding chart by chart's base.
   *
   * This method matches given base of the chart,
   * and returns all music and chart which chart with given base.
   * @param base Base to search
   * @returns All music and its chart matches the given base
   */
  async queryMusicByBase(base: number): Promise<JoinedMusicAndChart[]> {
    return (
      await this.ctx.database
      .join(
        {
          musicInfo: "maimaidx.music_info",
          chart: "maimaidx.chart_info",
        },
        row => $.eq(row.musicInfo.id, row.chart.musicId)
      )
      .where((row) =>
        $.and(
          $.gte(row.chart.difficulty, base),
          $.lt(row.chart.difficulty, base + 1)
        )
      )
      .orderBy((row) => row.chart.difficulty)
      .execute()
    );
  }

  /**
   * Query music by its artist.
   *
   * This method matches given string in music's artist,
   * and returns all music which artist contains this pattern.
   * @param artist Artist pattern to search
   * @param page Queried page number, starts at `1`
   * @param limit Item limitation per page
   * @returns All music matches the given artist pattern
   */
  async queryMusicByArtistPaged(
    artist: string,
    page: number = 1,
    limit: number = 30
  ): Promise<MaimaidxSongDatabase.PagedQueryResult<MusicInfo>> {
    return await this.queryPaged<MusicInfo>(
      this.ctx.database.select("maimaidx.music_info").where({
        artist: { $regex: escapeRegExp(artist) },
      }),
      (row) => $.count(row.id),
      "id",
      page,
      limit
    );
  }

  /**
   * Query music and corresponding chart by its charter.
   *
   * This method matches given string in chart's charter,
   * and returns all music and chart which charter contains this pattern.
   * @param charter Charter pattern to search
   * @param page Queried page number, starts at `1`
   * @param limit Item limitation per page
   * @returns All music matches the given charter pattern
   */
  async queryMusicByCharterPaged(
    charter: string,
    page: number = 1,
    limit: number = 30
  ): Promise<MaimaidxSongDatabase.PagedQueryResult<JoinedMusicAndChart>> {
    return await this.queryPaged<JoinedMusicAndChart>(
      this.ctx.database
        .join(
          {
            musicInfo: "maimaidx.music_info",
            chart: "maimaidx.chart_info",
          },
          (row) => $.eq(row.musicInfo.id, row.chart.musicId)
        )
        .where((row) => $.regex(row.chart.charter, escapeRegExp(charter))),
      (row) => $.count(row.chart.id),
      (row) => row.musicInfo.id,
      page,
      limit
    );
  }

  /**
   * Query music by its bpm.
   *
   * This method matches given BPM range of the music,
   * and returns all music which BPM in the given range.
   * @param low Lower bound of BPM to search
   * @param high Higher bound of BPM to search
   * @param page Queried page number, starts at `1`
   * @param limit Item limitation per page
   * @returns All music matches the given BPM range
   */
  async queryMusicByBpmPaged(
    low: number,
    high: number,
    page: number = 1,
    limit: number = 30
  ): Promise<MaimaidxSongDatabase.PagedQueryResult<MusicInfo>> {
    return await this.queryPaged<MusicInfo>(
      this.ctx.database
        .select("maimaidx.music_info")
        .where({
          bpm: { $gte: low, $lte: high },
        }),
      (row) => $.count(row.id),
      "bpm",
      page,
      limit
    );
  }

  /**
   * Query music and corresponding chart by chart's base.
   *
   * This method matches given base of the chart,
   * and returns all music and chart which chart with given base.
   * @param base Base to search
   * @param page Queried page number, starts at `1`
   * @param limit Item limitation per page
   * @returns All music and its chart matches the given base
   */
  async queryMusicByBasePaged(
    base: number,
    page: number = 1,
    limit: number = 30
  ): Promise<MaimaidxSongDatabase.PagedQueryResult<JoinedMusicAndChart>> {
    return await this.queryPaged<JoinedMusicAndChart>(
      this.ctx.database
        .join(
          {
            musicInfo: "maimaidx.music_info",
            chart: "maimaidx.chart_info",
          },
          (row) => $.eq(row.musicInfo.id, row.chart.musicId)
        )
        .where((row) => $.and($.gte(row.chart.difficulty, base), $.lt(row.chart.difficulty, base + 1))),
      (row) => $.count(row.chart.id),
      (row) => row.chart.difficulty,
      page,
      limit
    );
  }

  /**
   * Query charts for a specific music.
   * @param music Music object
   * @returns Charts of the given music
   */
  async getCharts(music: MusicInfo): Promise<ChartInfo[]> {
    return await this.ctx.database
      .select("maimaidx.chart_info")
      .where({
        musicId: music.id,
      })
      .orderBy("order")
      .execute();
  }
}

namespace MaimaidxSongDatabase {
  export const inject = ["database"];

  /**
   * Store paged query results.
   */
  export interface PagedQueryResult<T> {
    /**
     * Index of the current page, starts from `1`.
     */
    page: number;

    /**
     * Count of all pages.
     */
    total: number;

    /**
     * Item limitation per page
     */
    limit: number;

    /**
     * Real Data held in this page.
     */
    data: T[];
  }
}

export default MaimaidxSongDatabase;

declare module "koishi" {
  interface Context {
    maimaidxSongDatabase: MaimaidxSongDatabase;
  }
  interface Events {
    "maimaidx/request-game-data-refresh"(...args: any[]): void;
  }
}
