import { render } from '../render'
import { h, Text, Fragment } from '../vnode'

let root
beforeEach(() => {
  root = document.createElement('div')
})

describe('renderer: component', () => {
  it('should create an Component with props', () => {
    const Comp = {
      render: () => {
        return h('div')
      }
    }
    render(h(Comp, { id: 'foo', class: 'bar' }), root)
    expect(root.innerHTML).toBe(`<div id="foo" class="bar"></div>`)
  })
})
