import { isEmpty } from '../utils'

export function patchProps(el, oldProps, newProps) {
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
