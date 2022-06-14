const j = require('jscodeshift')
const writeValue = require('./writeValue')
const setKeyQuoteUsage = require('./setKeyQuoteUsage')

function load(src) {
  const ast = toAst(src)
  const root = ast.nodes()[0].program.body[0].expression

  // @param {Object|Array} value
  function write(value) {
    root.right = writeValue(root.right, value)
  }

  function toSource(options = {}) {
    // set default options
    options = Object.assign(
      {
        quote: 'single',
        trailingComma: true,
      },
      options
    )

    const sourceAst =
      options.quoteKeys === undefined
        ? ast
        : setKeyQuoteUsage(ast, options.quoteKeys)

    // strip the "x=" prefix
    return sourceAst.toSource(options).replace(/^x=([{\[])/m, '$1')
  }

  function toJSON(options = {}) {
    return toSource(
      Object.assign(
        {
          quote: 'double',
          trailingComma: false,
          quoteKeys: true
        },
        options
      )
    )
  }

  return { write, toSource, toJSON, ast: j(root.right) }
}

function toAst(src) {
  // find the start of the outermost array or object
  const expressionStart = src.match(/^\s*[{\[]/m)
  if (expressionStart) {
    // hackily insert "x=" so the JSON5 becomes valid JavaScript
    const astSrc = src.replace(/^\s*([{\[])/m, 'x=$1')
    return j(astSrc)
  }

  // no array or object exist in the JSON5
  return j('x={}')
}

module.exports = { load }
