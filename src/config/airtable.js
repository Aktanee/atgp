const airtable = require('airtable')
const { baseId } = require('../../config')

airtable.configure({
  endpointUrl: 'https://api.airtable.com',
  apiKey: process.env.AIRTABLE_KEY
})

module.exports = airtable.base(baseId)
