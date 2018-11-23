import Maye from './maye'
import path from './core/path'
import state from './core/state'
import accessor from './core/accessor'
import watcher from './core/watcher'
import action from './core/action'

Maye.use(path)
Maye.use(state)
Maye.use(accessor)
Maye.use(watcher)
Maye.use(action)

export default Maye
