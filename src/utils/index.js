export function isObject(raw) {
  // 因为null也是object
  return typeof raw === 'object' && raw !== null
}

export function isEmpty(object) {
  return Object.keys(object).length === 0
}

export function isFunction(raw) {
  return typeof raw === 'function'
}

export function hasChanged(value, oldValue) {
  //确保没有都是NaN
  return value !== oldValue && (value === value || oldValue === oldValue)
}

export function camelize(str) {
  // 后面的是replacer
  return str.replace(/-(\w)/g, (_, c) => (c ? c.toUpperCase() : ''))
}

export function isString(value) {
  return typeof value === 'string'
}

export function isArray(value) {
  return Array.isArray(value)
}

export function isNumber(value) {
  return typeof value === 'number'
}
export function capitalize(value) {
  return value[0].toUpperCase() + value.slice(1)
}
