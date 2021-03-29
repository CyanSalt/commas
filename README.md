# Commas

<img src="https://raw.githubusercontent.com/CyanSalt/commas/master/resources/images/icon.png" width="96">

EN | [中文](https://github.com/CyanSalt/commas/blob/master/docs/README-zh.md)

A hackable terminal and command runner. **Commas** means **Com**mand **Mas**ter.

![Screenshot](https://user-images.githubusercontent.com/5101076/74102057-fb27bc00-4b7a-11ea-9222-51753bac1e14.png)

## Install

[Download the latest version](https://github.com/CyanSalt/commas/releases)

### Build manually

You can also clone or download this repository and compile this app locally.
  - After downloading the source code, enter the directory in command line and execute the installation script. Make sure that Node.js with version >= 10.0.0 is installed on your device.
  - Run `npm install` to install all dependencies
  - Run `npm run build` to generate a portable version of the application after the dependencies installed successfully

## Features

* Multiple terminal tabs
* Rapid command launchers
* Proxy server for developers
* Customizable theme (with 200+ downloadable)
* Hackable and pluggable

## Customization

* All of user data are stored in your **user data folder**, which is `~/Library/Application Support/Commas/` on macOS, `%localappdata%/Commas/` on Windows and `~/.config/Commas/` on Linux.

* If this app has no built-in translation for your language, you can add `translation.json` file to your user data folder. The content of the file could be part of entries in [the locale file](https://github.com/CyanSalt/commas/blob/master/resources/locales/zh-CN.json), or contain a pair of key-value like `"@use": "zh-CN"` to reference an existed translation file.

* Commas also supports you to add custom init script and stylesheet. Check out the example files at [here](https://github.com/CyanSalt/commas/tree/master/resource/examples). This directory also contains the example files which could help you to customize key bindings, application menu, and the launchers in the terminal sidebar.

* A well-run [Hooks API](https://github.com/CyanSalt/commas/tree/master/api) for addons is built in Commas. Write your own addon like [various addons](https://github.com/CyanSalt/commas/tree/master/addons) with Commas itself.

* You can put any of the files referenced above to your user data folder. JSON files will be treated as [JSON5](https://json5.org/) format (like the object literals in ECMAScript 5).

* Press <kbd>&#8984;</kbd> / <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>I</kbd> to open devtools of Commas to inspect the HTML elements of UI, just like what you do in Chrome!

## Credits

- [@vue/reactivity](https://github.com/vuejs/vue-next/tree/master/packages/reactivity)
- [node-pty](https://github.com/microsoft/node-pty)
- [xterm](https://github.com/xtermjs/xterm.js)

## License

MIT &copy; [CyanSalt](https://github.com/CyanSalt)
