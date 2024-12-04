# Commas

<img src="https://raw.githubusercontent.com/CyanSalt/commas/master/resources/images/icon.png" width="96">

EN | [中文](docs/README-zh.md)

**Commas** is a hackable, pluggable terminal, and also a command runner. The name comes from **Com**mand **Mas**ter.

| Dark | Light |
| --- | --- |
| ![Screenshot](https://github.com/CyanSalt/commas/assets/5101076/1c034b43-0fed-4183-abe0-ad2077fd261b) | ![Screenshot](https://github.com/CyanSalt/commas/assets/5101076/7592723f-fd56-4437-bc2f-cd49b99908cd) |

*Theme: [OneHalf](https://github.com/sonph/onehalf)*

## Installation

### Prebuilt version

[Download the latest version](https://github.com/CyanSalt/commas/releases)

It can also be installed via [Homebrew](https://brew.sh/) (especially on macOS)

```shell
brew install --cask cyansalt/cask/commas
```

> [!WARNING]
> The prebuilt version of Windows or Linux don't work currently, see [#20](https://github.com/CyanSalt/commas/issues/20). It is recommended to build manually.

### Build manually

You can clone or download the repository and build Commas locally.
  - Make sure you have the latest LTS version of Node.js installed on your device.
  - Download the source code and enter the directory through the command line.
  - Run `pnpm install` to install dependencies
  - Run `pnpm run build` to build this application for the current platform

## Features

- Multi-tab support with customizable layout
- Duplicate or split from current terminal
- Theme system compatible with Windows Terminal
- Plug-in i18n support
- Built-in addons
  - Run commands instantly on local or remote server
  - Edit configuration files within the application
  - Interact with the application in the terminal
  - Visual settings editor
  - Integration with [whistle](https://github.com/avwo/whistle) proxy
  - Gist-based configuration synchronization
- User scripts and third-party addons

## Customization

All of user data are stored in a separate **user data folder**, which is `~/Library/Application Support/Commas/` on macOS, `%localappdata%/Commas/` on Windows and `~/.config/Commas/` on Linux. These files can be shared between different devices. The configuration files (settings, key bindings, translations) are in YAML format, while the resource files (themes) are in JSON format.

### Configuration

You can configure the application's interface and functionality at a granular level via `settings.yaml`. For example, to enable font ligatures in the terminal:

```yaml
terminal.style.fontLigatures: true
```

Additionally, the built-in `settings` addon supports managing these configurations in graphical forms.

### Theme

Commas supports windowsterminal-compatible theme files. You can place theme files in the `themes` directory of the user data folder, and then specify the theme name through the settings.

Commas will display a dark / light theme that follows your system's dark mode by default. You can specify the theme in dark / light mode separately, or you can change this behavior to keep the theme unchanged.

The built-in `theme` addon supports downloading themes from [windowsterminalthemes.dev](https://windowsterminalthemes.dev). There are currently 300+ available themes that can be downloaded and used.

### I18n

Commas currently has built-in supports for English and Simplified Chinese. You can also enable translation for other languages by adding / modifying the `translation.yaml` file under the user data folder. The content of the file can be something like part of [the translation file](https://github.com/CyanSalt/commas/blob/master/resources/locales/zh-CN.json).

You can also reference an existing translation file in the form of `@use: zh-CN` if you are using a dialect of one of the built-in languages.

### Addons and user scripts

Commas has several useful / interesting built-in [addons](https://github.com/CyanSalt/commas/tree/master/addons). In addition, you can also download / write third-party addons to be placed in the `addons` directory of the user data folder, and manage which addons you want to enable via settings.

With the built-in `addon-manager` addon, all built-in and self-added addons can be easily managed via a graphical interface.

Add-ons are based on a rich set of [hook APIs](https://github.com/CyanSalt/commas/tree/master/api). You can read the built-in addons for reference in writing your own addons. For some simple scenarios, you can add / modify the `custom.js` and `custom.css` files directly under the user data folder to implement custom logic and styles. `custom.js` also has full hook API support.

### Developer tools

The best part is that you can use the shortcut key <kbd>⌘</kbd> <kbd>⇧</kbd> <kbd>I</kbd> to open developer tool of Commas and inspect the HTML elements in the UI just like you would in a browser!

## License

ISC &copy; [CyanSalt](https://github.com/CyanSalt)
