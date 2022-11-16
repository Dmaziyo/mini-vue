let effectStack = []
let activeEffect
export function effect(fn) {
  const effectFn = () => {
    try {
      effectStack.push(effectFn)
      activeEffect = effectStack[effectStack.length - 1]
      // 执行fn(),调用reactive的时候同时将activeEffect绑定
      return fn()
    } finally {
      effectStack.pop()
      activeEffect = effectStack[effectStack.length - 1]
    }
  }
  effectFn()
  return effectFn
}

const targetMap = new WeakMap()

// 将调用的属性值与effectFn建立联系
export function track(target, key) {
  if (!activeEffect) {
    return
  }
  // 查看是否已经建立effects
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }

  dep.add(activeEffect)
}

// 触发执行effect
export function trigger(target, key) {
  const depsMap = targetMap.get(target)
  if (!depsMap) {
    return
  }
  const dep = depsMap.get(key)
  if (!dep) {
    return
  }
  dep.forEach(effectFn => {
    effectFn()
  })
}
