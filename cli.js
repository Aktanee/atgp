const { view } = require('minimist')(process.argv.slice(2))
const run = require('./src/index')

// Ignore if there is no view specified
if (!view) {
  console.error(
    'No view is specified, please specify a view using `--view="VIEW NAME"`'
  )
  return
}

run(view)
