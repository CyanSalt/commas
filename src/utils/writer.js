import * as codeshift from 'jscodeshift'

function write(node, data) {
  if (data === undefined) {
    return node
  }
  const type = node ? node.type : ''
  if (Array.isArray(data)) {
    if (type !== 'ArrayExpression') {
      node = codeshift.arrayExpression([])
    }
    data.forEach((item, index) => {
      node.elements[index] = write(node.elements[index], item)
    })
    node.elements.length = data.length
  } else if (typeof data === 'object' && data !== null) {
    if (type !== 'ObjectExpression') {
      node = codeshift.objectExpression([])
    }
    // TODO: consider order, not to replace all
    const result = []
    Object.entries(data).forEach(([name, value]) => {
      let property = node.properties.find(
        ({key}) => (key.name || key.value) === name
      )
      if (property) {
        property.value = write(property.value, value)
      } else {
        property = codeshift.property(
          'init',
          codeshift.literal(name),
          write(undefined, value)
        )
      }
      result.push(property)
    })
    node.properties = result
  } else {
    if (type !== 'Literal') {
      node = codeshift.literal(data)
    } else {
      node.value = data
    }
  }
  return node
}

const EXPORTS = 'exports='

class Writer {
  constructor(source) {
    Object.defineProperty(this, 'ast', {
      value: codeshift(EXPORTS + source.toString().trim()),
      configurable: false,
    })
  }
  write(value) {
    const root = this.ast.nodes()[0].program.body[0].expression
    root.right = write(root.right, value)
  }
  toSource() {
    let source = this.ast.toSource({
      quote: 'double',
      quoteKeys: true,
    })
    if (source.startsWith(EXPORTS)) {
      source = source.slice(EXPORTS.length)
    }
    return source
  }
}

export default Writer
