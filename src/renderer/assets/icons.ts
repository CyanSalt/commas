export interface IconEntry {
  name: string,
  patterns?: (string | RegExp)[],
  color?: string,
}

export default [
  {
    name: 'si si-bun',
    patterns: ['bun', 'bunx'],
  },
  {
    name: 'si si-curl',
    patterns: ['curl'],
  },
  {
    name: 'si si-deno',
    patterns: ['deno'],
  },
  {
    name: 'si si-docker',
    patterns: ['docker', 'docker-compose'],
    color: '#2496ed',
  },
  {
    name: 'si si-git',
    patterns: ['git'],
    color: '#f05032',
  },
  {
    name: 'si si-nodedotjs',
    patterns: ['node'],
    color: '#339933',
  },
  {
    name: 'si si-rust',
    patterns: ['rustc'],
  },
  {
    name: 'si si-python',
    patterns: [/^python\d*/],
    color: '#3776ab',
  },
  {
    name: 'si si-ruby',
    patterns: ['ruby'],
    color: '#cc342d',
  },
  {
    name: 'si si-vim',
    patterns: ['vi', 'vim'],
    color: '#019733',
  },
  {
    name: 'si si-neovim',
    patterns: ['nvim'],
    color: '#57a143',
  },
] as (IconEntry & { patterns: NonNullable<IconEntry['patterns']> })[]
