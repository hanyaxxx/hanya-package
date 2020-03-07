const getItem = key => localStorage.getItem(key)
const setItem = (key, data) => {
  localStorage.setItem(key, data)
  return data
}
const JSONs = data => JSON.stringify(data)
const JSONp = string => JSON.parse(string)

const unite = (...fn) => {
  let first
  typeof fn[0] !== 'function' ? (first = fn[0], fn.splice(0, 1)) : first = '';

  return fn.reduce((pre, next) => pre = next(pre), first)
}

export { getItem, setItem, JSONs, JSONp, unite}