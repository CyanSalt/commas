# Inspired by https://github.com/microsoft/vscode/blob/main/src/vs/workbench/contrib/terminal/browser/media/shellIntegration-login.zsh

ZDOTDIR=$USER_ZDOTDIR
if [[ $options[norcs] = off && -o "login" &&  -f $ZDOTDIR/.zlogin ]]; then
  . $ZDOTDIR/.zlogin
fi
