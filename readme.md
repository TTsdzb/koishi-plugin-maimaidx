# koishi-plugin-maimaidx

[![npm](https://img.shields.io/npm/v/koishi-plugin-maimaidx?style=flat-square)](https://www.npmjs.com/package/koishi-plugin-maimaidx)

由同名 [Hoshino](https://github.com/Ice-Cirno/HoshinoBot) 插件重写而来的国服街机音游 **舞萌 DX** 查询插件，提供歌曲、谱面信息查询，以及成绩查询（数据来自 [舞萌 DX | 中二节奏查分器](https://www.diving-fish.com/maimaidx/prober/)）。所有可用的插件功能均使用 Typescript 配合 Koishi 提供的功能重新实现。

原插件地址：<https://github.com/Yuri-YuzuChaN/maimaiDX>

## 注意

如果你使用 `diving-fish` 或 `xray` 图片源，插件非常依赖浏览器缓存，请不要频繁重启 Koishi、重载 `puppeteer` 服务或手动清除浏览器缓存，否则生成图片不仅很慢，还会消耗很多网络资源。

如果你无法避免经常重启 Koishi，请使用默认的 `local` 图片源。

## 使用

1. 首先确认安装了 `puppeteer`（用于生成图片）、`database`（用于存储歌曲信息）服务；
2. 到[原插件地址](https://github.com/Yuri-YuzuChaN/maimaiDX)下载并解压资源文件；
3. 安装本插件，配置 `assetsPath`（例：`file://D:\static` 或 `file:///home/koishi/static`）；
4. （可选）[配置 `nickname`](https://koishi.chat/zh-CN/api/core/app.html#options-nickname)；
5. 启用插件。
