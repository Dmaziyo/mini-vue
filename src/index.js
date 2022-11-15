import { reactive } from './reactivity/reactive'
import { effect } from './reactivity/effect'

const observed = (window.observed = reactive({ count: 0 }))
effect(() => {
  // effect内的fn默认自动执行一次,将count(也就是reactive的prop进行绑定)
  // 之后每次prop更新的时候,都会执行fn
  console.log('observed.count =', observed.count)
})
