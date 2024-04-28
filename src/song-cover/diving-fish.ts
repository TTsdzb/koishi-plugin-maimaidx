import MaimaidxSongCover from ".";

export class MaimaidxDivingFishSongCover extends MaimaidxSongCover {
  getCover(id: number): string {
    return `https://www.diving-fish.com/covers/${(id > 10000 && id <= 11000
      ? id - 10000
      : id
    )
      .toString()
      .padStart(5, "0")}.png`;
  }
}

namespace MaimaidxDivingFishSongCover {
  export interface Config {}
}

declare module "koishi" {
  interface Context {
    maimaidxSongCover: MaimaidxDivingFishSongCover;
  }
}
