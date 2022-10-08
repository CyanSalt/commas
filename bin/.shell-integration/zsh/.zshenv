# Inspired by microsoft/vscode

if [[ -f $USER_ZDOTDIR/.zshenv ]]; then
  COMMAS_ZDOTDIR=$ZDOTDIR
  ZDOTDIR=$USER_ZDOTDIR

  . $USER_ZDOTDIR/.zshenv

  USER_ZDOTDIR=$ZDOTDIR
  ZDOTDIR=$COMMAS_ZDOTDIR
fi
