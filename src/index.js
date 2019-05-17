require('dotenv-safe').config()

const { DEFAULT_DEFAULT_COLUMN_NAME } = require('./enums/default')
const { getStories, isViewViable } = require('./modules/airtable')
const { configValidator, isRequired } = require('./modules/validator')
const {
  createDefaultColumns,
  createProject,
  createTicketsForProject,
  getProjectLink,
  listColumns,
  listProjects
} = require('./modules/github')
const config = require('../config')
const { filterFunction, defaultColumnName } = config

async function run(view = isRequired('view')) {
  try {
    // Verify that the config is suffisant
    const configErrors = configValidator(config)
    if (configErrors) {
      throw new Error(`The configuration is not suffisant: 
${configErrors.map(config => `\n - ${config}`)}`)
    }

    console.log(configErrors)

    // Verify that a view currently exist
    if (!(await isViewViable({ view }))) {
      throw new Error(`No view named ${view} is currently viable`)
    }

    // Create or fetch the Github project
    const existingProjects = await listProjects()
    const projectId = await createProject({
      view,
      existingProjects
    })

    // Create the default column for a project if they doesn't already exist
    const existingColumns = await listColumns({ projectId })

    // Create the default column 'To do', 'In progress' and 'Done'
    // The automation provided by Github will be handled manually since there is
    // no current way to activated via the Octokit API
    await createDefaultColumns({
      existingColumnsName: existingColumns.map(_ => _.name),
      projectId
    })

    const [columns, stories] = await Promise.all([
      // Get all the current columns from the project
      listColumns({ projectId }),
      // Get all stories from the project
      getStories({
        view,
        filterFunction: filterFunction ? filterFunction : undefined
      })
    ]).catch(err => {
      throw new Error(err)
    })

    const columnName = defaultColumnName || DEFAULT_DEFAULT_COLUMN_NAME
    // Get the column ID that will be used by default
    const defaultColumn = columns.find(
      _ => (_.name === columnName ? _.id : false)
    )
    if (!defaultColumn) {
      throw new Error(
        `The default column "${columnName}" was not correctly created`
      )
    }

    // Create all the ticket for the project
    await createTicketsForProject({
      columnId: defaultColumn.id,
      tickets: stories
    })

    const projectUrl = await getProjectLink(projectId)

    console.log(`\nProject is live at ${projectUrl}`)
  } catch (e) {
    console.error(e)
  }
}

module.exports = run
