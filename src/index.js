import { reactive } from './reactivity/reactive'
import { effect } from './reactivity/effect'

const observed = reactive({ a: 'a', b: 'b' })
effect(() => {
  console.log(observed.a + '非嵌套')
  effect(() => {
    console.log(observed.b + '嵌套的')
  })
})
observed.a = 2
// a嵌套的
// b非嵌套
//打印2嵌套的
