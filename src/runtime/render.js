import { h, Text, Fragment, ShapeFlags } from './vnode'
/**
 *
 * @param {*} vnode
 * @param {*} container  根元素DOM
 */
export function render(vnode, container) {
  mount(vnode, container)
}

function mount(vnode, parent) {
  //判断vnode类型
  // 根据类型不同进行不同的绑定方式
  const { shapeFlag } = vnode
  if (shapeFlag & ShapeFlags.ELEMENT) {
    mountElement(vnode, parent)
  } else if (shapeFlag & ShapeFlags.TEXT) {
    mountTextNode(vnode, parent)
  } else if (shapeFlag & ShapeFlags.FRAGMENT) {
    mountFragment(vnode, parent)
  } else if (shapeFlag & ShapeFlags.COMPONENT) {
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
function mountElement(vnode, parent) {
  // 判断有无子元素,进一步判断是Text Children or Array Children
  const { type, props, children, shapeFlag } = vnode
  //   创建指定元素类型
  const el = document.createElement(type)
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    mountTextNode(vnode, el)
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountArrayChildren(children, el)
  }
  if (props) {
    mountProps(el, props)
  }
  parent.appendChild(el)
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
function mountTextNode(vnode, parent) {
  const textNode = document.createTextNode(vnode.children)
  parent.appendChild(textNode)
}

// 说明根元素为空
function mountFragment(vnode, parent) {
  mountArrayChildren(vnode.children, parent)
}

/**
 *
 * @param {*} children
 * @param {*} parent 上一级的根元素
 */
function mountArrayChildren(children, parent) {
  children.forEach(child => {
    mount(child, parent)
  })
}
