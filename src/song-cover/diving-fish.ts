import { Context } from "koishi";
import { MaimaidxSongCover } from ".";

class MaimaidxDivingFishSongCover extends MaimaidxSongCover {
  constructor(ctx: Context) {
    super(ctx, "maimaidxSongCover", true);
  }

  getCover(id: number): string {
    return `https://www.diving-fish.com/covers/${(id > 10000 && id <= 11000
      ? id - 10000
      : id > 1000 ? id + 10000 : id
    )
      .toString()
      .padStart(5, "0")}.png`;
  }
}

namespace MaimaidxDivingFishSongCover {}

export default MaimaidxDivingFishSongCover;
