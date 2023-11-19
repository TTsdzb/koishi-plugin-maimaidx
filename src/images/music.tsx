import { h } from "koishi";
import { Config } from "..";
import { ChartInfo, MusicInfo } from "../types";

const category = {
  "流行&动漫": "anime",
  舞萌: "maimai",
  "niconico & VOCALOID": "niconico",
  东方Project: "touhou",
  其他游戏: "game",
  "音击&中二节奏": "ongeki",
};

export function drawMusicSimple(
  config: Config,
  music: MusicInfo,
  charts: ChartInfo[]
): h {
  let chartsH = [];

  charts.forEach((chart) => {
    chartsH.push(
      <p
        style={
          chart.order === 4
            ? "width: 82px; margin: 0 13px 0 0; color: rgb(195, 70, 231)"
            : "width: 82px; margin: 0 13px 0 0"
        }
      >
        {chart.ds.toFixed(1)}
      </p>
    );
  });

  return (
    <html
      style={`
        width: 700px;
        height: 1000px;
        margin: 0;
      `}
    >
      <head>
        <style>
          {`
            @font-face {
              font-family: "torus";
              src: url("file://${config.assetsPath}/Torus SemiBold.otf");
            }
            @font-face {
              font-family: "siyuan";
              src: url("file://${config.assetsPath}/SourceHanSansSC-Bold.otf");
            }
          `}
        </style>
      </head>
      <div
        style={`
          position: absolute;
          width: 700px;
          height: 1000px;
          background-image: url(file://${config.assetsPath}/mai/pic/music_bg.png);
          margin: 0;
        `}
      >
        <img
          style="position: absolute; left: 150px; top: 170px"
          src={`file://${config.assetsPath}/mai/pic/music-${
            category[music.genre]
          }.png`}
        />
        <img
          style="
            position: absolute;
            left: 170px;
            top: 260px;
            width: 360px;
            height: 360px;
          "
          src={`file://${config.assetsPath}/mai/cover/${music.id}.png`}
        />
        <img
          style="
            position: absolute;
            left: 435px;
            top: 585px;
            width: 94px;
            height: 35px;
          "
          src={`file://${config.assetsPath}/mai/pic/${music.type}.png`}
        />
        <hr
          style="
            position: absolute;
            left: 150px;
            top: 710px;
            width: 400px;
            height: 2px;
            background-color: white;
            margin: 0;
            border: none;
          "
        />
        <p
          style="
            position: absolute;
            left: 159px;
            top: 179px;
            width: 82px;
            height: 36px;
            line-height: 36px;
            font-size: 24px;
            font-family: torus;
            color: white;
            text-align: center;
            margin: 0;
          "
        >
          {music.id}
        </p>
        <p
          style="
            position: absolute;
            left: 279px;
            top: 179px;
            width: 262px;
            height: 36px;
            line-height: 36px;
            font-size: 22px;
            font-family: siyuan;
            color: white;
            text-align: center;
            margin: 0;
          "
        >
          {music.genre}
        </p>
        <p
          style="
            position: absolute;
            left: 0;
            top: 645px;
            width: 700px;
            height: 30px;
            line-height: 30px;
            font-size: 30px;
            font-family: siyuan;
            color: white;
            text-shadow: 1px 1px 0 black;
            text-align: center;
            margin: 0;
          "
        >
          {music.title}
        </p>
        <p
          style="
            position: absolute;
            left: 0;
            top: 684px;
            width: 700px;
            height: 12px;
            line-height: 12px;
            font-size: 12px;
            font-family: siyuan;
            color: white;
            text-shadow: 1px 1px 0 black;
            text-align: center;
            margin: 0;
          "
        >
          {music.artist}
        </p>
        <div
          style="
            position: absolute;
            left: 150px;
            top: 717px;
            width: 400px;
            height: 15px;
            line-height: 15px;
            font-size: 15px;
            font-family: siyuan;
            color: white;
            text-shadow: 1px 1px 0 black;
          "
        >
          <p style="float: left; margin: 0">Version: {music.from}</p>
          <p style="float: right; margin: 0">BPM: {music.bpm}</p>
        </div>
        <div
          style="
            display: flex;
            position: absolute;
            left: 119px;
            top: 784px;
            width: 481px;
            height: 62px;
            line-height: 62px;
            font-size: 25px;
            font-family: torus;
            color: white;
            text-align: center;
          "
        >
          {chartsH}
        </div>
        <p
          style="
            position: absolute;
            left: 0;
            top: 975px;
            width: 700px;
            height: 14px;
            line-height: 14px;
            font-size: 14px;
            font-family: siyuan;
            color: white;
            text-shadow: 0 0 2px purple;
            text-align: center;
            margin: 0;
          "
        >
          Designed by Yuri-YuzuChaN | Generated by {config.botName} BOT
        </p>
      </div>
    </html>
  );
}
