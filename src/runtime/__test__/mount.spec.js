import { render } from '../render'
import { h, Text, Fragment } from '../vnode'

function getTag(el) {
  return el.tagName.toLowerCase()
}

describe('mount', () => {
  test('mount div', () => {
    const root = document.createElement('div')
    render(h('div'), root)
    expect(root.children.length).toBe(1)
    expect(getTag(root.childNodes[0])).toBe('div')
  })
  //   检测是否添加文本child成功
  test('mount div with text child', () => {
    const root = document.createElement('div')
    render(h('div', null, 'child text'), root)

    expect(root.children.length).toBe(1)
    const textNode = root.children[0].firstChild
    expect(textNode.nodeType).toBe(Node.TEXT_NODE)
    expect(textNode.textContent).toBe('child text')
  })
  test('mount div with multi child', () => {
    const root = document.createElement('div')
    const vnode = h('div', null, [
      h('span', null, 'span text'),
      h('div', null, [h('section'), h('p', null, 'child text')])
    ])
    render(vnode, root)
    let { children } = root.children[0]
    expect(getTag(children[0])).toBe('span')
    expect(children[0].textContent).toBe('span text')
    expect(getTag(children[1])).toBe('div')

    children = children[1].children
    expect(getTag(children[0])).toBe('section')
    expect(getTag(children[1])).toBe('p')
    expect(children[1].textContent).toBe('child text')
  })

  test('mount div class and style', () => {
    const root = document.createElement('div')
    const vnode = h(
      'div',
      {
        class: 'a b',
        style: {
          color: 'red',
          border: '1px solid'
        }
      },
      'hello world'
    )
    render(vnode, root)

    const div = root.children[0]
    expect(div.className).toBe('a b')
    expect(div.style.color).toBe('red')
    expect(div.style.border).toBe('1px solid')
  })
  test('mount input', () => {
    const root = document.createElement('div')
    const vnode = h('input', {
      type: 'checkbox',
      checked: true
    })
    render(vnode, root)

    const input = root.children[0]
    expect(getTag(input)).toBe('input')
    expect(input.type).toBe('checkbox')
    expect(input.checked).toBe(true)
  })
  test('mount text vnode', () => {
    const root = document.createElement('div')
    const vnode = h(Text, null, 'hello world')
    render(vnode, root)
    const el = root.firstChild
    expect(el.nodeType).toBe(Node.TEXT_NODE)
    expect(el.textContent).toBe('hello world')
  })
  test('mount fragment', () => {
    const root = document.createElement('div')
    const vnode = h(Fragment, null, [
      h('div'),
      h('span', null, 'hello world'),
      h(Fragment, null, [h('p'), h('h1')])
    ])
    render(vnode, root)
    const { children } = root
    expect(getTag(children[0])).toBe('div')
    expect(getTag(children[1])).toBe('span')
    expect(getTag(children[2])).toBe('p')
    expect(getTag(children[3])).toBe('h1')
    expect(children[1].textContent).toBe('hello world')
  })
})
