const dynamicRequire = ({ moduleIds }) => ({
  name: 'dynamic-require',
  enforce: 'post',
  transform(code) {
    const ast = this.parse(code)
    let lastIndex = 0
    let transformedCode = ''
    let dynamicRequireCode = ''
    let endIndex = 0
    const importDeclarations = ast.body
      .filter(statement => statement.type === 'ImportDeclaration')
    if (importDeclarations.length) {
      endIndex = importDeclarations[importDeclarations.length - 1].end
    }
    for (const statement of importDeclarations) {
      if (statement.type === 'ImportDeclaration') {
        const source = statement.source
        if (source.type === 'Literal' && moduleIds.includes(source.value)) {
          transformedCode = code.slice(lastIndex, statement.start)
          lastIndex = statement.end
          const namespaceSpecifier = statement.specifiers
            .find(specifier => specifier.type === 'ImportNamespaceSpecifier')
          if (namespaceSpecifier) {
            dynamicRequireCode += `\nconst ${namespaceSpecifier.local.name} = require(${source.raw});`
          }
          const normalSpecifiers = statement.specifiers
            .filter(specifier => specifier.type === 'ImportSpecifier')
          if (normalSpecifiers.length) {
            dynamicRequireCode += `\nconst { ${
              normalSpecifiers.map(specifier => (specifier.imported.name === specifier.local.name ? specifier.imported.name : `${specifier.imported.name}: ${specifier.local.name}`)).join(', ')
            } } = require(${source.raw});`
          }
        }
      }
    }
    if (dynamicRequireCode) {
      transformedCode += code.slice(lastIndex, endIndex)
      transformedCode += dynamicRequireCode
      transformedCode += code.slice(endIndex)
    } else {
      transformedCode += code.slice(lastIndex)
    }
    return transformedCode
  },
})

module.exports = dynamicRequire
