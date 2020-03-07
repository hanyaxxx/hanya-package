import { ELSTORE } from './elStore.js';
import { WorkFlowCenter } from './WorkFlowCenter.js';



const SWITCH = '{switch}'
const STOREEVENTCACHE=ELSTORE['eventcache']

const ORDERCALL = {}
// todo let prams={ 命令中心中的参数 order,rawEls  普通dom操作用的参数 els, key, value,      注册事件用的参数 event, fn,  switch用的参数 trigger ,index} 

ORDERCALL['style'] = function ({ el, key, value, trigger }) {
  if (trigger) {
    DomControl.setSwitchStatus(trigger, key, el, true)
    //if(value==='none') trigger.on=!trigger.on // 如果是hide 行为取反
    let styleSet = function () {
      if (trigger.on) {
        el.style[key] = value;
      } else {
        el.style[key] = trigger.styleCache;
      }

    }
    if (trigger.toggle) styleSet()
  }

  if(key==='display' && value==='none'){
    let status = el['@flowstylecache@']
    if(!status){
      let display=window.getComputedStyle(el)[key] 
     el['@flowstylecache@']=display  
    }
    el.style[key] = value;
  }else if ( key==='display' && value!=='none'){
    let status = el['@flowstylecache@']
   if(!status){
    let display=window.getComputedStyle(el)[key] 
    status= el['@flowstylecache@']=display
  
  }

    el.style[key] = status;

  }
 

};

//闭包不解释, key value 对应ordercenter的第一个参数和第二参数,添加 class只有一个参数所有key相当于value,reverse默认取反
ORDERCALL['addclass'] = function ({ el, key, trigger }) {
  if (trigger) DomControl.orderCenterProxy({ el, key, trigger, defaultAttr: 'classList', defaultFn: 'add', onFnName: 'add', falseFnName: 'remove' })

}

ORDERCALL['removeclass'] = function ({ el, key, trigger }) {
  if (trigger) DomControl.orderCenterProxy({ el, key, trigger, defaultAttr: 'classList', defaultFn: 'remove', onFnName: 'add', falseFnName: 'remove', reverse: true })

};

// dom 控制的三个参数是 el, els,key,value-来自orderCenter的命令, 和 ,event传递的参数
ORDERCALL['setattr'] = function ({ el, key, value }) {
  el.setAttribute(key, value);

};
ORDERCALL['getattr'] = function ({ el, key }) {
  el.getAttribute(key);
};



//todo 缓存系统和智能注册还没做好, 智能注册依赖于缓存, 还有绑定单位,
// 这个是事件缓存运行的函数.eventDriverCache要延迟运行 不然无法捕捉workFlowcenter , 
// el, key=event 名字, workFlowCenter, 事件缓存
ORDERCALL['event'] = function ({ eventcache,el,rawEls, event, fn, index }) {

  let obj = { on: null, index: index, trigger: null }
  let action= function (e) {
    obj.trigger = this
    obj.e = e
    e.stopPropagation();
    fn(obj)
  }
  
  el.addEventListener(event,action );
  
  
  DomControl.addEventCache(rawEls,{action,event,eventcache,el})
 // STOREEVENTCACHE[rawEls]={action}
};


export class DomControl {
  constructor() {
  }
  init () {
    //初始化命令中心具体指令
    let _this = this;
    _this.isEventDriver = false;
  }

  static orderCenterProxy ({ el, key, value, trigger, defaultAttr, defaultFn, onFnName, falseFnName, reverse }) {
    DomControl.setSwitchStatus(trigger, key, el)
    if (reverse === true) trigger.on = !trigger.on  // 反面事件就取反
    if (trigger.toggle) return DomControl.switchOrderDispose({ el, defaultAttr, onFnName, falseFnName, value: trigger.result, on: trigger.on })     // 表示可以切换 开启切换函数 否则使用default值

    // default: key是一个值 
    defaultFn ? el[defaultAttr][defaultFn](key) : value ? el[defaultAttr][key] = value : null


  }

  static setSwitchStatus (trigger, key, el, style) {
    // 这个东西是缓存 截取了switch的前置符号
    if (!trigger.result) {
      // 第一步获取switch状态 
      trigger.result = key.replace(SWITCH, () => {
        trigger.on = trigger.on ? false : true
        trigger.toggle = true
        if (style) trigger.styleCache = window.getComputedStyle(el)[key]

        return ''
      })

    } else {

      trigger.on = trigger.on ? false : true
    }
  }


  static switchOrderDispose ({ el, defaultAttr, onFnName, falseFnName, value, on }) {
    if (on) {

      el[defaultAttr][onFnName](value);
    } else {

      el[defaultAttr][falseFnName](value);

    }
  }

  static elStoreRefresh (el) {
    //要将el绑定成字符串

    return ELSTORE.elStoreRefresh(el);
  }

static selectorSynSugarFilter(el){
  if(el.tagName)return el
  let sugar=''
   el=  el.replace(/(@)(!)?(\d+)?/,(_,g1,g2,g3)=>{
      
      if(g1&&g2&&g3){
            g3=+g3+1
        sugar=`:not(:nth-child(${g3}))`
      }else if(g1&&g3){
             g3=+g3+1
        sugar=`:nth-child(${g3})`
      }
      

      return ''
     })

   return el=el+sugar  
}

  getStoreEl (el) {

    return ELSTORE.isInStore(el);
  }

  static isTriggerOrderCall (orderCall, prams) {

    prams.el=prams.els
    orderCall(prams) //单元素不用序列
    return true


  }

  //传两个对象一个是order对象,一个是命令对象event:event,fn:fn
 // todo let prams={ 命令中心中的参数 order,rawEls  普通dom操作用的参数 els, key, value,      注册事件用的参数 event, fn,  switch用的参数 trigger ,index}  
  static orderCenter (prams) {
    let _this = this;
    //let order = els,key,value.order
    //let prams={ order, els, key, value, event, fn, rawEls, trigger }

   let els = _this.getStoreEl(prams.els);
    prams.els=els
    
    let orderCall = ORDERCALL[prams.order].bind(_this);


    // 如果要操作响应者本身,那么return  // 多数组的时候开启自动刷新机 
    if (Array.isArray(els)) return DomControl.orderCenterAutoRefreshOrderCall(orderCall, prams)

    // 单值操作 
    return DomControl.isTriggerOrderCall(orderCall, prams)

  }

  static orderCenterAutoRefreshOrderCall (orderCall, prams) {

    try {

      DomControl.orderCenterOrderLoopCall(orderCall, prams)

    }

    catch (e) {
      console.log(e)

      let refresh = DomControl.elStoreRefresh(DomControl.selectorSynSugarFilter(prams.rawEls)); // 这个刷新暂时刷不了因为没有绑定字符串原始值.

      if (refresh) DomControl.orderCenterOrderLoopCall(orderCall, prams)
      // _this.orderCenter(...arg); // 做一次回调

    }
  }

  static orderCenterOrderLoopCall (orderCall, prams) {
    //el报错就刷新重置
    prams.els.forEach((el, index) => {
            prams.index=index
            prams.el=el
      orderCall(prams);

    });

  }


  orderCallBeforeProxy (orderBindParams) {

    orderBindParams.rawEls=orderBindParams.els
    DomControl.orderCenter.call(this, orderBindParams);

  }


  static cacheBackUps () {
    let workFlowCenter = this.workFlowCenter;
    if (!workFlowCenter)
      workFlowCenter = this.workFlowCenter = new WorkFlowCenter();
    let workFlowCache =
      workFlowCenter.workFlowItems.push(workFlowCache);
  }
  // 获得当前内部工作流,负责会清空
  getWorkFlow () {
    return this.workFlowCenter;
  }

  // 使用当前的工作流
  useworkFlow () {
    this.startworkFlow();
  }

  ////////////////////////////////////  
  //todo 具体方法
  css (el, css, value, trigger) {
    // //let el = this.getStoreEl(el);
    //如果没有值就刷新缓存,
    // this.orderCenter('style', el,css, value)

    this.orderCallBeforeProxy({order:'style', els:el, key:css, value:value, trigger});
    return this;
  }
  show (el, trigger) {

    this.orderCallBeforeProxy({order:'style', els:el, key:'display', value:'inherit', trigger});
    return this;
  }
  hide (el, trigger) {

    this.orderCallBeforeProxy({order:'style', els:el,key: 'display', value:'none', trigger});
    return this;
  }
  addClass (el, className, trigger) {

    this.orderCallBeforeProxy({order:'addclass', els:el, key:className, trigger});
    return this;
  }
  removeClass (el, className, trigger) {

    this.orderCallBeforeProxy({order:'removeclass',els: el, key:className, trigger});
    return this;
  }
  attr (el, key, value, trigger) {
    //let el = this.getStoreEl(el);
    this.orderCallBeforeProxy({order:'attr', els:el, key:key, value:value, trigger});
    return this;
  }
  // 事件名 触发选择器 回调函数
  event (event, trigger, fn) {
    let _this = this
    //采用延迟注册
    let obj={ order:'event',els: trigger, event: event, fn: fn }
    _this.eventDriverCache = DomControl.orderCenter.bind(_this,obj)
      obj.eventcache=JSON.parse(JSON.stringify( _this.eventDriverCache))
    _this.eventDriverCache();
   //以字符串el为依据执行动态注册, 需要event缓存 
    return this;
  }

static addEventCache(els,cache){

ELSTORE.addEventCache(els,cache)
}

refreshEvent(els){
 ELSTORE.refreshEvent(els)
 // 模板刷新后执行注册 
 STOREEVENTCACHE['els']()
}

}
