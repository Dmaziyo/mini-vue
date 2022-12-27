import { reactive } from './reactivity/reactive'
import { effect } from './reactivity/effect'
import { h, Text, Fragment } from './runtime/vnode'
import { render } from './runtime/render'

const root = document.createElement('div')
render(
  h('div', null, [h(Text, null, 'text1'), h('p', null, [h(Text, null, 'text2')])]),
  root
)
render(h('div', null, [h('p', null, [])]), root)
