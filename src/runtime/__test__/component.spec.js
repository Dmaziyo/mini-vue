import { render } from '../render'
import { h, Text, Fragment } from '../vnode'
import { ref, reactive, effect } from '../../reactivity'

let root
beforeEach(() => {
  root = document.createElement('div')
})

describe('mount component', () => {
  test('mount simple component', () => {
    const Comp = {
      render() {
        return h('div')
      }
    }
    render(h(Comp), root)
    expect(root.innerHTML).toBe('<div></div>')
  })

  test('mount component with props', () => {
    let foo, bar
    const Comp = {
      props: ['foo'],
      render(ctx) {
        foo = ctx.foo
        bar = ctx.bar
        return h('div', null, ctx.foo)
      }
    }
    render(h(Comp, { foo: 'foo', bar: 'bar' }), root)
    expect(root.innerHTML).toBe('<div bar="bar">foo</div>')
    expect(foo).toBe('foo')
    expect(bar).toBeUndefined()
  })

  it('should create an Component with props', () => {
    const Comp = {
      render: () => {
        return h('div')
      }
    }
    render(h(Comp, { id: 'foo', class: 'bar' }), root)
    expect(root.innerHTML).toBe(`<div id="foo" class="bar"></div>`)
  })

  // 测试normalize
  it('should create an Component with direct text children', () => {
    const Comp = {
      render: () => {
        return h('div', null, 'test')
      }
    }
    render(h(Comp, { id: 'foo', class: 'bar' }), root)
    expect(root.innerHTML).toBe(`<div id="foo" class="bar">test</div>`)
  })
  it('should expose return values to template render context', () => {
    const Comp = {
      setup() {
        return {
          ref: ref('foo'),
          object: reactive({ msg: 'bar' }),
          value: 'baz'
        }
      },
      render(ctx) {
        return `${ctx.ref.value} ${ctx.object.msg} ${ctx.value}`
      }
    }
    render(h(Comp), root)
    expect(root.innerHTML).toBe(`foo bar baz`)
  })
})
