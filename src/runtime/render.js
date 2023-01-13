import { patchProps } from './patchProps'
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
        if (c1[0] && c2[0] && c1[0].key && c2[0].key) {
          debugger
          patchKeyedChildren(c1, c2, container, anchor)
        } else {
          patchUnkeyedChildren(c1, c2, container, anchor)
        }
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

// 用于处理同级子元素并且有重复node的情况
function patchKeyedChildren(c1, c2, container, anchor) {
  let i = 0,
    e1 = c1.length - 1,
    e2 = c2.length - 1
  // 1.从左至右依次对比
  while (i <= e1 && i <= e2 && c1[i].key === c2[i].key) {
    patch(c1[i], c2[i], container, anchor)
    i++
  }

  // 2.从右至左依次比对
  while (i <= e1 && i <= e2 && c1[e1].key === c2[e2].key) {
    patch(c1[e1], c2[e2], container, anchor)
    e1--
    e2--
  }

  if (i > e1) {
    /* 旧children已经对比完了
     表示可能中间需要添加新的元素,或者不需要添加
     此时的e2并不是表示长度,而是中间那段的尾部
    */
    for (let j = i; j <= e2; j++) {
      const nextPos = e2 + 1
      // 如果新增元素在后面,就是anchor,如果是在中间,anchor就是e2+1
      const curAnchor = (c2[nextPos] && c2[nextPos].el) || anchor
      patch(null, c2[j], container, curAnchor)
    }
  } else if (i > e2) {
    // 经过从左至右,从右至左的对比,说明e1中间或者后面有多余的需要解绑
    for (let j = i; j <= e1; j++) {
      unmount(c1[j])
    }
  }
  //new Children 和 old Children中间有一段顺序打乱或者完全不同
  else {
    // 采用react diff算法,但不进行真的添加和移动,只做标记和删除
    const map = new Map()
    for (let j = i; j <= e1; j++) {
      const prev = c1[j]
      map.set(prev.key, { prev, j })
    }
    let maxIndex = 0
    let move = false
    let toMounted = []
    const source = new Array(e2 - i + 1).fill(-1)
    for (let k = 0; k < e2 - i + 1; k++) {
      const next = c2[k + i]
      if (map.has(next)) {
        const { prev, j } = map.get(next.key)
        patch(prev, next, container, anchor)
        if (j < maxIndex) {
          move = true
        } else {
          maxIndex = j
        }
        source[k] = j
        map.delete(next.key)
      } else {
        // 在之后顺序已经摆好了,直接往里面插入即可
        toMounted.push(k + i)
      }
    }
    map.forEach(({ prev }) => {
      unmount(prev)
    })

    if (move) {
      // 获取最长上升子序列
      const seq = getSequence(source)
      let j = seq.length - 1
      for (let k = source.length - 1; k >= 0; k--) {
        if (k === seq[j] && source[k] !== -1) {
          j--
        } else {
          // 因为后面的元素都是排序排好的,所以pos+1就是Anchor位置
          const pos = k + i
          const nextPos = pos + 1
          const curAnchor = (c2[nextPos] && c2[nextPos].el) || anchor
          if (source[k] === -1) {
            patch(null, c2[pos], container, curAnchor)
          } else {
            container.insertBefore(c2[pos].el, curAnchor)
          }
        }
      }
    }
    if (toMounted.length) {
      // 之前old children没有,需要添加进去的
      // 在之后顺序已经摆好了,直接往里面插入相应index即可
      for (let k = toMounted.length - 1; k >= 0; k--) {
        const pos = toMounted[k]
        const nextPos = pos + 1
        const curAnchor = (c2[nextPos] && c2[nextPos].el) || anchor
        patch(null, c2[pos], container, curAnchor)
      }
    }
  }
}
function getSequence(nums) {
  // todo
}
