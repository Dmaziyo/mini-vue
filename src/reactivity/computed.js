import { track, trigger, effect } from './effect'

export function computed(getter) {
  return new ComputedRefImp(getter)
}

class ComputedRefImp {
  constructor(getter) {
    this._value = undefined
    // dirty表示重新执行一次getter
    this._dirty = true
    this.effect = effect(getter, {
      lazy: true,
      // scheduler 用于绑定调用computed的effect
      scheduler: () => {
        if (!this._dirty) {
          this._dirty = true
          trigger(this, 'value')
        }
      }
    })
  }
  get value() {
    if (this._dirty) {
      // 将compute getter绑定至相应变量,并且获取computed 值
      this._value = this.effect()
      this._dirty = false
      // 绑定调用computed的effect
      track(this, 'value')
    }
    return this._value
  }

  set value(val) {
    console.warn('computed value is readonly')
  }
}
