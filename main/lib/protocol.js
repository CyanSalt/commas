const { app } = require('electron')

/**
 * @typedef {Object} Route
 * @property {string} name
 * @property {(url: URL) => unknown} handler
 */

/**
 * @type {Route[]}
 */
let routes = []

/**
 * @param {string} name
 * @param {(url: URL) => unknown} handler
 */
function addRoute(name, handler) {
  routes.push({ name, handler })
}

/**
 * @param {string} name
 */
function removeRoute(name) {
  routes = routes.filter(route => route.name !== name)
}

function startServingProtocol() {
  app.setAsDefaultProtocolClient(app.name)
}

/**
 * @param {string} url
 */
function handleProtocolRequest(url) {
  url = new URL(url)
  for (const route of routes) {
    if (url.hostname === route.name) {
      route.handler.call(undefined, url)
    }
  }
}

module.exports = {
  addRoute,
  removeRoute,
  startServingProtocol,
  handleProtocolRequest,
}
