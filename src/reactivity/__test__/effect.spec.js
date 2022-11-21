import { effect } from '../effect'
import { reactive } from '../reactive'

describe('effect', () => {
  test('basic', () => {
    const observed = reactive({ count: 0 })
    let value
    effect(() => {
      value = observed.count
    })
    expect(value).toBe(0)
    observed.count++
    expect(value).toBe(1)
    observed.count = 10
    expect(value).toBe(10)
  })
  test('有多个effect', () => {
    const observed = reactive({ count: 0 })
    let value1
    effect(() => {
      value1 = observed.count
    })
    let value2
    effect(() => {
      value2 = observed.count
    })
    let value3
    effect(() => {
      value3 = observed.count
    })
    expect(value1).toBe(0)
    expect(value2).toBe(0)
    expect(value3).toBe(0)
    observed.count++
    expect(value1).toBe(1)
    expect(value2).toBe(1)
    expect(value3).toBe(1)
  })
  test('effect中监听多个响应式对象', () => {
    const observed1 = reactive({ count: 0 })
    const observed2 = reactive({ count: 0 })
    let value
    effect(() => {
      value = observed1.count + observed2.count
    })
    expect(value).toBe(0)
    observed1.count++
    expect(value).toBe(1)
    observed2.count++
    expect(value).toBe(2)
    observed1.count++
    observed2.count++
    expect(value).toBe(4)
  })
  it('嵌套响应式对象', () => {
    let value, type
    const observed = reactive({ nested: { num: 0 } })
    effect(() => (value = observed.nested.num))
    effect(() => (type = typeof observed.nested))
    expect(value).toBe(0)
    observed.nested.num = 8
    expect(value).toBe(8)
    expect(type).toBe('object')
    observed.nested = 'test'
    expect(type).toBe('string')
    expect(value).toBe(undefined)
  })
  test('新添加的属性也会被代理', () => {
    let value
    const original = { count: 0 }
    const observed = reactive(original)
    effect(() => {
      value = observed.anotherValue
    })
    expect(value).toBe(undefined)
    observed.anotherValue = 1
    expect(value).toBe(1)
  })
  test('嵌套effect', () => {
    console.log = jest.fn()
    const observed = reactive({ a: 1, b: 1 })
    effect(() => {
      effect(() => {
        console.log(observed.b + '嵌套的')
      })
      console.log(observed.a + '非嵌套')
    })
    observed.a = 5
    expect(console.log.mock.calls[0][0]).toBe('1嵌套的')
    expect(console.log.mock.calls[1][0]).toBe('1非嵌套')
    expect(console.log.mock.calls[2][0]).toBe('1嵌套的')
    expect(console.log.mock.calls[3][0]).toBe('5非嵌套')
  })
})
