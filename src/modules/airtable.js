const base = require('../config/airtable')
const { DEFAULT_MAX_RECORDS } = require('../enums/default')
const {
  fieldBody,
  fieldLabel,
  fieldRepo,
  fieldTitle,
  maxRecords,
  tableName
} = require('../../config')

/**
 * Return airtable's linked record field given an id.
 *
 * @param {Object} options
 * @param {string} options.baseName
 * @param {string} options.id
 * @param {string} options.field
 * @returns {Promise<any>}
 */
async function getLinkedContent({ baseName, id, field }) {
  return new Promise((resolve, reject) => {
    base(baseName).find(id, (err, record) => {
      if (err) {
        reject(err)
        return
      }

      resolve(record.get(field))
    })
  })
}

/**
 * Return a formated URL for a record.
 *
 * @param {string} recordId
 * @returns {string}
 */
function getUrl(recordId) {
  return `${recordId}`
}

/**
 * Fetch stories for a given view.
 *
 * @param {Object} options
 * @param {string} options.view
 * @param {Function} [options.filterFunction]
 * @returns {{ id: number, label: string, repo: string, title: string, body: string }[]}
 */
function getStories({ view, filterFunction }) {
  return new Promise((resolve, reject) => {
    const stories = []

    base(tableName)
      .select({
        maxRecords: maxRecords || DEFAULT_MAX_RECORDS,
        view
      })
      .eachPage(
        async function page(records, fetchNextPage) {
          if (filterFunction) {
            try {
              const filteredRecord = []
              await Promise.all(
                records.map(async record => {
                  if (await filterFunction(record, module.exports)) {
                    filteredRecord.push(record)
                  }
                })
              )
              records = filteredRecord
            } catch (e) {
              reject(e)
            }
          }

          records.forEach(record =>
            stories.push({
              id: record.id,
              label: record.get(fieldLabel) || '',
              repo: record.get(fieldRepo),
              title: record.get(fieldTitle),
              body: record.get(fieldBody)
            })
          )
          fetchNextPage()
        },
        function done(err) {
          if (err) {
            reject(err)
          }

          resolve(stories)
        }
      )
  })
}

/**
 * Return if the view exist inside the base and if it contains records.
 *
 * @param {Object} options
 * @param {string} options.view
 * @returns {boolean}
 */
async function isViewViable({ view }) {
  return new Promise(resolve => {
    base(tableName)
      .select({
        maxRecords: 1,
        view
      })
      .eachPage(records => resolve(!!records.some(_ => _.id)), function done(
        err
      ) {
        if (err) resolve(false)
      })
  })
}

module.exports = {
  getLinkedContent,
  getLabel,
  getUrl,
  getStories,
  isViewViable
}
