import { reactive, ref, computed } from './reactivity'
import { effect } from './reactivity/effect'
import { h, Text, Fragment } from './runtime/vnode'
import { render } from './runtime/render'

const root = document.createElement('div')
const value = ref(true)
let parentVnode
let childVnode1
let childVnode2

const Parent = {
  render: () => {
    return (parentVnode = h(Child))
  }
}

const Child = {
  render: () => {
    return value.value ? (childVnode1 = h('div')) : (childVnode2 = h('span'))
  }
}

render(h(Parent), root)
// expect(root.innerHTML).toBe('<div></div>')
// expect(parentVnode.el).toBe(childVnode1.el)
debugger
value.value = false
console.log(value.value)
// expect(root.innerHTML).toBe(`<span></span>`)
// expect(parentVnode.el).toBe(childVnode2.el)
