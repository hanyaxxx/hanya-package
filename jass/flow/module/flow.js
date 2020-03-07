import {viewUpdate} from './ViewUpdate.js';
import verify from '../../verify.js';



class flow {
  constructor() {
    //super()
    this.workFlow = []
    this.flowSequence = 0
    this.workFlowFirstTimer = null
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
      if (Sequence === _this.workFlowLength) return
      //*考虑到箭头函数无法改变this指向

      if(method.workFlowCenter) _this.insideWorkFlowBeforeJumpforConfig(method)

      _this.flowSequence++
      _this.workFlow[Sequence](_this.method, ...arg)

     
    }

  }

  insideWorkFlowBeforeJumpforConfig(method){

     let workFlowCenter=method.workFlowCenter
     //开启事件驱动或者自启动
     method.isEventDriver?method.eventDriverCache(workFlowCenter) : workFlowCenter.startworkFlow()
     
  //这个问题有点难搞了, 事件驱动的flow可能被覆盖
   

    method.isEventDriver=false
  // 在 有事件驱动的时候 我设置null他就没有了, 那在没有事件驱动的时候呢
      method.workFlowCenter=null
    // todo 要不要清空workFlowCenter呢 ,
    // todo 要不要把workflowCenter加入一个flow数组呢? 
    // 我觉得 用户自己管理比较好 比如 flow.data[xxx]
    // 数据放在flow.data.[xxx]里比较好.  flow的数据就是method里面的数据 
    // 数据管理是
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
    
    let timer=_this.workFlowFirstTimer
    if(timer) clearTimeout(timer)
    timer=setTimeout(() => {
      _this.method.next()

    }, 0);

  }


}


export {flow}