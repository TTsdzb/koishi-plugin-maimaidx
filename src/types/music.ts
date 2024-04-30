import { Context } from "koishi";
import { ApiMusic } from "./diving_fish";

/**
 * Represents basic information of a music (乐曲).
 *
 * Due to different IDs, SD charts and DX charts belongs
 * to different musics.
 */
interface MusicInfo {
  /**
   * ID of the music.
   */
  id: number;

  /**
   * Title of the music.
   */
  title: string;

  /**
   * Chart type of the music.
   *
   * Normally can be `SD` or `DX`.
   */
  type: string;

  /**
   * Composer of the song.
   */
  artist: string;

  /**
   * Genre of the music.
   */
  genre: string;

  /**
   * BPM of the music.
   */
  bpm: number;

  /**
   * Release date of the music.
   *
   * Usually empty.
   */
  releaseDate: string;

  /**
   * Version name of the game when the
   * music is released.
   */
  version: string;

  /**
   * Whether the song is a new one in current
   * game version.
   */
  isNew: boolean;
}

namespace MusicInfo {
  /**
   * Extend table `maimaidx.music_info` on the given context.
   * @param ctx The context of Koishi
   */
  export function extendDatabase(ctx: Context) {
    ctx.model.extend(
      "maimaidx.music_info",
      {
        id: "unsigned",
        title: "string",
        type: "string",
        artist: "string",
        genre: "string",
        bpm: "unsigned",
        releaseDate: "string",
        version: "string",
        isNew: "boolean",
      },
      {
        primary: "id",
        autoInc: false,
      }
    );
  }

  /**
   * Extract `MusicInfo` of a music from `ApiMusic`.
   * @param music Music object returned by the API
   * @returns Basic info of the music
   */
  export function fromDivingFishApiMusic(music: ApiMusic): MusicInfo {
    return {
      id: music.id,
      title: music.title,
      type: music.type,
      artist: music.basic_info.artist,
      genre: music.basic_info.genre,
      bpm: music.basic_info.bpm,
      releaseDate: music.basic_info.release_date,
      version: music.basic_info.from,
      isNew: music.basic_info.is_new,
    };
  }
}

declare module "koishi" {
  /**
   * Database table declaration.
   */
  interface Tables {
    "maimaidx.music_info": MusicInfo;
  }
}

export default MusicInfo;
