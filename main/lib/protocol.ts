import { app } from 'electron'

interface Route {
  name: string,
  handler: (url: URL) => void,
}

let routes: Route[] = []

function addRoute(name: string, handler: (url: URL) => void) {
  routes.push({ name, handler })
}

function removeRoute(name: string) {
  routes = routes.filter(route => route.name !== name)
}

function startServingProtocol() {
  app.setAsDefaultProtocolClient(app.name)
}

function handleProtocolRequest(href: string) {
  const url = new URL(href)
  for (const route of routes) {
    if (url.hostname === route.name) {
      route.handler.call(undefined, url)
    }
  }
}

export {
  addRoute,
  removeRoute,
  startServingProtocol,
  handleProtocolRequest,
}
