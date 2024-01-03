# koishi-plugin-maimaidx

[![npm](https://img.shields.io/npm/v/koishi-plugin-maimaidx?style=flat-square)](https://www.npmjs.com/package/koishi-plugin-maimaidx)

由同名 [Hoshino](https://github.com/Ice-Cirno/HoshinoBot) 插件重写而来的国服街机音游 **舞萌 DX** 查询插件，提供歌曲、谱面信息查询，以及成绩查询（数据来自 [舞萌 DX | 中二节奏查分器](https://www.diving-fish.com/maimaidx/prober/)）。所有可用的插件功能均使用 Typescript 配合 Koishi 提供的功能重新实现。

原插件地址：<https://github.com/Yuri-YuzuChaN/maimaiDX>

## 注意

为了避免插件体积过大，所有的图片字体等资源均存储在网络上，并在生成图片时由浏览器加载。这样做的坏处是插件非常依赖浏览器缓存，请不要频繁重启 Koishi 或手动清除浏览器缓存，否则生成图片不仅很慢，还会消耗很多网络资源。

如果你无法避免经常重启 Koishi，请到原插件地址下载资源文件并配置 `assetsPath`（例：`file://D:\static` 或 `file:///home/koishi/static`）。如果游戏数据更新导致歌曲 ID 变化，你需要重新下载。

## 使用

1. 首先确认安装了 `puppeteer`（用于生成图片）、`database`（用于存储歌曲信息）服务；
2. 安装本插件；
3. （可选）在插件设置的 `botName` 中填入你的 Bot 名称；
4. 启用插件。
