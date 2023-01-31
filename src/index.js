import { reactive, ref, computed } from './reactivity'
import { effect } from './reactivity/effect'
import { h, Text, Fragment } from './runtime/vnode'
import { render } from './runtime/render'

const root = document.createElement('div')
const firstName = ref('james')
const lastName = ref('bond')
const Comp = {
  setup() {
    const fullName = computed(() => {
      return `${firstName.value} ${lastName.value}`
    })

    return { fullName }
  },
  render(ctx) {
    return h('div', null, ctx.fullName.value)
  }
}
render(h(Comp), root)
debugger
// expect(root.innerHTML).toBe('<div>james bond</div>')

firstName.value = 'a'
// expect(root.innerHTML).toBe('<div>a bond</div>')

lastName.value = 'b'
// expect(root.innerHTML).toBe('<div>a b</div>')
