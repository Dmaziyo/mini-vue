export function isObject(raw) {
  // 因为null也是object
  return typeof raw === 'object' && raw !== null
}
