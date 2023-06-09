# Inspired by https://github.com/microsoft/vscode/blob/main/src/vs/workbench/contrib/terminal/browser/media/shellIntegration-env.zsh

if [[ -f $USER_ZDOTDIR/.zshenv ]]; then
  COMMAS_ZDOTDIR=$ZDOTDIR
  ZDOTDIR=$USER_ZDOTDIR

  # prevent recursion
  if [[ $USER_ZDOTDIR != $COMMAS_ZDOTDIR ]]; then
    . $USER_ZDOTDIR/.zshenv
  fi

  USER_ZDOTDIR=$ZDOTDIR
  ZDOTDIR=$COMMAS_ZDOTDIR
fi
