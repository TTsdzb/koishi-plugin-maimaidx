import { Context, Service } from "koishi";
import { Config } from "..";

/**
 * Song cover URL generation service.
 */
abstract class MaimaidxSongCover extends Service {
  config: Config;

  constructor(ctx: Context, config: Config) {
    super(ctx, "maimaidxSongCover", true);

    this.config = config;
  }

  /**
   * Get the URL of given song's cover image.
   * @param id Song ID
   */
  abstract getCover(id: number): string;
}

export default MaimaidxSongCover;
