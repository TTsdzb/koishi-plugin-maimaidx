# koishi-plugin-maimaidx

[![npm](https://img.shields.io/npm/v/koishi-plugin-maimaidx?style=flat-square)](https://www.npmjs.com/package/koishi-plugin-maimaidx)

由同名 [Hoshino](https://github.com/Ice-Cirno/HoshinoBot) 插件重写而来的国服街机音游 **舞萌 DX** 查询插件，提供歌曲、谱面信息查询，以及成绩查询（数据来自 [舞萌 DX | 中二节奏查分器](https://www.diving-fish.com/maimaidx/prober/)）。所有可用的插件功能均使用 Typescript 配合 Koishi 提供的功能重新实现。

原插件地址：<https://github.com/Yuri-YuzuChaN/maimaiDX>

## 使用

1. 首先确认安装了 `puppeteer`（用于生成图片）、`database`（用于存储歌曲信息）服务；
2. 下载静态资源并将其解压，得到名为 `static` 的文件夹；
3. 安装本插件，在插件设置的 `assetsPath` 中填入 `static` 文件夹的路径；  
  示例：`D:\static` 或 `/home/koishi/static`
4. （可选）在插件设置的 `botName` 中填入你的 Bot 名称；
5. 启用插件。
