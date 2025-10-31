import { useEffect, useState } from 'react'
import type { Ref } from 'vue'
import { watch } from 'vue'

export function useVueRef<T>(ref: Ref<T>) {
  const [state, setState] = useState(ref.value)
  useEffect(() => {
    return watch(ref, value => {
      setState(value)
    })
  }, [setState])
  return state
}
