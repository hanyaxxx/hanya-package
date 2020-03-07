Object.checkType = function (obj, type) {
  let str = Object.prototype.toString.call(obj).replace(/\[object (\w+)]/, '$1').toLowerCase()
  return type ? str === type : str
}

class publicMethod {
  // eslint-disable-next-line no-unused-vars
  constructor(params) {
    //  super()
    this.node = false;
    this.init();
  }
  init () {
    this.checkEnvir();
  }

  checkType(obj, type) {
    let str = Object.prototype.toString.call(obj).replace(/\[object (\w+)]/, '$1').toLowerCase()
    return type ? str === type : str
  }








  checkEnvir () {
    try {
      if (global) this.node = true;
    } catch (e) {
      this.node = false;
    }
  }

  log () {
    console.log('log');
  }

  attr (dom, type, value) {
    if (this.node) {
      dom.attr(type, value);
    } else {
      if (value) {
        dom.setAttribute(type, value);
      } else {
        return dom.getAttribute(type);
      }
    }
  }
}




class jass extends publicMethod {
  //1. 解析语法树
  //2. 进行dom结构分析开启大循环
  //3.
  constructor(router) {
  //传入入口element,
    // this.router = router;
    // this.path = router.tagPath;
    // this.routerViewId = router.routerViewId;
    super()
    this.conditionSelectorQueue = []
    this.init()
     // _this.routerConditionSelector   //_this.forloopConditionSelector
  }
  //
  use(fn){

     this.fn.name=new fn()
  }

  router(p){
     this.router=new router(p)
     this.pushConditionSelector(this.router.routerRender.routerConditionSelector)
  }

  pushConditionSelector(cs){
    this.conditionSelectorQueue.push(cs)
  }

init(){

 // this.renderinit();

}
  renderinit () {
      //todo 控制器一共承载了哪些数据? 
    //todo router routerpath  pathtree mapdom 
    //?渲染器做了哪些核心工作? 1.通过path查询控制器,2.通过router-view-id查询视图,3.通过控制器与视图的依赖关系进行遍历,根据控制器的数据需求进行数据渲染
    let _this = this;
    //1.取出入口元素
    let body = document.querySelector(_this.router.entranceElement);


    //取出元素集合
    let bodychild = body.children;

    //遍历它们
    _this.elementTraverse(bodychild);


  }

  //*通过对根元素的一次遍历同步执行N种方法
  //*优化前的时间复杂度为 m^n  m[0,5000] n[0,20]
  //*优化后为m*n, m为元素个数 ,n为方法个数,显然5000^20远远大于5000*20
  //! 执行流程:
  //! 1.注册条件选择器将选择器添加在选择器队列中
  //! 2.遍历器中使用选择器队列挨个执行选择器
  //! 3.选择器条件成立返回执行函数与参数并在队列中执
  //! 4.调用标记函数给元素打上标记,同一元素的同一方法只能执行一次
  //! 5.选择元素的子元素进行深度优先遍历
  //类比: 

  elementTraverse (elements) {
    let _this = this


    _this.elementTraversePoly(elements)
  }

  //* 根据条件选择器的名字返回一个签名标识
  traverseSign (name) {
    return name.name + 'elementTraversePoly'
  }

  elementTraversePoly (elements, ...arg) {
    let _this = this
    let fn = _this.conditionSelectorQueue
    if (arg.length == 0) arg = [null]

    Object.keys(elements).forEach(el => {
      let element = elements[el]
      //fn.forEach=选择器队列
      fn.forEach(action => {
        //* 检查元素关于执行函数的标识如果存在就跳过,防意外情况
        let sign = _this.traverseSign(action)
        if (element[sign]) return
        //* action.call是事先准备好的条件选择器函数
        let fnTips = action.call(_this, element, ...arg)
        if (fnTips) {
          //* fnTips.fn是执行函数,fnTips.arg是执行器的参数
          //fnTips.fn.call(_this, ...fnTips.arg())
          fnTips.fn.call(_this, ...fnTips.args)
          //* 执行后给这个元素打上标记
          element[sign] = true
        }

      })
      //* 优先遍历子元素,深度遍历模式
      let elc = element.children
      if (elc.length > 0) _this.elementTraversePoly(elc, ...arg)
    })

  }
}


class router{
  constructor(p){
  this.p=p
  this.routerInit()
  }
  routerInit(){
console.log(this.p)
  }
}

console.log(Object.prototype.toString.call(router))

jass.prototype.router({
  name:'nihao',
})



try {
 // export  default jass
} catch (e) {

}
