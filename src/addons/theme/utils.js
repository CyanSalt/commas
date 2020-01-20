import mapping from './mapping.json'

const rawFilePath = 'https://raw.githubusercontent.com/mbadolato/iTerm2-Color-Schemes/master'

export async function getThemeList() {
  const response = await fetch(`${rawFilePath}/README.md`)
  const content = await response.text()
  const extractor = /\n###\s+(.+)\s+!\[Screenshot\]\((.+)\)/g
  const list = []
  let matches
  while ((matches = extractor.exec(content)) !== null) {
    let url
    const declared = mapping.find(item => item.name === matches[1])
    if (declared) {
      if (!declared.path) continue
      url = `${rawFilePath}/${declared.path}`
    } else {
      url = `${rawFilePath}/windowsterminal/${matches[1]}.json`
    }
    list.push({
      name: matches[1],
      screenshot: `${rawFilePath}/${matches[2]}`,
      url,
    })
  }
  return list
}
