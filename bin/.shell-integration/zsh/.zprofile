# Inspired by microsoft/vscode

if [[ $options[norcs] = off && -o "login" &&  -f $USER_ZDOTDIR/.zprofile ]]; then
  COMMAS_ZDOTDIR=$ZDOTDIR
  ZDOTDIR=$USER_ZDOTDIR
  . $USER_ZDOTDIR/.zprofile
  ZDOTDIR=$COMMAS_ZDOTDIR
fi
