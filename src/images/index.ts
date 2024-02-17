import { Context, Service } from "koishi";
import { Config } from "..";
import * as music from "./music";
import * as search from "./search";

/**
 * Image generation with Puppeteer.
 */
class MaimaidxImages extends Service {
  config: Config;

  constructor(ctx: Context, config: Config) {
    super(ctx, "maimaidxImages", true);

    this.config = config;
  }

  drawMusicSimple = music.drawMusicSimple;
  drawMusic = music.drawMusic;
  drawSearchResults = search.drawSearchResults;
  drawSearchResultsWithChart = search.drawSearchResultsWithChart;
}

namespace MaimaidxImages {
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
