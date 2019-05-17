const github = require('../config/github')
const { DEFAULT_COLUMNS } = require('../enums/default')
const { defaultColumns, owner, defaultRepo } = require('../../config')

/**
 * Create project if not already present, then return the project id.
 *
 * @param {Object} options
 * @param {string} options.view
 * @param {{ string: number }[]} options.existingProjects
 * @returns {number}
 */
async function createProject({ view, existingProjects }) {
  if (Object.keys(existingProjects).includes(view)) {
    console.log(`Project with a similar name "${view}" already exist`)
    return existingProjects[view]
  }

  const { data } = await github.projects.createForOrg({
    org: owner,
    name: view
  })

  if (data.id) {
    console.log(`Successfully created the project "${view}"`)
    return data.id
  }
}

/**
 * List all projects for authentificated user.
 *
 * @returns {{ string: number }[]}
 */
async function listProjects() {
  const { data } = await github.projects.listForOrg({
    org: owner
  })

  return data.reduce((memo, { id, name }) => {
    memo[name] = id
    return memo
  }, {})
}

/**
 * Create issue and ticket for a given project.
 *
 * @param {Object} options
 * @param {Object} options.ticket
 * @param {string} options.ticket.repo
 * @param {string} options.ticket.title
 * @param {string} options.ticket.body
 * @param {string} options.ticket.label
 * @param {number} options.ticket.id
 * @param {number} options.columnId
 * @returns {undefined}
 */
async function createTicketForProject({ ticket, columnId }) {
  const issues = await github.issues.listForRepo({
    owner,
    repo: ticket.repo || defaultRepo
  })

  if (issues.data.map(_ => _.title).includes(ticket.title)) {
    console.info(`The ticket ${ticket.title} for ${ticket.repo} already exist`)
    return
  }
  const createdIssue = await github.issues.create({
    owner,
    repo: ticket.repo || defaultRepo,
    title: ticket.title,
    body: ticket.body,
    labels: ticket.label ? [ticket.label] : []
  })
  if (!createdIssue.data.id) {
    console.error(`Initial issue not created, Airtable ID: "${ticket.id}"`)
    return
  }
  await github.projects.createCard({
    content_id: createdIssue.data.id,
    column_id: columnId,
    content_type: 'Issue'
  })
  console.log(
    console.info(`The ticket ${ticket.title} for ${ticket.repo} was created`)
  )
}

/**
 * Create issues and tickets for a given project.
 *
 * @param {Object} options
 * @param {Object[]} options.tickets
 * @param {string} options.tickets.repo
 * @param {string} options.tickets.title
 * @param {string} options.tickets.body
 * @param {string} options.tickets.label
 * @param {number} options.tickets.id
 * @param {number} options.columnId
 */
async function createTicketsForProject({ tickets, columnId }) {
  await Promise.all(
    tickets.map(async ticket => {
      return await createTicketForProject({ ticket, columnId })
    })
  )
}

/**
 * Create if not existing default columns "To do", "In progress", "Done".
 *
 * @param {Object} options
 * @param {string[]} options.existingColumnsName
 * @param {number} options.projectId
 */
async function createDefaultColumns({ existingColumnsName, projectId }) {
  await Promise.all(
    (defaultColumns || DEFAULT_COLUMNS).map(async name => {
      if (existingColumnsName.includes(name)) {
        console.log(`Column with the name "${name}" already exist`)
        return
      }

      await github.projects.createColumn({
        project_id: projectId,
        name
      })
    })
  )
}

/**
 * List columns for a given project.
 *
 * @param {Object} options
 * @param {number} options.projectId
 * @returns {{id: number, name: string }[]}
 */
async function listColumns({ projectId }) {
  const { data } = await github.projects.listColumns({
    project_id: projectId
  })
  return data
}

/**
 * Fetch the HTML link of the project.
 *
 * @param {number} projectId
 * @returns {string}
 */
async function getProjectLink(projectId) {
  const { data } = await github.projects.get({
    project_id: projectId
  })
  return data.html_url
}

module.exports = {
  createDefaultColumns,
  createProject,
  createTicketForProject,
  createTicketsForProject,
  getProjectLink,
  listColumns,
  listProjects
}
