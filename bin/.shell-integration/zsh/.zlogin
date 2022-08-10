# Inspired by microsoft/vscode

if [[ $options[norcs] = off && -o "login" &&  -f $USER_ZDOTDIR/.zlogin ]]; then
  COMMAS_ZDOTDIR=$ZDOTDIR
  ZDOTDIR=$USER_ZDOTDIR
  . $USER_ZDOTDIR/.zlogin
fi
