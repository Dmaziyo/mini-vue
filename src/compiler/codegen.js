import { capitalize } from '../utils'
import { NodeTypes } from './ast'
export function generate(ast) {
  const codegen = traverseNode(ast)
  const exeCode = `
  with(_ctx){
    const {
      createApp,
      render,
      h,
      Text,
      Fragment,
      nextTick,
      reactive,
      ref,
      computed,
      effect,
      compile
    } = MiniVue
      return  ${codegen}
  }
  `
  return exeCode
}

export function traverseNode(node) {
  switch (node.type) {
    case NodeTypes.ROOT:
      if (node.children.length > 1) {
        return traverseChildren(node.children)
      } else if (node.children.length === 1) {
        return traverseNode(node.children[0])
      }
      break
    case NodeTypes.ELEMENT:
      return createElement(node)
    case NodeTypes.TEXT:
      return createTextVNode(node)
    case NodeTypes.INTERPOLATION:
      return createTextVNode(node.content)
    default:
      break
  }
}

function createTextVNode(node) {
  const child = createText(node)
  return `h(Text,null,${child})`
}

function createText({ isStatic = true, content = '' } = {}) {
  return isStatic ? JSON.stringify(content) : content
}

function createElement(node) {
  let result = traverseChildren(node.children)
  const propsArr = createPropsArr(node)

  const propsStr = propsArr.length ? `{${propsArr.join(', ')}}` : `null`

  return result
    ? `h("${node.tag}",${propsStr},${result})`
    : `h("${node.tag}",${propsStr})`
}

function createPropsArr({ props, directives }) {
  return [
    ...props.map(({ name, value }) => `${name}:${createText(value)}`),
    ...directives.map(({ name, exp, arg }) => {
      switch (name) {
        case 'on':
          const value = createText(exp)
          if (/^\w+\(\w*\)/.test(value)) {
            return `on${capitalize(arg.content)}:($event) => ${value}`
          } else {
            return `on${capitalize(arg.content)}:${value}`
          }
        case 'bind':
          return `${arg.content}:${createText(exp)}`
        case 'html':
          return `innerHTML:${createText(exp)}`
        default:
          break
      }
    })
  ]
}

function traverseChildren(children) {
  if (!children.length) {
    return
  }
  if (children.length === 1) {
    const child = children[0]
    if (child.type === NodeTypes.TEXT) {
      return createText(child)
    } else if (child.type === NodeTypes.INTERPOLATION) {
      return child.content.content
    }
  }
  return `[${children.map(child => traverseNode(child)).join(', ')}]`
}
