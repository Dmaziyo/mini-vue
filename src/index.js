import { reactive } from './reactivity/reactive'
import { effect } from './reactivity/effect'
import { h, Text, Fragment } from './runtime/vnode'
import { render } from './runtime/render'

const root = document.createElement('div')
const Comp = {
  render: () => {
    return h('div')
  }
}
render(h(Comp, { id: 'foo', class: 'bar' }), root)
