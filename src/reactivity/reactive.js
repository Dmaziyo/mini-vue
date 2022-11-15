import { isObject } from '../utils'
import { track, trigger } from './effect'

export const IS_REACTIVE = '__isReactive'
const reactiveMap = new WeakMap()

export function reactive(target) {
  if (!isObject(target)) {
    return target
  }
  //传入的obj是已经代理了的
  if (target[IS_REACTIVE]) {
    return target
  }
  // 传入的obj虽然不是被代理的,但是该obj已经被代理了
  if (reactiveMap.has(target)) {
    return reactiveMap.get(target)
  }
  const proxy = new Proxy(target, {
    get(target, key, receiver) {
      if (key === IS_REACTIVE) {
        return true
      }
      //绑定effect
      track(target, key)
      const res = Reflect.get(target, key, receiver)
      //   使用了懒加载,并没有一开始就直接进行代理
      return isObject(res) ? reactive(res) : res
    },
    set(target, key, value, receiver) {
      const res = Reflect.set(target, key, value, receiver)
      trigger(target, key, value)
      return res
    }
  })
  reactiveMap.set(target, proxy)
  return proxy
}
