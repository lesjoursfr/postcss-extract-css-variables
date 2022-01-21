const { readFileSync } = require('fs')
const postcss = require('postcss')

const plugin = require('./')

function run(input, opts = {}) {
  return postcss([plugin(opts)]).process(input, { from: undefined })
}

it('leave the original CSS unchanged', async () => {
  const input = readFileSync('./test/input.css', { encoding: 'utf8' })
  let result = await run(input, { output: './test/output.css' })
  expect(result.css).toEqual(input)
  expect(result.warnings()).toHaveLength(0)
})

it('extract rules with CSS variables to a new file', async () => {
  const input = readFileSync('./test/input.css', { encoding: 'utf8' })
  let result = await run(input, { output: './test/output.css' })
  expect(readFileSync('./test/output.css', { encoding: 'utf8' })).toEqual(readFileSync('./test/expected.css', { encoding: 'utf8' }))
  expect(result.warnings()).toHaveLength(0)
})
