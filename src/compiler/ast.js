// NodeTypes是用于将ast转换生成相应的可渲染Vnode tree
export const NodeTypes = {
  ROOT: 'ROOT',
  ELEMENT: 'ELEMENT',
  TEXT: 'TEXT',
  SIMPLE_EXPRESSION: 'SIMPLE_EXPRESSION',
  INTERPOLATION: 'INTERPOLATION',
  ATTRIBUTE: 'ATTRIBUTE',
  DIRECTIVE: 'DIRECTIVE'
}

export const ElementTypes = {
  ELEMENT: 'ELEMENT',
  COMPONENT: 'COMPONENT'
}

// 最终的ast
export function createRoot(children) {
  return {
    type: NodeTypes.ROOT,
    children
  }
}
