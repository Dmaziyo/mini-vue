export function isObject(raw) {
  // 因为null也是object
  return typeof raw === 'object' && raw !== null
}

export function hasChanged(value, oldValue) {
  return value !== oldValue && !(isNaN(value) && isNaN(oldValue))
}
