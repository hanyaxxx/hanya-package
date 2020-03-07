//值负责存数据

class elStore {
  constructor() {
    // this.elIndexStore = []
    this.elStore = {} // 选择器名字的形式存贮 el
    this.eventcache = {}
  }
  //TODO 未来也许可以加入判断实际el ,现在只判断字符串
  //判断元素是否在仓库中存在如果不存在就缓存elStore[]
  isInStore (el) {
    let els
    // 如果啥也没写就等价于当前触发元素
    // 如果有el.tagname不需要字符串解析.
    !el.tagName ? els = this.isInElStore(el) : els = el

    return els
  }

  refreshEvent (els) {
    // 1. 读取els 重新获取 dom值 
    this.elStoreRefresh(els)
    //todo  动态注册就是捕捉原型字符被使用的情况
    let cache = this.eventcache[els]
    let tempCache = JSON.parse(JSON.stringify(cache))
    tempCache.forEach((data, index) => {
      //删除Action //删除绑定过的事件  
      data.el.removeEventListener(data.event, data.action)
      data.eventcache()// 启动绑定过的缓存
      cache.splice(index, 1) // 删除历史缓存
    })


  }


  addEventCache (rawELs, p) {
    // 由于是分布存所以 如果注册进去的函数不相等就增加步长
    if (!this.eventcache[rawELs]) this.eventcache[rawELs] = []

    this.eventcache[rawELs].push(p)

  }

  // 先遍历源字符串找出 elements

  isExistStore (el) {

    let elStore = this.elStore
    if (elStore[el]) {
      return elStore[el]

    } else {
      elStore[el] = [...document.querySelectorAll(el)]

      return elStore[el]

    }


  }

  selectorSynSugarFilter (el) {
    let sugar
    let match
    let filter

    let rawEl = el.replace(/(@)(!)?(\d+)?/, (_, g1, g2, g3) => {

      if (g1 && g2 && g3) {

        filter = +g3 // filter是一个排除索引
      } else if (g1 && g3) {

        match = +g3
      }
      sugar = true

      return ''
    })

    //第一步先在仓库找 找不到就用document 查找
    let rawElements = this.isExistStore(rawEl)

    let result = rawElements
    if (sugar) {

      elStore[el] = []  // 开辟新仓库 

      if (match >= 0) {
        elStore[el].push(rawElements[match])

      } else {
        for (let key in rawElements) {
          if (key != filter) {
            elStore[el].push(rawElements[key])
          }
        }
      }
      result = elStore[el]

    }

    return result
  }

  isInElStore (el) {
    let els
    let elStore = this.elStore

    if (elStore[el]) {

      els = elStore[el]

    } else {

      let filterEl = this.selectorSynSugarFilter(el)

      els = filterEl
    }


    return els
  }


  elStoreRefresh (el) {
    //避免无限递归
    if (el != this.elRefreshOnly) {
      this.elRefreshOnly = el

      //  1.删除el 在 index下的索引 
      //  2.删除el 在 store 下的值 
      //  3.回调调用方法
      delete this.elStore[el] // 删除缓存

      return this.selectorSynSugarFilter(el) // 刷新数据

    } else {

      throw new Error('el索引错误没有对应元素')

    }
  }

}
const ELSTORE = new elStore()

export { ELSTORE }