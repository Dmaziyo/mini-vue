import _ from 'lodash'
import { add } from './add'
function component() {
  const element = document.createElement('div')

  // lodash 在当前 script 中使用 import 引入
  element.innerHTML = ['Hello', 'webpfdsfack'].join(' ')
  console.log(element)
  return element
}

document.body.appendChild(component())
