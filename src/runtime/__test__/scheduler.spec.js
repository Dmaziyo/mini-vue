import { render } from '../render'
import { h, Text, Fragment } from '../vnode'
import { ref, reactive, effect, computed } from '../../reactivity'
import { nextTick } from '../scheduler'

let root
beforeEach(() => {
  root = document.createElement('div')
})

function createComp(fn) {
  return {
    setup() {
      const counter = ref(0)
      const click = () => {
        counter.value++
        counter.value++
        counter.value++
      }
      const click2 = () => {
        setTimeout(() => {
          counter.value++
          counter.value++
          counter.value++
        }, 100)
      }
      return {
        counter,
        click,
        click2
      }
    },
    render(ctx) {
      fn()
      return [
        h('div', null, ctx.counter.value),
        h('button', { onClick: ctx.click }, 'sync add'),
        h(
          'button',
          { onClick: ctx.click2, style: { marginLeft: '8px' } },
          'async add'
        )
      ]
    }
  }
}
describe('scheduler', () => {
  test('multi sync mutation will render only once', async () => {
    const spy = jest.fn()
    const Comp = createComp(spy)
    render(h(Comp), root)
    expect(spy).toHaveReturnedTimes(1)

    const div = root.children[0]
    const syncBtn = root.children[1]

    syncBtn.click()
    await nextTick()
    expect(div.innerHTML).toBe('3')
    expect(spy).toHaveReturnedTimes(2)
    syncBtn.click()
    syncBtn.click()
    await nextTick()
    expect(div.innerHTML).toBe('9')
    expect(spy).toHaveReturnedTimes(3)
  })
})
