@echo off
setlocal
set ELECTRON_RUN_AS_NODE=1
if not defined COMMAS_EXE set COMMAS_EXE=node
for /F %%i in ('%COMMAS_EXE% %~dp0_context.js cli %*') do set payload=%%i
echo ]539;%payload%\
endlocal
