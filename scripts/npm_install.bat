@echo off
setlocal
rem Electron's version.
set npm_config_target=3.0.3
rem Download headers for Electron.
set npm_config_disturl="https://atom.io/download/electron"
rem Tell node-pre-gyp that we are building for Electron.
set npm_config_runtime="electron"
rem Install all dependencies, and store cache to ~/.electron-gyp.
set npm_config_cache=~\.npm-electron
npm i
endlocal
