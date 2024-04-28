import { Service } from "koishi";

/**
 * Song cover URL generation service.
 */
export abstract class MaimaidxSongCover extends Service {
  /**
   * Get the URL of given song's cover image.
   * @param id Song ID
   */
  abstract getCover(id: number): string;
}

declare module "koishi" {
  interface Context {
    maimaidxSongCover: MaimaidxSongCover;
  }
}
