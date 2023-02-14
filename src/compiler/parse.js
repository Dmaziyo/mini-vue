import { NodeTypes, createRoot, ElementTypes } from './ast'
import { isVoidTag, isNativeTag } from '.'
import { camelize } from '../utils'

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
    if (s.startsWith(context.options.delimiters[0])) {
      node = parseInterpolation(context)
    } else if (s[0] === '<') {
      // 吃了元素后,<div></div><span></span>  =>  <span></span>
      node = parseElement(context)
    } else {
      node = parseText(context)
    }
    nodes.push(node)
  }

  /*
    将 a    
          b  =>  a b 缩减空白
   */
  nodes.forEach(node => {
    if (node.type === NodeTypes.TEXT) {
      node.content = node.content.replace(/[\t\r\n\f ]+/g, ' ')
    }
  })
  return nodes
}

function isEnd(context) {
  const s = context.source
  return s.startsWith('</') || !s
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
  // a <div></div>  |  <div>hello {{name}}</div>
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
  const content = parseTextData(context, closeIndex).trim()
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

  // 如果是selfClose或者不需要/>也可以的<area>,<input>等
  if (element.isSelfClosing || context.options.isVoidTag(element.tag)) {
    return element
  }

  element.children = parseChildren(context)

  // end Tag,只是吃掉,不接受其返回值
  parseTag(context)

  return element
}

function parseTag(context) {
  // 可以读取'<'开头或者'</'开头,并且连续无空格的
  const match = /^<\/?([a-z][^\t\r\n\f />]*)/i.exec(context.source)
  const tag = match[1]

  // 吃掉tag
  advanceBy(context, match[0].length)
  advanceSpaces(context)

  // parse Attributes
  let props = parseAttributes(context)

  // 检测是否为SelfClose
  let isSelfClosing = context.source.startsWith('/>')

  advanceBy(context, isSelfClosing ? 2 : 1)

  let tagType = isComponent(tag, context)
    ? ElementTypes.COMPONENT
    : ElementTypes.ELEMENT

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

function isComponent(tag, context) {
  const { options } = context
  if (options.isNativeTag && !options.isNativeTag(tag)) {
    return true
  }
  return false
}

function advanceSpaces(context) {
  const match = /^[\t\r\n\f ]+/.exec(context.source)
  if (match) {
    advanceBy(context, match[0].length)
  }
}

function parseAttributes(context) {
  const props = []
  while (
    context.source.length &&
    !context.source.startsWith('>') &&
    // 如果碰到了/>
    !context.source.startsWith('/>')
  ) {
    const attr = parseAttribute(context)
    props.push(attr)
    advanceSpaces(context)
  }
  return props
}

function parseAttribute(context) {
  // 假设输入的source都是正确的
  const match = /^[^\t\r\n\f />][^\t\r\n\f />=]*/.exec(context.source)
  const name = match[0]

  advanceBy(context, name.length)
  advanceSpaces(context)

  // Value
  let value
  if (context.source[0] === '=') {
    advanceBy(context, 1)
    advanceSpaces(context)
    value = parseAttributeValue(context)
    advanceSpaces(context)
  }

  // Directive
  if (/^(v-|:|@)/.test(name)) {
    let dirName, argContent
    if (name[0] === ':') {
      // <div :class="myClass" />
      dirName = 'bind'
      argContent = name.slice(1)
    } else if (name[0] === '@') {
      // <div @click="handleClick" />
      dirName = 'on'
      argContent = name.slice(1)
    } else if (name.startsWith('v-')) {
      // <div v-for="handleClick" />
      // <div v-bind:value ='value'></div>
      ;[dirName, argContent] = name.slice(2).split(':')
    }

    let arg
    if (argContent) {
      arg = {
        type: NodeTypes.SIMPLE_EXPRESSION,
        content: camelize(argContent),
        isStatic: true
      }
    }

    /**
     * arg:指令关键词
     * exp:arg对应的value
     */
    return {
      type: NodeTypes.DIRECTIVE,
      name: dirName,
      exp: value && {
        type: NodeTypes.SIMPLE_EXPRESSION,
        content: value.content,
        isStatic: false
      },
      arg
    }
  }

  // Attribute
  return {
    type: NodeTypes.ATTRIBUTE,
    name,
    value: value && {
      type: NodeTypes.TEXT,
      content: value.content
    }
  }
}
// "Don't be afraid" class="myClass" => Don't be afraid" class="myClass" =>  class="myClass"
function parseAttributeValue(context) {
  const quote = context.source[0]
  advanceBy(context, 1)

  const endIndex = context.source.indexOf(quote)
  let content = parseTextData(context, endIndex)
  advanceBy(context, 1)

  return { content }
}
