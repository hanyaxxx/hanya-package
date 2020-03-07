/* *  
       ! stateId = 'class'/id/type/name, //必填 获取验证状态时键值对应的key名,只要是元素上的属性名都可以
       * 内置方法:
       *  new verify({}) 
       * 
       *  custom {el: template:{}} :
         单个监听或者中途改变监听状态,自定义元素继续初始化模板的配置,修改一项配置不会影响其他配置
       * regVerifyEls{  match:, filter:  } :
        为一整套按钮添加验证, 比如form表单下的所有子元素,
        match/filter是匹配规则 match/filter=  'input|input[type=user]|input[id]'
       * err.custom=function(trigger,err.el,verify)  t=接受验证的元素
      *  submit: 如果使用了验证器自定义的提交验证注意以下参数:
         global:      // true||false   //完全匹配才能提交还是局部匹配就可以提交 
        * getResult:  获取submit的验证结果 ->回调函数getResult=function(result)       
         result=[{}] id:=stateId , value=元素值
        * 如果自定义提交验证注意以下方法:
         getAllVerifyState () :
          取得所有监听元素的验证状态 
         getAllVerifyResult(): 
          取得所有监听元素的结果,  true //所有在监听中的值, false // 筛查通过验证的值
          result=[{}] id:=stateId , value=元素值, pass=验证状态

       *  template: {
      *   monitor: 'onchange',  // 默认onchange
      *     pattern: null,  // 可选
      *       stop: true, //默认true
      *         err: { //可选
      !     el: null, // 必填 要操作的元素
      *       tips: null,//提示消失改变元素的文本值 可选
      *         action: null,//填show-deley, event->行为就是隐藏,action,
      *           custom: //自定义函数    可选
         }
       },
      ! stateId = 'class', //必填 获取验证状态时键值对的key名
      ?  submit: {       //可选
      !   el: null,    // 按钮的选择器是谁
      !   global:      // true||false   //完全匹配才能提交还是局部匹配就可以提交 
          getResult:   // 收集结果的回调函数
         template: {
      !     monitor: 'click',  // 默认click
      ?       err: { //可选
      !       
      ?         tips: null,//提示消失改变元素的文本值 可选
      ?           action: null,//填show-deley, event->行为就是隐藏,action不写就是没有沿用模板的action  true就是没有
      ?             custom: ,//自定义函数    可选
           }
         },
       }, */

class Verify {
  constructor(set) {

    this.template = set.template
    this.submit = set.submit
    this.actionBehavior = {}
    this.actionBehavior['number'] = this.errAfterTimerDispose
    this.actionBehavior['string'] = this.errAfterEventDispose
    this.stateId = set.stateId
    this.verifyEl = 0
    this.listenEl = [] //记录el
    this.listenElData = [] //映射el上的数据
    this.timer = null //全局计时器
    this.timerGroup = []
    this.isTemplateValidity(this.template)
    this.isSubmit()

    //this.err = set.err
    //this.stop = set.top
    //* 错误处理的两个事件还没写 流程没整理 
    // 验证过程写好了.
    // todo 提交模板 统一检查部分没写 要有一个同一个的数组进行绑定 
    // todo 手机数据模板 同样需要检索到所有被注册了的el
    //todo 获取所有监听中的元素的验证状态 getAllVerifyState 把listenEl和listenElData.pass的结果返回给调用者
  }
  // todo 提交模板,先注册后行为
  isSubmit () {
    if (this.submit) {
      //为submit注册点击事件 
      this.regisSubmit()
    }

  }
  isMeetGlobal () {
    // 只要有一个条件不成立那么返回假的
    let pass = this.listenElData
    let length = this.listenElData.length
    for (let i = 0; i < length; i++) {
      if (!pass[i].pass) return false
    }
  }
  //true=true 不筛选 truth=false 筛选
  getAllVerifyResult (truth = true) {
    let _this = this
    let listenEl = _this.listenEl  //收集被监听的el集合
    let result
    if (!truth) {
      // 开启筛选,
      result = listenEl.map((el, i) => {
        let obj = {}
        if (_this.listenElData[i].pass === true) {
          obj['id'] = el.getAttribute(_this.stateId)
          obj['value'] = el.value
        }
        return obj
      })

    } else {
      //truth为true的传递该数据并把pass状态上交
      result = listenEl.map((el, i) => {
        let obj = {}
        obj['id'] = el.getAttribute(_this.stateId)
        obj['value'] = el.value
        obj['pass'] = _this.listenElData[i].pass
        return obj
      })

    }

    return result

  }
  verifySubmit () {
    //todo 1. 收集信息 
    let _this = this

    let listenElData = _this.listenElData  //收集el上的数据集合
    let isPass = true
    let global = _this.submit.global
    //todo  2. 分析结果 如果开启全局验证 那么分析一下el是不是全部合格了否则直接给结果
    if (global) isPass = _this.isMeetGlobal()

    //todo  3.收集结果 


    if (isPass) {
      let result = _this.getAllVerifyResult(isPass)

      //todo  4.回调结果,回调给谁?
      try {
        _this.getResult(result)
      } catch (e) {
        throw new Error(e, "验证器没有getResult回调函数")
      }


    } else { //存在一个不合格的数据就发送错误警报
      //todo 错误处理 _this.listenElData=verify
      _this.takeErrDispose(listenElData['submit'].err, listenElData['submit'])

    }



  }
  regisSubmit () {
    //todo 检查el时候存在 
    let _this = this
    let el = _this.submit.el
    el = document.querySelector(el)

    //if (!el) throw new Error('submit必须为一个有效的DOM元素')
    let submit = this.submit
    //1. global默认值全局
    submit.global = submit.global || false
    // 2. 检查monitor事件
    submit.monitor = submit.monitor || 'click'
    _this.getResult = submit.getResult
    //响应时的事件处理
    let action = function (e) {
      e.stopPropagation()
      _this.verifySubmit()
    }
    el.addEventListener(_this.submit.monitor, action)

    //4.判断err值,为err注册数据
    if (submit.err) {

      let template = {
        err: submit.err,
      }
      this.listenElData['submit'] = {}
      this.generatorListenData('submit', template, false)

    }

  }

  getAllVerifyState () {
    let _this = this
    let state = {}
    _this.listenEl.forEach((key, index) => {
      let name = key.getAttribute(_this.stateId)
      state[name] = _this.listenElData[index].pass

    })
    return state
  }




  checkType (obj, type) {
    let str = Object.prototype.toString.call(obj).replace(/\[object (\w+)]/, '$1').toLowerCase()
    return type ? str === type : str
  }


  //!规则解析器temple.

  getFilteredEl (rules) {
    let group = []
    rules.forEach(el => {
      let analyseElementRules = el
     // analyseElementRules = analyseElementRules.replace(new RegExp('undefined', 'g'), '')
      let analyseElement = document.querySelectorAll(analyseElementRules)
      group.push(...analyseElement)
    })
    //最后去重
    return [...new Set(group)]
  }
  useRulesGetSelector (filter, rules) {
    let _this = this
    if (!_this.checkType(filter, 'string')) throw new Error('addEls2Verify的匹配规则必须为字符串')
    // !filter='input|iput[type=xx]'这种形式有可能后面没有加|给它补上 

    //if (filter.substring(filter.length - 1) !== '|') filter = filter + '|'
    //过滤特殊字符防止意外情况
    filter = filter.replace(new RegExp('"|undefined', 'g'), '')
    let group = []

    filter.replace(rules, (_, g1,g2) => {
      let str=''
      if(g1)str=str+g1 
      if(g2)str=str+g2
      group.push(str)
    })
    //完毕后再去重,防止手抖输入错误的规则 
    group.length=group.length-1
    return group

  }

  errAfterTimerDispose (el, delay) {
    let _this = this
    let timer = _this.timer

    _this.timerGroup.push(el)
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      _this.timerGroup.forEach(el => {
        el.style.display = 'none'
      })
      _this.timerGroup = []
    }, delay)
  }
  errAfterEventDispose (el, event) {
    let action = function (e) {
      el.style.display = 'none'
      e.stopPropagation()
      window.removeEventListener(event, action)
    }
    window.addEventListener(event, action)
  }

  getVerifyId (el) {
    return this.listenEl.indexOf(el)
  }

  takeErrDispose (err, verify, trigger) {
    let _this = this
    verify.pass = false 
    //*根据对应条件运行错误时处理流程
    if (err.custom) err.custom.call(trigger, err.el, _this) //第一个监听响应的元素,第二个是被操作元素,第三个是验证器实列
   if(err.el){
    err.el.style.display = 'block' //err错误处理时没有设置 err.el会报错
    if(err.tips)err.el.textContent = err.tips
   } 
    let action = err.action  // type= number string 时才有意义 不是的时候会报错,先不管
    if (action) _this.actionBehavior[err.actionType].call(_this, err.el, action, trigger)

  }
  //! 验证时的处理
  verifyJudge (_this) {
    let value = this.value
    let id = _this.getVerifyId(this)
    let verify = _this.listenElData[id]
    let err = verify.err
    let tt = _this

    //正则效验 
    let pattern = verify.pattern
    let test
    try {
      test = pattern.test(value)
    } catch (e) {
      console.log(e, "验证器正则错误检查书写格式", pattern)
    }


    if (test) {

      verify.pass = true
      if (err.el) err.el.style.display = 'none'

    } else {
      //_this.listenElData=verify,this是trigger元素,可以不传

      tt.takeErrDispose(err, verify, this)
    }

  }
  //! 载入数据将el加入监听
  verifyListen (el, index) {

    let _this = this
    //是listerEldata 是关于el监听要使用到的数据 //listerEl[index]是el

    //有正则pattern 的才加入监听
    if (_this.listenElData[index].pattern) {
      _this.listenElData[index].pass = false
      // 为el添加监听事件
      let event = function (e) {
        if (_this.listenElData[index].stop === true) e.stopPropagation() //禁止冒泡

        _this.verifyJudge.call(this, _this)
      }

      _this.listenElData[index].monitor=_this.listenElData[index].monitor.replace('on','')

      el.addEventListener(_this.listenElData[index].monitor, event)
      //为日后删除做准备
      _this.listenElData[index].event = event
    } else {
      _this.listenElData[index].pass = true
    }




  }

  //todo 这里去除声明 和取消注册
  distinctEvent () {

    removeEventListener()
  }

  //!根据模板套用添加
  // {
  //   selector: 
  //   filter: input[type=xxx]|input[type]|input
  //   conform:
  // }

  regVerifyEls (config) {

    let _this = this
    // let selector = config.parent
    let filter = config.filter
    let conform = config.match
    if (!conform && !filter) return
    //选择选择器下面的子节点 比如form标签下的所有子节点做删选 
    //let els = document.querySelectorAll(selector)

    //let children = els.children
    // if (children.length === 0) return
    let f_els
    //!需要进行二次过滤
    // 开始匹配条件检查 conform字符集
    if (conform) {
      //* filter,match是一个字符串 比如 input[type=xx]解析为input,type,xxx
      // let matchRules_group = _this.useRulesGetSelector(conform, /(\w+?)?(?:\[(\w+?)(?:=(\w+?))?\])?\|/g)
      f_els = _this.getFilteredEl(_this.useRulesGetSelector(conform, /(?:([A-Za-z0-9_ .#>]+)?(\[[A-Za-z0-9_ .#>=]+\])?(?:\|)?)/g))
    }
   
    //开始排除条件检查 filter字符集
    if (filter) {
    
      let filter_group = _this.getFilteredEl(_this.useRulesGetSelector(filter, /(?:([A-Za-z0-9_ .#>]+)?(\[[A-Za-z0-9_ .#>=]+\])?(?:\|)?)/g))
      filter_group.forEach(filter_el=>{
        // 如果同时满足匹配条件和筛选条件就进行二次赋值
        let indexOf=f_els.indexOf(filter_el)
      if(indexOf>-1) f_els.splice(indexOf,1)

      })
    }


    // 将筛选出来的元素加入事件监听
    f_els.forEach(el => {
      _this.custom(el)
    })

  }

  custom (el) {
    let _this = this
    let _el = el
    let template
    let type = _this.checkType(el)
    //todo 将传入的参数el作为对象或者dom解析出来
    if (type === 'object') {
      _el = el.el
      _el = document.querySelector(_el)
      template = el.template
      if (!_el) throw new Error('验证器adds方法添加的参数不正确el必须是dom元素')

    } else if (type === 'string') {

      _el = document.querySelector(_el)
      if (!_el) throw new Error('验证器adds方法添加的参数不正确el必须是dom元素')
    } else if (!el.tagName) {
      throw new Error('验证器adds方法添加的参数不正确,el必须是dom元素/选择器名字或模板')
    }

    //todo listen数据初始化, template一种是已经初始化了要修改, 
    //todo 还有一种是没有初始化但是加入了自定义设置,可以改应定义没自定义的沿用
    //todo 验证器在这里实现继承和多态
    _this.listenDataInit(_this['listenEl'], _el, template)




  }
  // 要有一个函数检查template是否符合规则
  isTemplateValidity (template) {
    if(!template) this.template={}
    if (!this.stateId) this.stateId = 'id'
    if (!template.monitor) template.monitor = 'change'
    // if (!template.pattern) throw new Error('template.pattern必须是一个有效值')
    if (!template.stop) template.stop = true
    if(!template.pattern)template.pattern=null
    if(!template.err)template.err={}

    // if (template.err) if (!template.err.el) throw new Error('template.err.el必须是一个有效值')
  }

  listenDataInit (listenEl, el, customTemplate) {
    //todo 还有一种是没有初始化但是加入了自定义设置,可以改应定义没自定义的沿用
    //todo 验证器在这里实现继承和多态
    let _this = this
    let indexOf = listenEl.indexOf(el)
    //todo 检查实列中有没有该dom元素,进行去重,设置,-1没有重复
    if (indexOf === -1) {

      let index = listenEl.length
      let listenElData = _this['listenElData']
      listenElData[index] = {} // 创建监听el行为的数据库
      //初始化数据
      // let rawData = _this.template
      //let data = !customTemplate ? rawData : customTemplate

      _this.generatorListenData(index, customTemplate)
      //!为el注册信息打上监听的标记 ,为删除做准备

      //* 开启监听 
      _this.verifyListen(el, index)

      //listenEl是一个数组集合 里面存了所有被监听的el 
      listenEl.push(el)
    } else {
      //todo 多态在这里体现
      _this.generatorListenData(indexOf, customTemplate)
     //* 开启监听 
      _this.verifyListen(el, indexOf)
    }

    // 如果存在有两种情况, 1种是错误加入, 2.用户有自定义的设置 
  }

  generatorListenData (index, customTemplate, inherit = true) {
    let _this = this
    let listenElData = _this['listenElData']
    //克隆原始数据避免,数据污染
    let rawData = JSON.parse(JSON.stringify(_this.template))
    //自定义数据优先,没有就使用原始数据
    let data = rawData
    if (customTemplate) data = customTemplate
    //如果不使用继承特性就让数据回归自定义数据
    if (!inherit) data = customTemplate
  
    if(!data) return 

    //if (!inherit) data = listenElData[index]

    //事件去重    // 没有pattern 添加事件监听
    if (listenElData[index].event) window.removeEventListener(listenElData[index].monitor, listenElData[index].event)
    listenElData[index].monitor = data.monitor || rawData.monitor  //在定义属性时如果没有设置该属性就保持不变
    listenElData[index].monitor.replace('on', '')
    listenElData[index].pattern = data.pattern || false  // listenElData[index].pass = false  //如果pattern有值就设置真的如果没有就是假的,
   // if (listenElData[index].pattern) listenElData[index].pattern = new RegExp(listenElData[index].pattern, 'g')
    listenElData[index].stop = data.stop || rawData.stop

    //如果有错误处理就用错误处理
    if (data.err || rawData.err) {
  
      listenElData[index].err = data.err || rawData.err
      
      
      let el = listenElData[index].err.el || rawData.err.el

      if (el) listenElData[index].err.el = document.querySelector(el)

      //如果用了系统的自定义操作函数
      if (data.err.action || rawData.err.action) {
        let action = data.err.action || rawData.err.action
        if(action){
        let check = parseInt(action)
        if (check) action = check
        // 防止误输入将数字变成字符串
        let actionType = _this.checkType(action)
        listenElData[index].err.action = action
        listenElData[index].err.actionType = actionType // !根据action类型添加事件
        listenElData[index].err.actionBehavior = _this.actionBehavior[actionType]
      }
      }
      //如果有自定义函数用自定义函数
      if (data.err.custom || rawData.err.custom) listenElData[index].err.custom = data.err.custom || rawData.err.custom






    }



  }// 到这里将el的数据绑定到实列上完毕.
}

try {
  //export default Verify

} catch (e) {
  console.log(e)
}

export  default Verify