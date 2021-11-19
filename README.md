# Commas

<img src="https://raw.githubusercontent.com/CyanSalt/commas/master/resources/images/icon.png" width="96">

EN | [中文](docs/README-zh.md)

**Commas** is a hackable, pluggable terminal, and also a command runner. The name comes from **Com**mand **Mas**ter.

![Screenshot](https://user-images.githubusercontent.com/5101076/142576956-b3805845-032f-4f28-bc2e-18d0cc69eb28.png)

## Installation

### Prebuilt version

[Download the latest version](https://github.com/CyanSalt/commas/releases)

### Build manually

You can clone or download the repository and build Commas locally.
  - Make sure you have the latest LTS version of Node.js installed on your device.
  - Download the source code and enter the directory through the command line.
  - Run `npm install` to install dependencies
  - Run `npm run build` to generate portable versions of this application.

## Features

- Optional multi-tabs support
- Customizable rapid command launchers
- Various built-in addons
  - Visual settings editor
  - CLI with custom commands supporting
  - Integration with [Whistle](https://github.com/avwo/whistle) proxy
  - Customizable theme (200 + downloadable)
- Internationalization support
- User scripts and third-party addons

## Customization

- All of user data are stored in a separate **user data folder**, which is `~/Library/Application Support/Commas/` on macOS, `%localappdata%/Commas/` on Windows and `~/.config/Commas/` on Linux. You can configure and back up personal data by editing / copying files in the user data folder.

- You can place any of the files mentioned below in the user data folder. The configuration files (settings, key bindings, translations) are in YAML format, while the resource files (themes) are in JSON format.

- Commas has several useful / interesting built-in [addons](https://github.com/CyanSalt/commas/tree/master/addons). You can also download / write third-party addons, place them in the `addons` directory of the user data folder, and manage the addons you want to enable through settings.

- Commas also supports adding custom scripts and stylesheets. You can see the sample files [here](https://github.com/CyanSalt/commas/tree/master/resources/examples). This directory also contains the example files which could help you to customize shortcut keys or command launchers.

- If there is no translation for the language you want in the application, you can add / modify the `translation.yaml` file in the user data folder. The content of the file can be similar to part of [the translation file](https://github.com/CyanSalt/commas/blob/master/resources/locales/zh-CN.json). You can also use key-value pairs like `"@use": zh-CN` to refer to an existing translation file.

- Commas has a rich set of built-in [hook API](https://github.com/CyanSalt/commas/tree/master/api). You can read the built-in addons for reference in writing your own addons.

- In addition, you can also use the shortcut key <kbd>&#8984;/Ctrl</kbd> <kbd>Shift</kbd> <kbd>I</kbd> to open the developer tool of Commas and inspect the HTML elements of UI, just like what you do in the browser!

## Credits

- [@vue/reactivity](https://github.com/vuejs/vue-next/tree/master/packages/reactivity)
- [electron](https://github.com/electron/electron)
- [node-pty](https://github.com/microsoft/node-pty)
- [xterm](https://github.com/xtermjs/xterm.js)

## License

ISC &copy; [CyanSalt](https://github.com/CyanSalt)
