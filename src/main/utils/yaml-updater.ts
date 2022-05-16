import type { Document, Node, Pair, ParsedNode, Scalar } from 'yaml'
import * as YAML from 'yaml'

function isEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b)
}

function updateNode(doc: Document, node: Node, data: any) {
  if (!YAML.isCollection(node)) {
    (node as Scalar).value = data
    return node
  }
  if (!data || typeof data !== 'object' || Array.isArray(data) !== YAML.isSeq(node)) {
    return doc.createNode(data)
  }
  if (YAML.isSeq(node)) {
    const items = [...node.items] as any[]
    Array.from(items.keys()).reduceRight((never, key, index) => {
      node.deleteIn([index])
      return never
    }, undefined)
    for (const value of data) {
      const item = items.find(el => isEqual(el, value))
      if (item) {
        node.add(updateNode(doc, item, value))
      } else {
        node.add(value)
      }
    }
  } else {
    const pairs = [...node.items] as Pair<Scalar<string>, any>[]
    for (const pair of pairs) {
      node.deleteIn([pair.key])
    }
    for (const [key, value] of Object.entries(data)) {
      const pair = pairs.find(item => item.key.value === key)
      if (pair) {
        node.add({
          key: pair.key,
          value: updateNode(doc, pair.value, value),
        })
      } else {
        node.add({ key, value })
      }
    }
  }
  return node
}

export function updateDocument(content: string, value: any) {
  const doc = YAML.parseDocument(content)
  doc.contents = updateNode(doc, doc.contents!, value) as ParsedNode
  return doc.toString()
}
