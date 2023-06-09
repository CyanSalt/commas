# Inspired by https://github.com/microsoft/vscode/blob/main/src/vs/workbench/contrib/terminal/browser/media/shellIntegration-rc.zsh

builtin autoload -Uz add-zsh-hook

# Prevent the script recursing when setting up
if [ -n "$COMMAS_SHELL_INTEGRATION_RUNNING" ]; then
  ZDOTDIR=$USER_ZDOTDIR
  builtin return
fi

# This variable allows the shell to both detect that Commas' shell integration is enabled as well
# as disable it by unsetting the variable.
COMMAS_SHELL_INTEGRATION_RUNNING=1

# By default, zsh will set the $HISTFILE to the $ZDOTDIR location automatically. In the case of the
# shell integration being injected, this means that the terminal will use a different history file
# to other terminals. To fix this issue, set $HISTFILE back to the default location before ~/.zshrc
# is called as that may depend upon the value.
if [[  "$COMMAS_SHELL_INTEGRATION" == "1" ]]; then
  HISTFILE=$USER_ZDOTDIR/.zsh_history
fi

# Only fix up ZDOTDIR if shell integration was injected (not manually installed) and has not been called yet
if [[ "$COMMAS_SHELL_INTEGRATION" == "1" ]]; then
  if [[ $options[norcs] = off  && -f $USER_ZDOTDIR/.zshrc ]]; then
    COMMAS_ZDOTDIR=$ZDOTDIR
    ZDOTDIR=$USER_ZDOTDIR
    # A user's custom HISTFILE location might be set when their .zshrc file is sourced below
    . $USER_ZDOTDIR/.zshrc
  fi
fi

# Shell integration was disabled by the shell, exit without warning assuming either the shell has
# explicitly disabled shell integration as it's incompatible or it implements the protocol.
if [ -z "$COMMAS_SHELL_INTEGRATION_RUNNING" ]; then
  builtin return
fi

# The property (P) and command (E) codes embed values which require escaping.
# Backslashes are doubled. Non-alphanumeric characters are converted to escaped hex.
__commas_escape_value() {
  builtin emulate -L zsh

  # Process text byte by byte, not by codepoint.
  builtin local LC_ALL=C str="$1" i byte token out=''

  for (( i = 0; i < ${#str}; ++i )); do
    byte="${str:$i:1}"

    # Escape backslashes and semi-colons
    if [ "$byte" = "\\" ]; then
      token="\\\\"
    elif [ "$byte" = ";" ]; then
      token="\\x3b"
    else
      token="$byte"
    fi

    out+="$token"
  done

  builtin print -r "$out"
}

__commas_in_command_execution="1"
__commas_current_command=""

# It's fine this is in the global scope as it getting at it requires access to the shell environment
__commas_nonce="$COMMAS_NONCE"
unset COMMAS_NONCE

__commas_prompt_start() {
  builtin printf '\e]633;A\a'
}

__commas_prompt_end() {
  builtin printf '\e]633;B\a'
}

__commas_update_cwd() {
  builtin printf '\e]633;P;Cwd=%s\a' "$(__commas_escape_value "${PWD}")"
}

__commas_command_output_start() {
  builtin printf '\e]633;C\a'
  builtin printf '\e]633;E;%s;%s\a' "$(__commas_escape_value "${__commas_current_command}")" $__commas_nonce
}

__commas_continuation_start() {
  builtin printf '\e]633;F\a'
}

__commas_continuation_end() {
  builtin printf '\e]633;G\a'
}

__commas_right_prompt_start() {
  builtin printf '\e]633;H\a'
}

__commas_right_prompt_end() {
  builtin printf '\e]633;I\a'
}

__commas_command_complete() {
  if [[ "$__commas_current_command" == "" ]]; then
    builtin printf '\e]633;D\a'
  else
    builtin printf '\e]633;D;%s\a' "$__commas_status"
  fi
  __commas_update_cwd
}

if [[ -o NOUNSET ]]; then
  if [ -z "${RPROMPT-}" ]; then
    RPROMPT=""
  fi
fi
__commas_update_prompt() {
  __commas_prior_prompt="$PS1"
  __commas_prior_prompt2="$PS2"
  __commas_in_command_execution=""
  PS1="%{$(__commas_prompt_start)%}$PS1%{$(__commas_prompt_end)%}"
  PS2="%{$(__commas_continuation_start)%}$PS2%{$(__commas_continuation_end)%}"
  if [ -n "$RPROMPT" ]; then
    __commas_prior_rprompt="$RPROMPT"
    RPROMPT="%{$(__commas_right_prompt_start)%}$RPROMPT%{$(__commas_right_prompt_end)%}"
  fi
}

__commas_precmd() {
  local __commas_status="$?"
  if [ -z "${__commas_in_command_execution-}" ]; then
    # not in command execution
    __commas_command_output_start
  fi

  __commas_command_complete "$__commas_status"
  __commas_current_command=""

  # in command execution
  if [ -n "$__commas_in_command_execution" ]; then
    # non null
    __commas_update_prompt
  fi
}

__commas_preexec() {
  PS1="$__commas_prior_prompt"
  PS2="$__commas_prior_prompt2"
  if [ -n "$RPROMPT" ]; then
    RPROMPT="$__commas_prior_rprompt"
  fi
  __commas_in_command_execution="1"
  __commas_current_command=$1
  __commas_command_output_start
}
add-zsh-hook precmd __commas_precmd
add-zsh-hook preexec __commas_preexec

if [[ $options[login] = off && $USER_ZDOTDIR != $COMMAS_ZDOTDIR ]]; then
  ZDOTDIR=$USER_ZDOTDIR
fi
