export interface IconEntry {
  name: string,
  patterns?: (string | RegExp)[],
  color?: string,
}

export default [
  {
    name: 'devicon-denojs-original colored',
    patterns: ['deno'],
  },
  {
    name: 'devicon-docker-plain colored',
    patterns: ['docker', 'docker-compose'],
  },
  {
    name: 'devicon-git-plain colored',
    patterns: ['git'],
  },
  {
    name: 'devicon-nodejs-plain colored',
    patterns: ['node'],
  },
  {
    name: 'devicon-npm-original-wordmark colored',
    patterns: ['npm', 'npx'],
  },
  {
    name: 'devicon-python-plain colored',
    patterns: [/^python\d*/],
  },
  {
    name: 'devicon-ruby-plain colored',
    patterns: ['ruby'],
  },
  {
    name: 'devicon-ssh-original-wordmark',
    patterns: ['ssh'],
  },
  {
    name: 'devicon-vim-plain colored',
    patterns: ['vi', 'vim', 'nvim'],
  },
] as (IconEntry & { patterns: NonNullable<IconEntry['patterns']> })[]
