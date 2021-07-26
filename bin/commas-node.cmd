@echo off
setlocal
set ELECTRON_RUN_AS_NODE=1
if not defined COMMAS_EXE set COMMAS_EXE=node
call %COMMAS_EXE% %*
endlocal
