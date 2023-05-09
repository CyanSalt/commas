export interface IconEntry {
  name: string,
  patterns?: (string | RegExp)[],
  color?: string,
}

export default [
  {
    name: 'devicon-ssh-original-wordmark',
    patterns: ['ssh'],
  },
  {
    name: 'devicon-git-plain colored',
    patterns: ['git'],
  },
  {
    name: 'devicon-vim-plain colored',
    patterns: ['vi', 'vim', 'nvim'],
  },
  {
    name: 'devicon-nodejs-plain colored',
    patterns: ['node'],
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
    name: 'devicon-docker-plain colored',
    patterns: ['docker', 'docker-compose'],
  },
  {
    name: 'devicon-amazonwebservices-original colored',
    patterns: ['aws'],
  },
] as (IconEntry & { patterns: NonNullable<IconEntry['patterns']> })[]
