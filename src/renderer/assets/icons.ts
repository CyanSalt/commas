export interface IconEntry {
  name: string,
  patterns?: (string | RegExp)[],
  color?: string,
}

export default [
  {
    name: 'devicon devicon-ssh',
    patterns: ['ssh'],
  },
  {
    name: 'devicon devicon-git',
    patterns: ['git'],
    color: '#f05032',
  },
  {
    name: 'devicon devicon-vim',
    patterns: ['vi', 'vim', 'nvim'],
    color: '#019733',
  },
  {
    name: 'devicon devicon-nodejs',
    patterns: ['node'],
    color: '#339933',
  },
  {
    name: 'devicon devicon-python',
    patterns: [/^python\d*/],
    color: '#3776ab',
  },
  {
    name: 'devicon devicon-ruby',
    patterns: ['ruby'],
    color: '#f44336',
  },
  {
    name: 'devicon devicon-docker',
    patterns: ['docker', 'docker-compose'],
    color: '#1488c6',
  },
  {
    name: 'devicon devicon-amazonwebservices',
    patterns: ['aws'],
    color: '#232f3e',
  },
] as (IconEntry & { patterns: NonNullable<IconEntry['patterns']> })[]
