# Inspired by microsoft/vscode

builtin autoload -Uz add-zsh-hook

# Prevent the script recursing when setting up
if [ -n "$COMMAS_SHELL_INTEGRATION_RUNNING" ]; then
  builtin return
fi

# This variable allows the shell to both detect that Commas' shell integration is enabled as well
# as disable it by unsetting the variable.
COMMAS_SHELL_INTEGRATION_RUNNING=1

# Only fix up ZDOTDIR if shell integration was injected (not manually installed) and has not been called yet
if [[ "$COMMAS_SHELL_INTEGRATION" == "1" ]]; then
  if [[ $options[norcs] = off  && -f $USER_ZDOTDIR/.zshrc ]]; then
    COMMAS_ZDOTDIR=$ZDOTDIR
    ZDOTDIR=$USER_ZDOTDIR
    . $USER_ZDOTDIR/.zshrc
    ZDOTDIR=$COMMAS_ZDOTDIR
  fi

  if [[ -f $USER_ZDOTDIR/.zsh_history ]]; then
    HISTFILE=$USER_ZDOTDIR/.zsh_history
  fi
fi

# Shell integration was disabled by the shell, exit without warning assuming either the shell has
# explicitly disabled shell integration as it's incompatible or it implements the protocol.
if [ -z "$COMMAS_SHELL_INTEGRATION_RUNNING" ]; then
  builtin return
fi

__commas_in_command_execution="1"
__commas_current_command=""

__commas_prompt_start() {
  builtin printf "\033]633;A\007"
}

__commas_prompt_end() {
  builtin printf "\033]633;B\007"
}

__commas_update_cwd() {
  builtin printf "\033]633;P;Cwd=%s\007" "$PWD"
}

__commas_command_output_start() {
  builtin printf "\033]633;C\007"
  # Send command line, escaping printf format chars %
  builtin printf "\033]633;E;%s\007" "$__commas_current_command"
}

__commas_continuation_start() {
  builtin printf "\033]633;F\007"
}

__commas_continuation_end() {
  builtin printf "\033]633;G\007"
}

__commas_right_prompt_start() {
  builtin printf "\033]633;H\007"
}

__commas_right_prompt_end() {
  builtin printf "\033]633;I\007"
}

__commas_command_complete() {
  if [[ "$__commas_current_command" == "" ]]; then
    builtin printf "\033]633;D\007"
  else
    builtin printf "\033]633;D;%s\007" "$__commas_status"
  fi
  __commas_update_cwd
}

if [[ -o NOUNSET ]]; then
  if [ -z "${RPROMPT-}" ]; then
    RPROMPT=""
  fi
  if [ -z "${PREFIX-}" ]; then
    PREFIX=""
  fi
fi
__commas_update_prompt() {
  __commas_prior_prompt="$PS1"
  __commas_in_command_execution=""
  PS1="%{$(__commas_prompt_start)%}$PREFIX$PS1%{$(__commas_prompt_end)%}"
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
  if [ -n "$RPROMPT" ]; then
    RPROMPT="$__commas_prior_rprompt"
  fi
  __commas_in_command_execution="1"
  __commas_current_command=$1
  __commas_command_output_start
}
add-zsh-hook precmd __commas_precmd
add-zsh-hook preexec __commas_preexec

if [[ $options[login] = off ]]; then
  ZDOTDIR=$USER_ZDOTDIR
fi
