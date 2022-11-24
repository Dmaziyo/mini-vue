import { reactive } from './reactivity/reactive'
import { effect } from './reactivity/effect'
import { h, Text, Fragment } from './runtime/vnode'
import { render } from './runtime/render'

const root = document.createElement('div')
const vnode = h(Fragment, null, [
  h('div'),
  h('span', null, 'hello world'),
  h(Fragment, null, [h('p'), h('h1')])
])
debugger
render(vnode, root)

const { children } = root
// expect(getTag(children[0])).toBe('div')
// expect(getTag(children[1])).toBe('span')
// expect(getTag(children[2])).toBe('p')
// expect(getTag(children[3])).toBe('h1')
// expect(children[1].textContent).toBe('hello world')
// expect(el.nodeType).toBe(Node.TEXT_NODE)
// expect(el.textContent).toBe('hello world')
// a嵌套的
// b非嵌套
//打印2嵌套的
