# Commas

<img src="https://raw.githubusercontent.com/CyanSalt/commas/master/assets/images/icon.png" width="96">

[EN](https://github.com/CyanSalt/commas/blob/master/README.md) | 中文

**Commas** 是一款可定制的终端，同时也是一个命令行执行工具。这个名字源于 **Com**mand **Mas**ter (命令大师)。

![Screenshot](https://user-images.githubusercontent.com/5101076/74102057-fb27bc00-4b7a-11ea-9222-51753bac1e14.png)

## 安装

[下载最新版本](https://github.com/CyanSalt/commas/releases)

### 手动构建

你也可以克隆或下载这个仓库，然后在本地完成编译。
  - 下载源代码，通过命令行进入代码目录，然后运行安装脚本。确保你的设备上安装了 10.0.0 以上版本的 Node.js.
  - 运行 `npm install` 安装全部依赖包
  - 依赖包安装完成后，运行 `npm run build` 以生成此应用的一份免安装版本。

## 功能

* 多终端标签
* 快捷的命令启动项
* 开发者可用的代理服务器
* 可定制主题 (200+ 可下载)
* 支持魔改和插件

## 定制

* 所有的数据都存储在**用户数据文件夹**下, 在 macOS 上是 `~/Library/Application Support/Commas/`, 在 Windows 上是 `%localappdata%/Commas/`，在 Linux 上是 `~/.config/Commas/`。

* 如果应用内没有你想要语言的翻译，你可以在用户数据文件夹下添加 `translation.json` 文件。文件内容可以是类似于这个[翻译文件](https://github.com/CyanSalt/commas/blob/master/assets/locales/zh-CN.json)的一部分，或者是通过像 `"@use": "zh-CN"` 这样的键值对来引用已有的翻译文件。

* Commas 也支持添加自定义初始脚本和样式表。你可以查看这里的[示例文件](https://github.com/CyanSalt/commas/tree/master/assets/examples)。这个目录下也包含了可以定制按键绑定、应用菜单、以及启动项的示例。

* Commas 内置了一组完善的[钩子 API](https://github.com/CyanSalt/commas/tree/master/renderer/hooks)。你可以参考 Commas 的[自带插件](https://github.com/CyanSalt/commas/tree/master/renderer/addons)来编写自己的插件。

* 你可以把上面提到的任意文件放置在用户数据文件夹下。所有的 JSON 文件都会被作为 [JSON5](https://json5.org/) 格式解析（类似于 ECMAScript 5 中的对象字面量)。

* 你可以通过快捷键 <kbd>&#8984;</kbd> / <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>I</kbd> 打开 Commas 的开发者工具，检查 UI 中的 HTML 元素，就像在 Chrome 里一样！

## 许可

MIT &copy; [CyanSalt](https://github.com/CyanSalt)
