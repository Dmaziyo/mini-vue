import { isEmpty } from '../utils'
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
 *
 * @param {*} n1 prevNode
 * @param {*} n2 new Vnode
 * @param {*} container
 * @param {*} anchor
 */
function patch(n1, n2, container, anchor) {
  // 如果存在prevNode且不是相同类型,那么anchor也可以找到,如果没有anchor,那么就是唯一的子元素
  if (n1 && !isSameVNodeType(n1, n2)) {
    // 如果不是sameType,就进行patch操作即可
    anchor = (n1.anchor || n1.el).nextSibling
    unmount(n1)
    n1 = null
  }
  // 根据元素的类型来进行不同的patch操作
  const { shapeFlag } = n2
  if (shapeFlag & ShapeFlags.COMPONENT) {
    processComponent(n1, n2, container, anchor)
  } else if (shapeFlag & ShapeFlags.TEXT) {
    processText(n1, n2, container, anchor)
  } else if (shapeFlag & ShapeFlags.FRAGMENT) {
    processFragment(n1, n2, container, anchor)
  } else if (shapeFlag & ShapeFlags.ELEMENT) {
    // dom元素的处理
    processElement(n1, n2, container, anchor)
  }
}

/**
 * 创建真正的Node,并且将vnode的props添加进去,然后把node添加至parent中
 * @param {*} vnode
 * @param {*} parent
 */

/**
 * DOM子元素类型: text | DOM
 */
function mountElement(vnode, container, anchor) {
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
    patchProps(el, null, props)
  }
  vnode.el = el
  container.insertBefore(el, anchor || null)
}

/**
 * 把vnode的children的text生成textNode
 * @param {*} vnode
 * @param {*} parent
 */
function mountTextNode(vnode, container, anchor) {
  const textNode = document.createTextNode(vnode.children)
  vnode.el = textNode
  container.insertBefore(textNode, anchor || null)
}

/**
 *
 * @param {*} children
 * @param {*} container 上一级的根元素
 */
function mountChildren(children, container, anchor) {
  // debugger
  children.forEach(child => {
    patch(null, child, container, anchor)
  })
}

// TODO
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

function isSameVNodeType(n1, n2) {
  return n1.type === n2.type
}

function processElement(n1, n2, container, anchor) {
  if (n1 == null) {
    // 说明已经大变样了,直接重新挂载
    // 只有在mount newVNode的时候需要记录anchor
    mountElement(n2, container, anchor)
  } else {
    patchElement(n1, n2)
  }
}

function processFragment(n1, n2, container, anchor) {
  const fragmentStartAnchor = (n2.el = n1 ? n1.el : document.createTextNode(''))
  const fragmentEndAnchor = (n2.anchor = n1
    ? n1.anchor
    : document.createTextNode(''))
  if (n1 == null) {
    container.insertBefore(fragmentStartAnchor, anchor || null)
    container.insertBefore(fragmentEndAnchor, anchor || null)
    // 因为fragment的子元素的父级是祖父元素
    mountChildren(n2.children, container, fragmentEndAnchor)
  } else {
    patchChildren(n1, n2, container, fragmentEndAnchor)
  }
}

function processText(n1, n2, container, anchor) {
  if (n1 == null) {
    mountTextNode(n2, container, anchor)
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
function patchElement(n1, n2) {
  n2.el = n1.el
  patchProps(n2.el, n1.props, n2.props)
  patchChildren(n1, n2, n2.el)
}

function patchProps(el, oldProps, newProps) {
  // 防止为null,并且null不能在一开始就设置默认参数,所以采用es5写法
  // debugger
  oldProps = oldProps || {}
  newProps = newProps || {}
  if (oldProps === newProps || (isEmpty(oldProps) && isEmpty(newProps))) return
  for (const key in newProps) {
    // 不懂!
    if (key === 'key') {
      continue
    }
    const prev = oldProps[key]
    const next = newProps[key]
    if (prev !== next) {
      pathDomProp(el, key, prev, next)
    }
  }
  for (const key in oldProps) {
    if (key !== 'key' && !(key in newProps)) {
      pathDomProp(el, key, oldProps[key], null)
    }
  }
}

// 因为这些属性的值是boolean,而setAttribute默认是字符串
const domPropsRE = /[A-Z]|^(value|checked|selected|muted)$/

/**
 * 绑定prop,并且特殊情况的prop特殊处理
 * @param {*} el
 * @param {*} key
 * @param {*} prev oldValue
 * @param {*} next newValue
 */

function pathDomProp(el, key, prev, next) {
  switch (key) {
    case 'class':
      el.className = next || ''
      break
    case 'style':
      // style对象
      if (!next) {
        el.removeAttribute('style')
      } else {
        for (const styleName in next) {
          el.style[styleName] = next[styleName]
        }
        // 移除prev有但next没有的
        if (prev) {
          for (const styleName in prev) {
            if (next[styleName] == null) {
              el.style[styleName] = ''
            }
          }
        }
      }
      break
    default:
      if (key.startsWith('on')) {
        // 先判断是否是同一个cb
        // debugger
        if (prev !== next) {
          const eventName = key.slice(2).toLowerCase()
          if (prev) {
            el.removeEventListener(eventName, prev)
          }
          if (next) {
            el.addEventListener(eventName, next)
          }
        }
      }
      // 判断特殊boolean属性
      else if (domPropsRE.test(key)) {
        el[key] = next
      } else {
        if (next == null) {
          el.removeAttribute(key)
        } else {
          // 因为boolean设置false在setAttribute上还是为字符串'false'
          el.setAttribute(key, next)
        }
      }
      break
  }
}
/**
 *
 * @param {*} n1
 * @param {*} n2
 * @param {*} container
 * @param {*} anchor 用于处理fragment case
 */
function patchChildren(n1, n2, container, anchor) {
  // 排除了n1是null的可能了,因为patchElement里面会进行一个判断
  const { shapeFlag: prevShapeFlag, children: c1 } = n1
  const { shapeFlag, children: c2 } = n2
  // 每一种子元素要应对三种:text_children,Array_Children,NULL
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      unmountChildren(c1)
    }
    if (c2 !== c1) {
      container.textContent = c2
    }
  }
  // c2可能是ARRAY or NULL
  else {
    // c1 is Array -> c2 is Array or null
    if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        patchUnkeyedChildren(c1, c2, container, anchor)
      } else {
        unmountChildren(c1)
      }
    }
    // c1 is text or NULL -> c2 is Array or null
    else {
      if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        container.textContent = ''
      }
      if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        mountChildren(c2, container, anchor)
      }
    }
  }
}

function unmountChildren(children) {
  children.forEach(child => unmount(child))
}

// patch children_array
function patchUnkeyedChildren(c1, c2, container, anchor) {
  const oldLength = c1.length
  const newLength = c2.length
  //  将长度相同的前面的vnode进行diff patch
  const commonLength = Math.min(oldLength, newLength)
  console.log(container.innerHTML)
  for (let i = 0; i < commonLength; i++) {
    patch(c1[i], c2[i], container, anchor)
  }
  console.log(container.innerHTML)
  // 将新的元素挂载到后面去
  if (newLength > oldLength) {
    mountChildren(c2.slice(commonLength), container, anchor)
  } else if (newLength < oldLength) {
    unmountChildren(c1.slice(commonLength))
  }
}
