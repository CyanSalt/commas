# Inspired by microsoft/vscode

# Prevent the script recursing when setting up
if [[ -n "$COMMAS_SHELL_INTEGRATION_RUNNING" ]]; then
  builtin return
fi

COMMAS_SHELL_INTEGRATION_RUNNING=1

# Run relevant rc/profile only if shell integration has been injected, not when run manually
if [ "$COMMAS_SHELL_INTEGRATION" == "1" ]; then
  if [ -z "$COMMAS_SHELL_LOGIN" ]; then
    . ~/.bashrc
  else
    # Imitate -l because --init-file doesn't support it:
    # run the first of these files that exists
    if [ -f /etc/profile ]; then
      . /etc/profile
    fi
    # exceute the first that exists
    if [ -f ~/.bash_profile ]; then
      . ~/.bash_profile
    elif [ -f ~/.bash_login ]; then
      . ~/.bash_login
    elif [ -f ~/.profile ]; then
      . ~/.profile
    fi
    builtin unset COMMAS_SHELL_LOGIN
  fi
  builtin unset COMMAS_SHELL_INTEGRATION
fi

if [ -z "$COMMAS_SHELL_INTEGRATION_RUNNING" ]; then
  builtin return
fi

# Send the IsWindows property if the environment looks like Windows
if [[ "$(uname -s)" =~ ^CYGWIN*|MINGW*|MSYS* ]]; then
  builtin printf "\x1b]633;P;IsWindows=True\x07"
fi

# Allow verifying $BASH_COMMAND doesn't have aliases resolved via history when the right HISTCONTROL
# configuration is used
if [[ "$HISTCONTROL" =~ .*(erasedups|ignoreboth|ignoredups).* ]]; then
  __commas_history_verify=0
else
  __commas_history_verify=1
fi

__commas_initialized=0
__commas_original_PS1="$PS1"
__commas_original_PS2="$PS2"
__commas_custom_PS1=""
__commas_custom_PS2=""
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
  builtin printf "\033]633;E;%s\007" "$__commas_current_command"
}

__commas_continuation_start() {
  builtin printf "\033]633;F\007"
}

__commas_continuation_end() {
  builtin printf "\033]633;G\007"
}

__commas_command_complete() {
  if [ "$__commas_current_command" = "" ]; then
    builtin printf "\033]633;D\007"
  else
    builtin printf "\033]633;D;%s\007" "$__commas_status"
  fi
  __commas_update_cwd
}
__commas_update_prompt() {
  # in command execution
  if [ "$__commas_in_command_execution" = "1" ]; then
    # Wrap the prompt if it is not yet wrapped, if the PS1 changed this this was last set it
    # means the user re-exported the PS1 so we should re-wrap it
    if [[ "$__commas_custom_PS1" == "" || "$__commas_custom_PS1" != "$PS1" ]]; then
      __commas_original_PS1=$PS1
      __commas_custom_PS1="\[$(__commas_prompt_start)\]$__commas_original_PS1\[$(__commas_prompt_end)\]"
      PS1="$__commas_custom_PS1"
    fi
    if [[ "$__commas_custom_PS2" == "" || "$__commas_custom_PS2" != "$PS2" ]]; then
      __commas_original_PS2=$PS2
      __commas_custom_PS2="\[$(__commas_continuation_start)\]$__commas_original_PS2\[$(__commas_continuation_end)\]"
      PS2="$__commas_custom_PS2"
    fi
    __commas_in_command_execution="0"
  fi
}

__commas_precmd() {
  __commas_command_complete "$__commas_status"
  __commas_current_command=""
  __commas_update_prompt
}

__commas_preexec() {
  __commas_initialized=1
  if [[ ! "$BASH_COMMAND" =~ ^__commas_prompt* ]]; then
    # Use history if it's available to verify the command as BASH_COMMAND comes in with aliases
    # resolved
    if [ "$__commas_history_verify" = "1" ]; then
      __commas_current_command="$(builtin history 1 | sed 's/ *[0-9]* *//')"
    else
      __commas_current_command=$BASH_COMMAND
    fi
  else
    __commas_current_command=""
  fi
  __commas_command_output_start
}

# Debug trapping/preexec inspired by starship (ISC)
if [[ -n "${bash_preexec_imported:-}" ]]; then
  __commas_preexec_only() {
    if [ "$__commas_in_command_execution" = "0" ]; then
      __commas_in_command_execution="1"
      __commas_preexec
    fi
  }
  precmd_functions+=(__commas_prompt_cmd)
  preexec_functions+=(__commas_preexec_only)
else
  __commas_dbg_trap="$(trap -p DEBUG)"
  if [[ "$__commas_dbg_trap" =~ .*\[\[.* ]]; then
    #HACK - is there a better way to do this?
    __commas_dbg_trap=${__commas_dbg_trap#'trap -- '*}
    __commas_dbg_trap=${__commas_dbg_trap%' DEBUG'}
    __commas_dbg_trap=${__commas_dbg_trap#"'"*}
    __commas_dbg_trap=${__commas_dbg_trap%"'"}
  else
    __commas_dbg_trap="$(trap -p DEBUG | cut -d' ' -f3 | tr -d \')"
  fi
  if [[ -z "$__commas_dbg_trap" ]]; then
    __commas_preexec_only() {
      if [ "$__commas_in_command_execution" = "0" ]; then
        __commas_in_command_execution="1"
        __commas_preexec
      fi
    }
    trap '__commas_preexec_only "$_"' DEBUG
  elif [[ "$__commas_dbg_trap" != '__commas_preexec "$_"' && "$__commas_dbg_trap" != '__commas_preexec_all "$_"' ]]; then
    __commas_preexec_all() {
      if [ "$__commas_in_command_execution" = "0" ]; then
        __commas_in_command_execution="1"
        builtin eval ${__commas_dbg_trap}
        __commas_preexec
      fi
    }
    trap '__commas_preexec_all "$_"' DEBUG
  fi
fi

__commas_update_prompt

__commas_restore_exit_code() {
  return "$1"
}

__commas_prompt_cmd_original() {
  __commas_status="$?"
  __commas_restore_exit_code "${__commas_status}"
  # Evaluate the original PROMPT_COMMAND similarly to how bash would normally
  # See https://unix.stackexchange.com/a/672843 for technique
  for cmd in "${__commas_original_prompt_command[@]}"; do
    eval "${cmd:-}"
  done
  __commas_precmd
}

__commas_prompt_cmd() {
  __commas_status="$?"
  __commas_precmd
}

# PROMPT_COMMAND arrays and strings seem to be handled the same (handling only the first entry of
# the array?)
__commas_original_prompt_command=$PROMPT_COMMAND

if [[ -z "${bash_preexec_imported:-}" ]]; then
  if [[ -n "$__commas_original_prompt_command" && "$__commas_original_prompt_command" != "__commas_prompt_cmd" ]]; then
    PROMPT_COMMAND=__commas_prompt_cmd_original
  else
    PROMPT_COMMAND=__commas_prompt_cmd
  fi
fi
