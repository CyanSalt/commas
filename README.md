## Commas

<img src="https://raw.githubusercontent.com/CyanSalt/commas/master/app/assets/images/icon.png" width="96">

A hackable terminal and command runner. **Commas** means **Com**mand **Mas**ter.

![Screenshot](https://user-images.githubusercontent.com/5101076/49566451-9e70b600-f965-11e8-8274-a39a5efd0071.png)

### Usage

[Download the latest version](https://github.com/CyanSalt/commas/releases)

### Install manually

You can also clone or download this repository and compile this app locally.
  - After downloading the source code, enter the directory in command line and execute the installation script. Make sure that Node.js with version >= 10.0.0 is installed on your device.
  - Run `npm install` to install all dependencies
  - Run `npm run build` to generate a portable version of the application after the dependencies installed successfully

### Customization

* All of user data are stored in your user data folder, which is `~/Library/Application Support/Commas/` on macOS, `%localappdata%/Commas/` on Windows and `~/.config/Commas/` on Linux

* You can open your settings file by pressing <kbd>&#8984;</kbd> + <kbd>,</kbd> on macOS and change any options of the default settings. Check out the [default settings file](https://github.com/CyanSalt/commas/blob/master/app/assets/settings.json),  modify and copy it to your user data folder.

* If this app has no internal translation for your language, you can add `translation.json` file to your user data folder. The content of the file could be part of entries in [the locale file](https://github.com/CyanSalt/commas/blob/master/app/assets/locales/zh-CN.json), or contain a pair of key-value like `"@use": "zh-CN"` to reference an existed translation file.

* Commas also supports you to add custom init script and stylesheet, check out the example files at [here](https://github.com/CyanSalt/commas/tree/master/app/assets/examples). This directory also contains the example files which could help you to customize key bindings, application menu, and the launchers in the terminal sidebar.

* You can put any of the files referenced above to your user data folder. JSON files will be treated as [JSON5](https://json5.org/) format (like the object literals in ECMAScript 5).

* Press <kbd>&#8984;</kbd> / <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>I</kbd> to open devtools of Commas to inspect the HTML elements of UI, just like what you do in Chrome!

### Extra tips

#### How to show work directory in the title without `terminal.tab.liveCwd` enabled?

(Recommended) You can append shell scripts below to your profile (`~/.bashrc`, `~/.zshrc`, `~/.profile` or others):

```bash
if [ "$TERM_PROGRAM" = "Commas" ]; then
  export PS1="\[\033]0;\w\007\]${PS1}"
fi
```

*(If you want to customize the title formats, replace the `${PS1}` with the custom PS1 expression which could be generated by [the generator](http://bashrcgenerator.com/))*

#### How to implement "Open Commas Here" in Finder on macOS?

[Open Commas Here](https://github.com/CyanSalt/open-commas-here) is a plugin for Finder.
