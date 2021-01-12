const namespaces: Record<string, any[]> = {}

function shareArray(name: string) {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (namespaces[name]) {
    return namespaces[name]
  }
  namespaces[name] = []
  return namespaces[name]
}

function shareDataIntoArray(name: string, data: any) {
  const sharedArray = shareArray(name)
  sharedArray.push(data)
  this.$.app.onCleanup(() => {
    const index = sharedArray.indexOf(data)
    sharedArray.splice(index, 1)
  })
}

export {
  shareArray,
  shareDataIntoArray,
}
