/**
 * Return user configuration.
 *
 * @returns {import('./src/enums/types').UserConfiguration}
 */
function config() {
  return {
    baseId: 'BASE_ID',
    tableName: 'AIRTABLE_TABLE_NAME',
    owner: 'GITHUB_USERNAME',
    defaultRepo: 'GITHUB_REPO',
    fieldRepo: 'Repo',
    fieldTitle: 'Title',
    fieldLabel: 'Label',
    fieldBody: 'Body'
  }
}

module.exports = config()
