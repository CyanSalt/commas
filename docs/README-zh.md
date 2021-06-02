# Commas

<img src="https://raw.githubusercontent.com/CyanSalt/commas/master/resources/images/icon.png" width="96">

[EN](../README.md) | 中文

**Commas** 是一款可定制、插件化的终端，同时也是命令行执行工具。这个名字源于 **Com**mand **Mas**ter (命令大师)。

![Screenshot](https://user-images.githubusercontent.com/5101076/74102057-fb27bc00-4b7a-11ea-9222-51753bac1e14.png)

## 安装

### 预构建版本

[下载最新版本](https://github.com/CyanSalt/commas/releases)

### 手动构建

你可以克隆或下载这个仓库，在本地完成 Commas 的构建。
  - 确保你的设备上安装了最新的 LTS 版本的 Node.js；
  - 下载源代码，通过命令行进入代码目录；
  - 运行 `npm install` 安装依赖；
  - 运行 `npm run build` 以生成此应用的免安装版本。

## 功能

- 可选的多标签支持
- 可自定义快捷的命令启动项
- 内置多种插件
  - 可视化配置编辑器
  - 支持自定义命令的 CLI
  - 集成 [Whistle](https://github.com/avwo/whistle) 代理
  - 可定制主题 (200+ 可下载)
- 多语言支持
- 支持用户脚本和第三方插件

## 定制

- 所有的数据都存储在独立的**用户数据文件夹**下，在 macOS 上是 `~/Library/Application Support/Commas/`, 在 Windows 上是 `%localappdata%/Commas/`，在 Linux 上是 `~/.config/Commas/`。你可以通过编辑/拷贝用户数据文件夹下的文件来配置和备份个人数据。

- Commas 内置了数个有用/有趣的[插件](https://github.com/CyanSalt/commas/tree/master/addons)，你也可以下载/编写第三方插件放置在用户数据文件夹的 `addons` 目录下，并通过设置来管理期望启用的插件。

- Commas 也支持添加自定义脚本和样式表。你可以查看这里的[示例文件](https://github.com/CyanSalt/commas/tree/master/resources/examples)。这个目录下也包含了辅助你自定义快捷键或是命令启动项的示例文件。

- 如果应用内没有你想要语言的翻译，你可以在用户数据文件夹下添加/修改 `translation.json` 文件。文件内容可以是类似于这个[翻译文件](https://github.com/CyanSalt/commas/blob/master/resources/locales/zh-CN.json)的一部分。你也可以通过 `"@use": "zh-CN"` 这样的键值对来引用已有的翻译文件。

- 你可以把上面提到的任意文件放置在用户数据文件夹下。所有的 JSON 文件都会被作为 [JSON5](https://json5.org/) 格式解析（类似于 ECMAScript 5 中的对象字面量)。

- Commas 内置了一组丰富的[钩子 API](https://github.com/CyanSalt/commas/tree/master/api)。你可以参考 Commas 的自带插件来编写自己的插件。

- 以及，你还可以通过快捷键 <kbd>&#8984;/Ctrl</kbd> <kbd>Shift</kbd> <kbd>I</kbd> 打开 Commas 的开发者工具，检查 UI 中的 HTML 元素，就像在浏览器里一样！

## 鸣谢

- [@vue/reactivity](https://github.com/vuejs/vue-next/tree/master/packages/reactivity)
- [electron](https://github.com/electron/electron)
- [node-pty](https://github.com/microsoft/node-pty)
- [xterm](https://github.com/xtermjs/xterm.js)

## 许可

ISC &copy; [CyanSalt](https://github.com/CyanSalt)
