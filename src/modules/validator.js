const {
  DEFAULT_DEFAULT_COLUMN_NAME,
  DEFAULT_COLUMNS
} = require('../enums/default')

const NECESSARY_PRESENT_FIELDS = [
  'baseId',
  'defaultRepo',
  'fieldRepo',
  'fieldTitle',
  'owner',
  'tableName'
]

/**
 * Verify that param are explicitly passed.
 *
 * @param {string} paramName
 */
function isRequired(paramName) {
  throw new Error(`The paramater "${paramName}" is required`)
}

/**
 * Verify the viability of a given configuration.
 *
 * @param {UserConfiguration} config
 * @returns {Array<string>|boolean}
 */
function configValidator(config) {
  const errors = []

  // Verify that all fields without default are renseigned
  NECESSARY_PRESENT_FIELDS.map(field => {
    if (typeof config[field] === 'undefined') {
      errors.push(`The field "${field}" is not present`)
    }
  })

  // Verify there is no incoherences if defaultColumns fields are renseigned
  if (config.defaultColumns && config.defaultColumnName) {
    if (!config.defaultColumns.includes(config.defaultColumnName)) {
      errors.push(
        `The defaultColumnName "${
          config.defaultColumnName
        }" is not present in defaultColumns "${config.defaultColumns}"`
      )
    }
  } else if (config.defaultColumns) {
    if (!config.defaultColumns.includes('To do')) {
      errors.push(
        `The defaultColumns "${
          config.defaultColumns
        }" don't include the defaultColumnName "${DEFAULT_DEFAULT_COLUMN_NAME}"`
      )
    }
  } else if (config.defaultColumnName) {
    if (!DEFAULT_COLUMNS.includes(config.defaultColumnName)) {
      errors.push(
        `The defaultColumnName "${
          config.defaultColumnName
        }" is not present in defaultColumns "${DEFAULT_COLUMNS}"`
      )
    }
  }

  // Verify that maxRecords if a positive number
  if (config.maxRecords) {
    const number = parseInt(config.maxRecords)
    if (typeof config.maxRecords !== 'number' || number <= 0) {
      errors.push(
        `The value "${
          config.maxRecords
        }" for maxRecords is not a positive number`
      )
    }
  }

  return errors.length > 0 ? errors : false
}

module.exports = {
  configValidator,
  isRequired
}
