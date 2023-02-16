import { reactive, ref, computed, effect } from './reactivity'
import { h, Text, Fragment } from './runtime/vnode'
import { createApp } from './runtime/createApp'

const root = document.createElement('div')

const Comp = {
  setup() {
    const counter = ref(0)
    const add = () => {
      counter.value++
    }
    return {
      counter,
      add
    }
  },
  render(ctx) {
    return [
      h('div', null, ctx.counter.value),
      h('button', { onClick: ctx.add }, 'add')
    ]
  }
}

createApp(Comp).mount(root)
document.body.appendChild(root)
