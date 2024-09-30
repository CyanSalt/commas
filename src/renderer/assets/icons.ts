export interface IconEntry {
  name: string,
  patterns?: (string | RegExp)[],
  color?: string,
}

export default [
  {
    name: 'simple-icons-bun',
    patterns: ['bun', 'bunx'],
  },
  {
    name: 'simple-icons-curl',
    patterns: ['curl'],
  },
  {
    name: 'simple-icons-deno',
    patterns: ['deno'],
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
    color: '#339933',
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
] as (IconEntry & { patterns: NonNullable<IconEntry['patterns']> })[]
