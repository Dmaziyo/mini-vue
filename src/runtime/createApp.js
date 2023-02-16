import { isFunction } from '../utils'
import { render } from './render'
import { h } from './vnode'

export function createApp(rootComponent) {
  const app = {
    mount(rootContainer) {
      if (typeof rootContainer === 'string') {
        rootContainer = document.querySelector(rootContainer)
      }

      //   当component为空时,直接继承rootContainer
      if (!isFunction(rootComponent.render) && !rootComponent.template) {
        rootComponent.template = rootContainer.innerHTML
      }
      rootContainer.innerHTML = ''

      render(h(rootComponent), rootContainer)
    }
  }
  return app
}
