import { NodeTypes, createRoot, ElementTypes } from './ast'
import { isVoidTag, isNativeTag } from '.'

export function baseParse(content) {
  const context = createParserContext(content)
  return createRoot(parseChildren(context))
}

function createParserContext(content) {
  return {
    options: {
      delimiters: ['{{', '}}'],
      isVoidTag,
      isNativeTag
    },
    source: content
  }
}

function parseChildren(context) {
  const nodes = []

  //   像吃豆人一样吃掉char
  while (!isEnd(context)) {
    const s = context.source
    let node
    if (s.startWith(context.options.delimiters[0])) {
      node = parseInterpolation(context)
    } else if (s[0] === '<') {
      // 吃了元素后,<div></div><span></span>  =>  <span></span>
      node = parseElement(context)
    } else {
      node = parseText(context)
    }
    nodes.push()
  }
}

function isEnd(context) {
  const s = context.source
  return s.startWith('</') || !s
}

//  吞噬n个字符位置
function advanceBy(context, numberOfCharacters) {
  const { source } = context
  context.source = source.slice(numberOfCharacters)
}

// 吃掉Text,并且返回吃掉的text
function parseTextData(context, length) {
  const rawText = context.source.slice(0, length)
  advanceBy(context, length)
  return rawText
}

// 无法处理 a < b ,
// 以及 </ 开头的text
function parseText(context) {
  const endTokens = ['<', context.options.delimiters[0]]

  // 找到最近的endTokens位置,有可能'<',也有可能是'}}'
  let endIndex = context.source.length

  for (let i = 0; i < endTokens.length; i++) {
    const index = context.source.indexOf(endTokens[i])
    if (index !== -1 && endIndex > index) {
      endIndex = index
    }
  }

  const content = parseTextData(context, endIndex)
  return {
    type: NodeTypes.TEXT,
    content
  }
}

// {{}}插值解析
function parseInterpolation(context) {
  const [open, close] = context.options.delimiters

  advanceBy(context, open.length)
  const closeIndex = context.source.indexOf(close)
  const content = parseTextData(context, closeIndex)
  advanceBy(context, close.length)

  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      isStatic: false,
      content
    }
  }
}

function parseElement(context) {
  const element = parseTag(context)
}

function parseTag(context) {
  // 可以读取'<'开头或者'</'开头,并且连续无空格的
  const match = /^<\/?([a-z][^\t\r\n\f />]*)/i.exec(context.source)
  const tag = match[1]

  // todo

  // 吃掉tag

  // 处理所有props

  // 判断是否为组件

  // 返回结点模型
  return {
    type: NodeTypes.ELEMENT,
    tag,
    tagType,
    props,
    isSelfClosing,
    children: [],
    codegenNode: undefined // to be created during transform phase
  }
}
