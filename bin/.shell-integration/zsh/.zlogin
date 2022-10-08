# Inspired by microsoft/vscode

ZDOTDIR=$USER_ZDOTDIR
if [[ $options[norcs] = off && -o "login" &&  -f $ZDOTDIR/.zlogin ]]; then
  . $ZDOTDIR/.zlogin
fi
