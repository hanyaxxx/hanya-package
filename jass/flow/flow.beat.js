import {Method} from './module/Method.js'; // 方法组件


class flow {
  constructor() {
    //super()
    this.workFlow = []
    this.flowSequence = 0
    this.workFlowFirstTimer = null
    this.start=false
    this.flowPark = [
      'DataLoad',
      'DataSend',
      'DataVerify',
      'DataMatch',
      'DataSave',
      'DataFilter',
      'ViewUpdate',
      // 'ElementControl',
      'NextFlow',
      'TriggerEvent',
      'Jump',
      'Proxy',
    ]

    this.init()

  }


  //* 初始化flow,
  //* 配置工作流链条[]!import
  //* 配置工作流全局方法名
  //* 全局方法名中的fn会作为参数加入到工作流执行链条,依次回调执行 ,回调参数 next:跳转到下个链条, flow当前flow,任一参数
  //* 工作流之间变量的传递头疼到底是this指出去,还是用next传递呢? flow.next()

  //todo 试试这种方法


   init () {
    let _this = this
    _this.initMethod()
    _this.initFlow()
  }

  // this.method.next=this.next  next
   initMethod () {
    let _this = this
    _this.method = new Method()
    let method=_this.method
    method.init()
    method.next = function (...arg) {
      let Sequence = _this.flowSequence
      
      //*考虑到箭头函数无法改变this指向

      _this.flowSequence++
  
     _this.workFlow[Sequence](_this.method, ...arg)
      
    }
  method.jump=function(num,...arg){
    _this.workFlow[num](_this.method, ...arg)
  }
  }


    initFlow () {
    //定义全局工作流关键词
    this.flowPark.forEach(park => {
      this[park] = function (fn) {
        this.setUpWorkFlow(fn) //声明工作流模板 DATALOAD 等
        return this
      }
    })
  }

  // 每个工作流的事情简单
   setUpWorkFlow (fn) {
    let _this = this
 
    _this.workFlow.push(fn.bind(_this))

    _this.workFlowLength = _this.workFlow.length

    _this.startFirstTimer(_this)
   
  }
    startFirstTimer(_this){
//   let timer = _this.workFlowFirstTimer
   
    if(_this.workFlowFirstTimer) clearTimeout(_this.workFlowFirstTimer)
    _this.workFlowFirstTimer=setTimeout(() => {
      if(!_this.start) _this.workFlow.push(flow.Next.bind(_this)),_this.method.next(),_this.start=true
    },0);
  }


 static Next(){
  throw new Error('flow.next已经没有下一步可走')
  }

}


export {flow}