import { render } from '../render'
import { h, Text, Fragment } from '../vnode'
import { ref, reactive, effect, computed } from '../../reactivity'

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

  test('mount multi components', () => {
    const Comp = {
      props: ['text'],
      render(ctx) {
        return h('div', null, ctx.text)
      }
    }
    render(
      h(Fragment, null, [
        h(Comp, { text: 'text1' }),
        h(Comp, { text: 'text2' }),
        h(Comp, { id: 'id' })
      ]),
      root
    )
    expect(root.innerHTML).toBe(
      '<div>text1</div><div>text2</div><div id="id"></div>'
    )
  })
  test('mount nested components', () => {
    const GrandChild = {
      props: ['text'],
      render(ctx) {
        return h('p', null, ctx.text)
      }
    }

    const Child = {
      props: ['text'],
      render(ctx) {
        return h(Fragment, null, [
          h('div', null, ctx.text),
          h(GrandChild, { text: ctx.text, id: 'id' }),
          h(GrandChild, { text: 'hello' })
        ])
      }
    }

    const Comp = {
      props: ['text'],
      render(ctx) {
        return h(Child, { text: ctx.text })
      }
    }
    render(h(Comp, { text: 'text', id: 'id' }), root)
    expect(root.innerHTML).toBe('<div>text</div><p id="id">text</p><p>hello</p>')
  })
})

describe('unmount component', () => {
  test('unmount from root', () => {
    const Comp = {
      render() {
        return h('div')
      }
    }
    render(h(Comp), root)
    expect(root.innerHTML).toBe('<div></div>')

    render(null, root)
    expect(root.innerHTML).toBe('')
  })
  test('unmount from inner', () => {
    const Comp = {
      render() {
        return h('div')
      }
    }
    render(h('div', null, [h(Comp)]), root)
    expect(root.innerHTML).toBe('<div><div></div></div>')
    render(h('div'), root)
    expect(root.innerHTML).toBe('<div></div>')
  })
  test('unmount multi components', () => {
    const Comp = {
      render() {
        return h('div')
      }
    }
    render(h(Fragment, null, [h(Comp), h(Comp), h(Comp)]), root)
    expect(root.innerHTML).toBe('<div></div><div></div><div></div>')
    render(null, root)
    expect(root.innerHTML).toBe('')
  })
  test('unmount nested components', () => {
    const Comp = {
      render() {
        return h(Child)
      }
    }
    const Child = {
      render() {
        return h(Fragment, null, [
          h('div'),
          h(GrandChild),
          h('div', null, [h(GrandChild)])
        ])
      }
    }
    const GrandChild = {
      render() {
        return h('p')
      }
    }
    render(h(Comp), root)
    expect(root.innerHTML).toBe('<div></div><p></p><div><p></p></div>')
    render(null, root)
    expect(root.innerHTML).toBe('')
  })
})

describe('update component trigger by self', () => {
  test('setup result with event and update', () => {
    const Comp = {
      setup() {
        const counter = ref(0)
        const click = () => {
          counter.value++
        }
        return {
          counter,
          click
        }
      },
      render(ctx) {
        return h('div', { onClick: ctx.click }, ctx.counter.value)
      }
    }
    render(h(Comp), root)
    expect(root.innerHTML).toBe('<div>0</div>')
    root.children[0].click()
    expect(root.innerHTML).toBe('<div>1</div>')
    root.children[0].click()
    root.children[0].click()
    expect(root.innerHTML).toBe('<div>3</div>')
  })
  test('reactive child ,style and class', () => {
    const observed = reactive({
      child: 'child',
      class: 'a',
      style: {
        color: 'red'
      }
    })
    const Comp = {
      setup() {
        return {
          observed
        }
      },
      render(ctx) {
        return h(
          'div',
          {
            class: ctx.observed.class,
            style: ctx.observed.style
          },
          ctx.observed.child
        )
      }
    }
    render(h(Comp), root)
    expect(root.innerHTML).toBe('<div class="a" style="color: red;">child</div>')
    observed.class = 'b'
    expect(root.innerHTML).toBe('<div class="b" style="color: red;">child</div>')

    observed.style.color = 'blue'
    expect(root.innerHTML).toBe('<div class="b" style="color: blue;">child</div>')

    observed.child = ''
    expect(root.innerHTML).toBe('<div class="b" style="color: blue;"></div>')
  })
  test('observed props', () => {
    const observed = reactive({
      child: 'child',
      class: 'a',
      style: {
        color: 'red'
      }
    })
    const Comp = {
      render() {
        return h('div', observed)
      }
    }
    render(h(Comp), root)
    expect(root.innerHTML).toBe(
      '<div child="child" class="a" style="color: red;"></div>'
    )
    observed.class = 'b'
    expect(root.innerHTML).toBe(
      '<div child="child" class="b" style="color: red;"></div>'
    )

    observed.style.color = 'blue'
    expect(root.innerHTML).toBe(
      '<div child="child" class="b" style="color: blue;"></div>'
    )

    observed.child = ''
    expect(root.innerHTML).toBe(
      '<div child="" class="b" style="color: blue;"></div>'
    )
  })
  test('computed and ref props', () => {
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
    expect(root.innerHTML).toBe('<div>james bond</div>')

    firstName.value = 'a'
    expect(root.innerHTML).toBe('<div>a bond</div>')

    lastName.value = 'b'
    expect(root.innerHTML).toBe('<div>a b</div>')
  })
})
