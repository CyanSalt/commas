import {get} from 'https'

function getRemoteContent(url) {
  return new Promise((resolve, reject) => {
    get(url, response => {
      let result = ''
      response.on('data', (chunk) => {
        result += chunk
      })
      response.on('end', () => {
        resolve(result)
      })
    }).on('error', reject)
  })
}

const documentation = 'https://raw.githubusercontent.com/mbadolato/iTerm2-Color-Schemes/master/README.md'

export async function getThemeList() {
  const content = await getRemoteContent(documentation)
  return content
    .split(/^##\s+/m)
    .find(section => section.startsWith('Screenshots'))
    .match(/^#{3}\s+(.+)$/mg)
    .map(title => title.slice(4))
}
