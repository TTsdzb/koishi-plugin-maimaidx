import { Context, Service } from "koishi";
import * as base from "./base";
import * as music from "./music";
import * as search from "./search";

/**
 * Image generation with Puppeteer.
 */
class MaimaidxImages extends Service {
  constructor(ctx: Context, config: MaimaidxImages.Config) {
    super(ctx, "maimaidxImages", true);

    this.config = config;
  }

  drawBaseTable = base.drawBaseTable;
  drawMusicSimple = music.drawMusicSimple;
  drawMusic = music.drawMusic;
  drawSearchResults = search.drawSearchResults;
  drawSearchResultsWithChart = search.drawSearchResultsWithChart;
}

namespace MaimaidxImages {
  export const inject = ["maimaidxSongCover"];

  export interface Config {
    assetsPath: string;
    botName: string;
  }
}

declare module "koishi" {
  interface Context {
    maimaidxImages: MaimaidxImages;
  }
}

export default MaimaidxImages;
