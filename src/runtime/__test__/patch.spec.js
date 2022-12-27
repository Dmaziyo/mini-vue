import { render } from '../render'
import { h, Text, Fragment } from '../vnode'

function getTag(el) {
  return el.tagName.toLowerCase()
}

let root
beforeEach(() => {
  root = document.createElement('div')
})

// 测试添加props,删除props
describe('patch props', () => {
  test('patch class', () => {
    let el
    render(h('div'), root)
    el = root.children[0]
    expect(el.className).toBeFalsy()

    render(h('div', {}), root)
    el = root.children[0]
    expect(el.className).toBeFalsy()

    render(h('div', { class: '' }), root)
    el = root.children[0]
    expect(el.className).toBe('')
    render(h('div', { class: 'a' }), root)

    render(h('div', { class: 'a' }), root)
    el = root.children[0]
    expect(el.className).toBe('a')

    render(h('div', { class: 'b' }), root)
    el = root.children[0]
    expect(el.className).toBe('b')

    render(h('div'), root)
    el = root.children[0]
    expect(el.className).toBeFalsy()
  })
  test('patch style', () => {
    let el
    const root = document.createElement('div')
    render(h('div'), root)
    el = root.children[0]
    expect(el.style.color).toBeFalsy()

    render(
      h('div', {
        style: { color: 'red' }
      }),
      root
    )
    el = root.children[0]
    expect(el.style.color).toBe('red')

    render(
      h('div', {
        style: {
          color: 'blue',
          border: '1px solid',
          fontSize: '12px'
        }
      }),
      root
    )
    el = root.children[0]
    expect(el.style.color).toBe('blue')
    expect(el.style.border).toBe('1px solid')
    expect(el.style.fontSize).toBe('12px')

    render(
      h('div', {
        style: {
          color: 'yellow'
        }
      }),
      root
    )
    el = root.children[0]
    expect(el.style.color).toBe('yellow')
    expect(el.style.border).toBeFalsy()
    expect(el.style.fontSize).toBeFalsy()
  })
  test('patch props and attrs', () => {
    let el
    const root = document.createElement('div')
    render(h('div'), root)
    el = root.children[0]
    expect(el.id).toBeFalsy()
    expect(el.getAttribute('foo')).toBeFalsy()

    // 赋值
    render(h('div', { id: 'a', foo: 'foo' }), root)
    el = root.children[0]
    expect(el.id).toBe('a')
    expect(el.getAttribute('foo')).toBe('foo')

    // 修改值
    render(h('div', { id: 'b', bar: 'bar' }), root)
    el = root.children[0]
    expect(el.id).toBe('b')
    expect(el.getAttribute('foo')).toBeFalsy()
    expect(el.getAttribute('bar')).toBe('bar')

    // 清空props
    render(h('div'), root)
    el = root.children[0]
    expect(el.id).toBeFalsy()
    expect(el.getAttribute('foo')).toBeFalsy()
    expect(el.getAttribute('bar')).toBeFalsy()
  })
  test('patch event', () => {
    let el,
      dummy = 0
    const root = document.createElement('div')
    render(h('div', { onClick: () => dummy++ }), root)
    el = root.children[0]
    el.click()
    expect(dummy).toBe(1)

    // 测试事件是否会重复绑定
    render(h('div', { onClick: () => dummy++ }), root)

    el = root.children[0]
    el.click()
    expect(dummy).toBe(2)

    // 测试删除事件
    const triggerMousedown = () => {
      const event = new Event('mousedown')
      el.dispatchEvent(event)
    }
    render(h('div', { onMousedown: () => (dummy += 10) }), root)
    el = root.children[0]
    el.click()
    expect(dummy).toBe(2)
    triggerMousedown()
    expect(dummy).toBe(12)
  })
})

describe('patch unkeyed nodes', () => {
  test('should patch previously empty children', () => {
    render(h('div', null, []), root)
    expect(root.children[0].textContent).toBeFalsy()

    render(h('div', null, 'hello'), root)
    expect(root.children[0].textContent).toBe('hello')
  })

  test('should patch previously null children', () => {
    render(h('div'), root)

    render(h('div', null, 'hello'), root)
    expect(root.children[0].textContent).toBe('hello')
  })
  test('array children -> text Children', () => {
    render(h('div', null, [h('p')]), root)

    render(h('div', null, 'hello'), root)
    expect(root.children[0].textContent).toBe('hello')
  })
})
