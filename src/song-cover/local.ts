import { Context } from "koishi";
import { MaimaidxSongCover } from ".";

class MaimaidxLocalSongCover extends MaimaidxSongCover {
  constructor(ctx: Context, config: MaimaidxLocalSongCover.Config) {
    super(ctx, "maimaidxSongCover", true);

    this.config = config;
  }

  getCover(id: number): string {
    return `${this.config.assetsPath}/mai/cover/${(id > 10000 && id <= 11000
      ? id - 10000
      : id
    )
      .toString()
      .padStart(5, "0")}.png`;
  }
}

namespace MaimaidxLocalSongCover {
  export interface Config {
    assetsPath: string;
  }
}

export default MaimaidxLocalSongCover;
