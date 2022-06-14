const j = require('jscodeshift')

function setKeyQuoteUsage(ast, enabled) {
  return j(ast.toSource())
    .find(j.ObjectExpression)
    .forEach(path => {
      path.value.properties.forEach(prop => {
        if (enabled) {
          quoteKey(prop)
        } else {
          unquoteKey(prop)
        }
      })
    })
}

function quoteKey(prop) {
  if (prop.key.type === 'Identifier') {
    prop.key = j.literal(prop.key.name)
  }
}

function unquoteKey(prop) {
  if (prop.key.type === 'Literal') {
    prop.key = j.identifier(prop.key.value)
  }
}

module.exports = setKeyQuoteUsage
