import { shallowReactive } from 'vue'

const namespaces = shallowReactive<Record<string, any[]>>({})

function shareArray(name: string) {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (namespaces[name]) {
    return namespaces[name]
  }
  namespaces[name] = shallowReactive([])
  return namespaces[name]
}

function removeDataFromArray(name: string, ...data: any[]) {
  const sharedArray = shareArray(name)
  for (const item of data) {
    const index = sharedArray.indexOf(item)
    sharedArray.splice(index, 1)
  }
}

function shareDataIntoArray(name: string, ...data: any[]) {
  const sharedArray = shareArray(name)
  sharedArray.push(...data)
  if (data.length) {
    this.$.app.onCleanup(() => {
      removeDataFromArray(name, ...data)
    })
  }
}

export {
  shareArray,
  shareDataIntoArray,
  removeDataFromArray,
}
