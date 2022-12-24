import { h, Text, Fragment, ShapeFlags } from './vnode'
/**
 *
 * @param {*} vnode
 * @param {*} container  根元素DOM
 */
export function render(vnode, container) {
  // 现在的render就是与container之前的打补丁
  const prevVNode = container._vnode
  // 如果元素不存在,那么就意味解绑
  if (!vnode) {
    if (prevVNode) {
      unmount(prevVNode)
    }
  } else {
    // 否则就拿prev跟new Vnode进行对比,然后打补丁
    patch(prevVNode, vnode, container)
  }
  //   将vnode重新挂载到container上
  container._vnode = vnode
}

/**
 * 创建真正的Node,并且将vnode的props添加进去,然后把node添加至parent中
 * @param {*} vnode
 * @param {*} parent
 */

/**
 * DOM子元素类型: text | DOM
 */
function mountElement(vnode, container) {
  // 判断有无子元素,进一步判断是Text Children or Array Children
  const { type, props, children, shapeFlag } = vnode
  //   创建指定元素类型
  const el = document.createElement(type)
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    // 简化操作,直接控制属性值
    el.textContent = children
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(children, el)
  }
  if (props) {
    mountProps(el, props)
  }
  vnode.el = el
  container.appendChild(el)
}

// 因为这些属性的值是boolean,而setAttribute默认是字符串
const domPropsRE = /[A-Z]|^(value|checked|selected|muted)$/

/**
 * 绑定props,并且特殊情况的prop特殊处理
 * @param {*} el
 * @param {*} props
 */

function mountProps(el, props) {
  for (const key in props) {
    const value = props[key]
    switch (key) {
      case 'class':
        el.className = value
        break
      case 'style':
        for (const styleName in value) {
          el.style[styleName] = value[styleName]
        }
        break
      default:
        if (key.startsWith('on')) {
          el.addEventListener(key.slice(2).toLowerCase(), value)
        }
        // 单独设置值类型为boolean的属性
        else if (domPropsRE.test(key)) {
          el[key] = value
        } else {
          el.setAttribute(key, value)
        }
    }
  }
}

/**
 * 把vnode的children的text生成textNode
 * @param {*} vnode
 * @param {*} parent
 */
function mountTextNode(vnode, container) {
  const textNode = document.createTextNode(vnode.children)
  vnode.el = textNode
  container.appendChild(textNode)
}

/**
 *
 * @param {*} children
 * @param {*} container 上一级的根元素
 */
function mountChildren(children, container) {
  children.forEach(child => {
    patch(null, child, container)
  })
}

function mountComponent(vnode, container) {
  if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    mountStatefulComponent(vnode, container)
  } else {
  }
}

function mountStatefulComponent(vnode, container) {
  const { type: comp, props } = vnode
  // 判断组件是否有父组件传来的props
  const ctx = {}
  if (props && comp.props) {
    comp.props.forEach(key => {
      if (key in props) {
        ctx[key] = props[key]
      }
    })
  }
  const subtree = comp.render(ctx)
  patch(null, subtree, container)
}

function unmount(vnode) {
  const { shapeFlag, el } = vnode
  if (shapeFlag & ShapeFlags.COMPONENT) {
    unmountComponent(vnode)
  } else if (shapeFlag & ShapeFlags.FRAGMENT) {
    unmountFragment(vnode)
  } else {
    el.parentNode.removeChild(el)
  }
}

// todo
function unmountComponent(vnode) {}

function unmountFragment(vnode) {
  // 从startAnchor开始清除,直至清除Anchor包围的DOM数组
  let { el: cur, anchor: end } = vnode
  while (cur !== end) {
    let next = cur.nextSibling
    cur.parentNode.removeChild(cur)
    cur = next
  }
  end.parentNode.removeChild(end)
}
/**
 *
 * @param {*} n1 prevNode
 * @param {*} n2 new Vnode
 * @param {*} container
 */
function patch(n1, n2, container) {
  if (n1 && !isSameVNodeType(n1, n2)) {
    unmount(n1)
    n1 = null
  }
  // 根据元素的类型来进行不同的patch操作
  const { shapeFlag } = n2
  if (shapeFlag & ShapeFlags.COMPONENT) {
    processComponent(n1, n2, container)
  } else if (shapeFlag & ShapeFlags.TEXT) {
    processText(n1, n2, container)
  } else if (shapeFlag & ShapeFlags.FRAGMENT) {
    processFragment(n1, n2, container)
  } else if (shapeFlag & ShapeFlags.ELEMENT) {
    // dom元素的处理
    processElement(n1, n2, container)
  }
}

function isSameVNodeType(n1, n2) {
  return n1.type === n2.type
}

function processElement(n1, n2, container) {
  if (n1 == null) {
    // 说明已经大变样了,直接重新挂载
    mountElement(n2, container)
  } else {
    patchElement(n1, n2, container)
  }
}

function processFragment(n1, n2, container) {
  if (n1 == null) {
    const fragmentStartAnchor = (n2.el = document.createTextNode(''))
    const fragmentEndAnchor = (n2.anchor = document.createTextNode(''))
    // 作为空节点抢占位置
    container.appendChild(fragmentStartAnchor)
    mountChildren(n2.children, container)
    container.appendChild(fragmentEndAnchor)
  } else {
    patchChildren(n1, n2, container)
  }
}

function processText(n1, n2, container) {
  if (n1 == null) {
    mountTextNode(n2, container)
  } else {
    n2.el = n1.el
    n2.el.textContent = n2.children
  }
}

function processComponent(n1, n2, container) {
  if (n1 == null) {
    mountComponent(n2, container)
  } else {
  }
}

// todo
function patchElement(n1, n2, container) {}
