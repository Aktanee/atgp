/**
 * @typedef {import('../modules/airtable')} AirtableModuleExports
 */

/**
 * @typedef {Object} FilterFunction
 * @property {AirtableRecord} record
 * @property {AirtableModuleExports} context
 * @returns {Promise<Boolean>}
 */

/**
 * @typedef {Object} UserConfiguration
 * @property {FilterFunction} filterFunction - Function used against an array of Airtable Record to filter out unwanted records
 * @property {string} baseId - The base ID where the view will be located, you can find the ID inside [Airtable Documentation API](https://airtable.com/api).
 * @property {string} tableName - The table where you are gonna return the tickets.
 * @property {string[]} [defaultColumns] - The default columns who shall be present on a project.
 * @property {string} [defaultColumnName] - The column where the ticket will be put by default.
 * @property {number} [maxRecords] - The max number of records fetch by the Airtable API.
 * @property {string} owner - The owner of the Github project.
 * @property {string} defaultRepo - The default project to add an issue to.
 * @property {string} fieldRepo - The Airtable field to associate a Github repo to an issue
 * @property {string} fieldTitle - The Airtable field to use for creating a Github issue
 * @property {string} [fieldLabel] - The Airtable field to associate an issue with a label
 * @property {string} fieldBody - The Airtable field to associate an issue with a body
 */
