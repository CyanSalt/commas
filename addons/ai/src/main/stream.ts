interface XMLSlice {
  type: 'text' | 'start_tag' | 'end_tag',
  tag: string,
  start: number,
  end: number,
  isClosed: boolean,
}

interface XMLNode {
  type: 'root' | 'text' | 'element',
  tag: string,
  start: number,
  end: number,
  children?: XMLNode[],
  parent?: XMLNode,
  isClosed: boolean,
}

function parseXMLSlices(source: string, offset = 0): XMLSlice[] {
  if (!source) return []
  const pattern = /<(\/)?([^/>]+)?(>)?/
  const matched = source.match(pattern)
  if (!matched) {
    return [
      {
        type: 'text',
        tag: '',
        start: offset,
        end: source.length + offset,
        isClosed: true,
      },
    ]
  }
  const fullTag = matched[0]
  const isEndTag = Boolean(matched[1])
  const tagName = matched[2]
  const isClosed = Boolean(matched[3])
  const tagIndex = matched.index ?? 0
  return [
    ...(tagIndex ? [
      {
        type: 'text',
        tag: '',
        start: offset,
        end: tagIndex + offset,
        isClosed: true,
      } satisfies XMLSlice,
    ] : []),
    {
      type: isEndTag ? 'end_tag' : 'start_tag',
      tag: tagName,
      start: tagIndex + offset,
      end: tagIndex + fullTag.length + offset,
      isClosed,
    },
    ...parseXMLSlices(source.slice(tagIndex + fullTag.length), tagIndex + fullTag.length + offset),
  ]
}

function buildXMLDocument(slices: XMLSlice[]) {
  const root: XMLNode = {
    type: 'root',
    tag: '',
    start: 0,
    end: slices[slices.length - 1].end,
    isClosed: false,
  }
  let currentNode = root
  for (const slice of slices) {
    switch (slice.type) {
      case 'text':
        currentNode.children ??= []
        currentNode.children.push({
          type: 'text',
          tag: '',
          start: slice.start,
          end: slice.end,
          parent: currentNode,
          isClosed: slice.isClosed,
        })
        break
      case 'start_tag': {
        currentNode.children ??= []
        const element: XMLNode = {
          type: 'element',
          tag: slice.tag,
          start: slice.start,
          end: slice.end,
          parent: currentNode,
          isClosed: false,
        }
        currentNode.children.push(element)
        currentNode = element
        break
      }
      case 'end_tag': {
        if (currentNode.tag === slice.tag) {
          currentNode.end = slice.end
          currentNode.isClosed = slice.isClosed
          currentNode = currentNode.parent!
        } else {
          currentNode.children ??= []
          currentNode.children.push({
            type: 'text',
            tag: '',
            start: slice.start,
            end: slice.end,
            parent: currentNode,
            isClosed: slice.isClosed,
          })
        }
      }
    }
  }
  return root
}

async function *paraphraseXML(source: AsyncGenerator<string>) {
  let leftover = ''
  for await (const part of source) {
    const current = leftover + part
    const slices = parseXMLSlices(current)
    const doc = buildXMLDocument(slices)
    leftover = ''
    if (doc.children) {
      for (const node of doc.children) {
        if (node.isClosed) {
          const content = current.slice(node.start, node.end)
          yield {
            tag: node.type === 'element' ? node.tag : '',
            content,
          }
        } else {
          leftover = current.slice(node.start)
          break
        }
      }
    }
  }
}

export {
  paraphraseXML,
}
