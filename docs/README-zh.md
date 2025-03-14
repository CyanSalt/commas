# Commas

<img src="https://cdn.jsdelivr.net/gh/CyanSalt/commas@master/resources/images/icon.png" width="96">

[EN](../README.md) | 中文

**Commas** 是一款可定制、插件化的终端，同时也是命令执行工具。这个名字源于 **Com**mand **Mas**ter (命令大师)。

| 深色 | 浅色 |
| --- | --- |
| ![截图](https://github.com/user-attachments/assets/0a478846-7079-46aa-9e2d-341e2de97dcc) | ![截图](https://github.com/user-attachments/assets/56ccb758-0433-4295-af77-980d91642f24) |

*主题: [OneHalf](https://github.com/sonph/onehalf)*

## 安装

### 预构建版本

[下载最新版本](https://github.com/CyanSalt/commas/releases)

也可以通过 [Homebrew](https://brew.sh/) 安装 (尤其是在 macOS 上)

```shell
brew install --cask cyansalt/cask/commas
```

> [!WARNING]
> Linux 的预构建版本目前无法正常工作，参见 [#20](https://github.com/CyanSalt/commas/issues/20)。建议手动构建。

### 手动构建

你可以克隆或下载这个仓库，在本地完成 Commas 的构建。
  - 确保你的设备上安装了最新的 LTS 版本的 Node.js；
  - 下载源代码，通过命令行进入代码目录；
  - 运行 `pnpm install` 安装依赖；
  - 运行 `pnpm run build` 以生成适用于当前平台的此应用。

## 功能

- 可自定义布局的多标签页支持
- 从当前终端复制或拆分
- 基于 [Fig 规范](https://github.com/withfig/autocomplete)的命令补全
- 与 Windows Terminal 兼容的主题系统
- 外挂国际化支持
- 内置多个附加功能
  - 在本地或远程服务器即时运行命令
  - 在终端内与所在的应用交互
  - 在应用内访问本地文件系统、编辑文件及打开网页
  - 可视化配置编辑器
  - 基于 AI 自动补全或修复命令
  - 截图、录制或通过局域网分享终端会话
  - 集成 [whistle](https://github.com/avwo/whistle) 代理
  - 基于 Gist 的配置同步
  - 其他彩蛋功能
- 用户脚本和第三方附加功能

## 定制

- 所有的数据都存储在独立的**用户数据文件夹**下，在 macOS 上是 `~/Library/Application Support/Commas/`, 在 Windows 上是 `%localappdata%/Commas/`，在 Linux 上是 `~/.config/Commas/`。这些文件都可以在不同设备之间共享。配置文件（设置、快捷键、翻译）均使用 YAML 格式，而资源文件（主题）则使用 JSON 格式。

### 配置

你可以通过 `settings.yaml` 对应用的界面和功能进行细粒度的配置。例如，在终端中启用字体连字：

```yaml
terminal.style.fontLigatures: true
```

此外，内置的 `settings` 附加功能支持在图形化表单中管理这些配置。

### 主题

Commas 支持与 Windows Terminal 兼容的主题文件。你可以将主题文件放置在用户数据文件夹的 `themes` 目录下，然后通过配置指定主题名称。

默认情况下，Commas 会跟随系统的深色模式显示为深色/浅色主题。你可以分别指定深色/浅色模式下的主题，也可以修改这一行为以保持主题不变。

内置的 `theme` 附加功能支持从 [windowsterminalthemes.dev](https://windowsterminalthemes.dev) 下载主题。目前有 300+ 可用的主题支持下载使用。

### 多语言

Commas 目前内置了英语和简体中文的支持。你也可以通过在用户数据文件夹下添加/修改 `translation.yaml` 文件以实现其他语言的翻译功能。文件内容可以是类似于这个[翻译文件](https://github.com/CyanSalt/commas/blob/master/resources/locales/zh-CN.json)的一部分。

如果你使用的是内置语言的方言，也可以通过 `@use: zh-CN` 的形式引用已有的翻译文件。

### 附件功能和用户脚本

Commas 内置了数个有用/有趣的[附加功能](https://github.com/CyanSalt/commas/tree/master/addons)。此外，你也可以下载/编写第三方附加功能放置在用户数据文件夹的 `addons` 目录下，并通过设置来管理期望启用的附加功能。

借助内置的 `addon-manager` 附加功能，可以方便地通过图形化界面管理内置和自行添加的全部附加功能。

附加功能基于一组丰富的[钩子 API](https://github.com/CyanSalt/commas/tree/master/api)。你可以参考内置的附加功能来编写自己的附加功能。对于一些简单的场景，可以直接添加/修改用户数据文件夹下的 `custom.js` 和 `custom.css` 文件，以实现自定义的逻辑和样式。`custom.js` 同样具有完整的钩子 API 支持。

### 开发者工具

最棒的是，你完全可以通过快捷键 <kbd>⌘</kbd> <kbd>⇧</kbd> <kbd>I</kbd> 打开 Commas 的开发者工具，检查 UI 中的 HTML 元素，就像在浏览器里一样！

## 许可

ISC &copy; [CyanSalt](https://github.com/CyanSalt)
