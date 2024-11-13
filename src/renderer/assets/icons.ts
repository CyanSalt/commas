export interface IconEntry {
  name: string,
  patterns?: (string | RegExp)[],
  color?: string,
}

export default [
  {
    name: 'simple-icons-gnubash',
    patterns: ['bash'],
    color: '#4eaa25',
  },
  {
    name: 'simple-icons-bun',
    patterns: ['bun', 'bunx'],
  },
  {
    name: 'simple-icons-dash',
    patterns: ['dash'],
    color: '#008de4',
  },
  {
    name: 'simple-icons-curl',
    patterns: ['curl'],
  },
  {
    name: 'simple-icons-deno',
    patterns: ['deno'],
    color: '#70ffaf',
  },
  {
    name: 'simple-icons-docker',
    patterns: ['docker', 'docker-compose'],
    color: '#2496ed',
  },
  {
    name: 'simple-icons-git',
    patterns: ['git'],
    color: '#f05032',
  },
  {
    name: 'simple-icons-nodedotjs',
    patterns: ['node'],
    color: '#5fa04e',
  },
  {
    name: 'simple-icons-rust',
    patterns: ['rustc'],
  },
  {
    name: 'simple-icons-python',
    patterns: [/^python\d*/],
    color: '#3776ab',
  },
  {
    name: 'simple-icons-ruby',
    patterns: ['ruby'],
    color: '#cc342d',
  },
  {
    name: 'simple-icons-vim',
    patterns: ['vi', 'vim'],
    color: '#019733',
  },
  {
    name: 'simple-icons-neovim',
    patterns: ['nvim'],
    color: '#57a143',
  },
  {
    name: 'simple-icons-zsh',
    patterns: ['zsh'],
    color: '#f15a24',
  },
] as (IconEntry & { patterns: NonNullable<IconEntry['patterns']> })[]
