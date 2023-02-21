import { compile } from '../compiler/compile'
import { reactive, effect } from '../reactivity'
import { queueJob } from './scheduler'
import { normalizeVNode } from './vnode'

function updateComponentProps(instance, vnode) {
  const { type: originalComp, props: vnodeProps } = vnode

  // 将暴露的props和dom的props进行分离
  for (const key in vnodeProps) {
    if (originalComp.props && originalComp.props.includes(key)) {
      instance.props[key] = vnodeProps[key]
    } else {
      instance.attrs[key] = vnodeProps[key]
    }
  }
  instance.props = reactive(instance.props)
}

export function mountComponent(vnode, container, anchor, patch) {
  /* originalComp: props 组件暴露的属性,
                     render 用于生成组件的函数,
                     setup() {
                        const count = ref(0);
                        const add = () => count.value++;
                        return {
                          count,
                          add,
                        };
                      },
    */
  const { type: originalComp } = vnode

  // component实例
  const instance = {
    props: {},
    attrs: {},
    setupState: null,
    ctx: null,
    update: null,
    isMounted: false
  }

  updateComponentProps(instance, vnode)

  // props也是需要响应式的
  instance.setupState = originalComp.setup?.(instance.props, {
    attrs: instance.attrs
  })

  instance.ctx = {
    ...instance.props,
    ...instance.setupState
  }
  // 使用template的时候没有render,需要parse变成render函数
  if (!originalComp.render && originalComp.template) {
    let { template } = originalComp
    if (template[0] === '#') {
      const el = document.querySelector(template)
      template = el ? el.innerHTML : ''
    }
    originalComp.render = new Function('_ctx', compile(template))
  }

  // 用于主动更新,即ctx里面的值发生变化,主动更新一次
  instance.update = effect(
    () => {
      if (!instance.isMounted) {
        const subTree = (instance.subTree = normalizeVNode(
          originalComp.render(instance.ctx)
        ))
        // 将组件render函数返回的vnode中的props与Component组件中传入的props但没有暴露的结合在一起
        if (Object.keys(instance.attrs)) {
          subTree.props = {
            ...subTree.props,
            ...instance.attrs
          }
        }
        patch(null, subTree, container, anchor)
        instance.isMounted = true
        vnode.el = subTree.el
      } else {
        // 如果next存在,
        // 说明是被动更新:parent Vnode发生变化,则说明父组件传来的props可能有变化
        // 反之为主动更新:自身props 发生变化
        if (instance.next) {
          vnode = instance.next
          instance.next = null
          instance.props = reactive(instance.props)

          // 先更新从父组件传来的props
          updateComponentProps(instance, vnode)
          instance.ctx = {
            ...instance.props,
            ...instance.setupState
          }
        }

        const prev = instance.subTree
        // 即使返回的是数组,我们可以自己进行normalize
        const subTree = (instance.subTree = normalizeVNode(
          originalComp.render(instance.ctx)
        ))
        if (Object.keys(instance.attrs)) {
          subTree.props = {
            ...subTree.props,
            ...instance.attrs
          }
        }
        patch(prev, subTree, container, anchor)
        vnode.el = subTree.el
      }
    },
    { scheduler: queueJob }
  )
  vnode.component = instance
}
