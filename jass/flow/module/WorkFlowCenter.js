class WorkFlowCenter {
  constructor() {
    this.workFlowItems = []
    this.workFlowNextId = 0
    this.workFlowCenterTimer = null
    this.isEventDriver=false
  }

  startworkFlowCenterTimer () {
    let _this = this
    let timer = _this.workFlowCenterTimer

    //这里要有一个判断,如果有事件执行器,则不执行这个函数
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      _this.startworkFlow()
     // _this.workFlowItems.push(_this.lastResult.bind(_this))
    }, 0);

  }
  // 特点最后一个执行完毕才有 , flow.getworkflow()
lastResult(){
  return this
}

  //自然驱动事件流
  startworkFlow (trigger) {
    let _this = this
    let workFlow = _this.workFlowItems
    for (let index in workFlow) {
      workFlow[index](trigger)
      //workFlowNextId++
    }
   // return workFlow //设置可引用 
  }


}

export {WorkFlowCenter}