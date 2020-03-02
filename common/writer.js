import * as recast from 'recast'

const {namedTypes, builders} = recast.types

function write(node, data) {
  if (data === undefined) {
    return node
  }
  if (Array.isArray(data)) {
    if (!namedTypes.ArrayExpression.check(node)) {
      node = builders.arrayExpression([])
    }
    data.forEach((item, index) => {
      node.elements[index] = write(node.elements[index], item)
    })
    node.elements.length = data.length
  } else if (typeof data === 'object' && data !== null) {
    if (!namedTypes.ObjectExpression.check(node)) {
      node = builders.objectExpression([])
    }
    // TODO: consider order, not to replace all
    const result = []
    Object.entries(data).forEach(([name, value]) => {
      let property = node.properties.find(({key}) => key.value === name)
      if (property) {
        property.value = write(property.value, value)
      } else {
        property = builders.property(
          'init',
          builders.literal(name),
          write(undefined, value)
        )
      }
      result.push(property)
    })
    node.properties = result
  } else {
    if (!namedTypes.Literal.check(node)) {
      node = builders.literal(data)
    } else {
      node.value = data
    }
  }
  return node
}

const EXPORTS = 'exports='

class Writer {
  constructor(source) {
    this.ast = recast.parse(EXPORTS + source.toString().trim())
  }
  write(value) {
    const root = this.ast.program.body[0].expression
    root.right = write(root.right, value)
  }
  toSource() {
    const result = recast.print(this.ast, {
      quote: 'double',
    })
    let source = result.code
    if (source.startsWith(EXPORTS)) {
      source = source.slice(EXPORTS.length)
    }
    return source
  }
}

export default Writer
