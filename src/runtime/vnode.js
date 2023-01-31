import { isFunction, isObject } from '../utils'

export const Text = Symbol('Text')
export const Fragment = Symbol('Fragment')

export const ShapeFlags = {
  ELEMENT: 1,
  TEXT: 1 << 1,
  FRAGMENT: 1 << 2,

  COMPONENT: 1 << 3,
  TEXT_CHILDREN: 1 << 5,
  ARRAY_CHILDREN: 1 << 6,
  CHILDREN: (1 << 5) | (1 << 6)
}

/**
 * 生成相应的VNode模型,之所以采用bitwise operation 是为了快速检测子元素的类型
 * @param {string | Text | Fragment | object |Function} type
 * @param {Record<string,any> | null} props
 * @param {string | Array | null}
  props:{
    class: str
    style:{
        'textAlign': 'center',
        'color':'black'
        }
    onClick:()=>{},
    checked:'',
    custom:false
 * @param {*} children
 * @returns
 */
export function h(type, props = null, children = null) {
  let shapeFlag = 0
  if (typeof type === 'string') {
    shapeFlag = ShapeFlags.ELEMENT
  } else if (type === Text) {
    shapeFlag = ShapeFlags.TEXT
  } else if (type === Fragment) {
    shapeFlag = ShapeFlags.FRAGMENT
  } else {
    shapeFlag = ShapeFlags.COMPONENT
  }

  // 这样可以用一个shapeFlag进行多种判断
  if (typeof children === 'string' || typeof children === 'number') {
    shapeFlag |= ShapeFlags.TEXT_CHILDREN
    children = children.toString()
  }
  // array children 必须只能是Vnode array
  else if (Array.isArray(children)) {
    shapeFlag |= ShapeFlags.ARRAY_CHILDREN
  }
  return {
    type,
    props,
    children,
    shapeFlag,
    el: null,
    anchor: null,
    key: (props && props.key) || null,
    component: null
  }
}

/* 处理情况
    case1: result是Vnode数组,即Fragment
    case2: result是VNode结点
    case3: result是纯文本
*/
export function normalizeVNode(result) {
  if (Array.isArray(result)) {
    return h(Fragment, null, result)
  }
  if (isObject(result)) {
    return result
  }
  return h(Text, null, result.toString())
}
