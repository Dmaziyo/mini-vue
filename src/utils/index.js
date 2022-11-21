export function isObject(raw) {
  // 因为null也是object
  return typeof raw === 'object' && raw !== null
}

export function hasChanged(value, oldValue) {
  //确保没有都是NaN
  return value !== oldValue && (value === value || oldValue === oldValue)
}
