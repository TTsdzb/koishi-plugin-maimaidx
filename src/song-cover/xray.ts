import { Context, Logger } from "koishi";
import { z } from "zod";
import { MaimaidxSongCover } from ".";

const abstractDataSchema = z.record(
  z
    .object({
      user_id: z.number(),
      nickname: z.string(),
      file_name: z.string(),
    })
    .array()
);
const abstractSchema = z.object({
  abstract_data: abstractDataSchema,
  abstract: z.number().array(),
});

class MaimaidxXraySongCover extends MaimaidxSongCover {
  data: z.infer<typeof abstractDataSchema>;

  constructor(ctx: Context) {
    super(ctx, "maimaidxSongCover", false);

    ctx.on("ready", async () => {
      await this.loadData();
    });
  }

  async loadData() {
    const logger = new Logger("maimaidx");

    try {
      this.data = abstractSchema.parse(
        await this.ctx.http.get(
          "https://download.fanyu.site/maimai/abstract.json"
        )
      ).abstract_data;
    } catch (e) {
      logger.error(`Error occurred while loading Xray abstract data:`);
      logger.error(e);
      logger.warn("There will be no cover when generating images.");
      return;
    }

    logger.info("Xray abstract data loaded.");
  }

  getCover(id: number): string {
    const fallback = "https://download.fanyu.site/abstract/1000.jpg";

    if (!this.data) return fallback;

    const songData = this.data[id.toString()];
    if (!songData || songData.length === 0) return fallback;

    return `https://download.fanyu.site/abstract/${
      songData[Math.floor(Math.random() * songData.length)].file_name
    }.png`;
  }
}

namespace MaimaidxXraySongCover {
  export const inject = ["http"];
}

export default MaimaidxXraySongCover;
