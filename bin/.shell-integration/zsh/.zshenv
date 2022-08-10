# Inspired by microsoft/vscode

COMMAS_ZDOTDIR=$ZDOTDIR
if [[ -f ~/.zshenv ]]; then
  . ~/.zshenv
fi
if [[ "$ZDOTDIR" != "$COMMAS_ZDOTDIR" ]]; then
  USER_ZDOTDIR=$ZDOTDIR
  ZDOTDIR=$COMMAS_ZDOTDIR
else
  USER_ZDOTDIR=$HOME
fi
