# Inspired by https://github.com/microsoft/vscode/blob/main/src/vs/workbench/contrib/terminal/browser/media/shellIntegration-profile.zsh

if [[ $options[norcs] = off && -o "login" &&  -f $USER_ZDOTDIR/.zprofile ]]; then
  COMMAS_ZDOTDIR=$ZDOTDIR
  ZDOTDIR=$USER_ZDOTDIR
  . $USER_ZDOTDIR/.zprofile
  ZDOTDIR=$COMMAS_ZDOTDIR
fi
