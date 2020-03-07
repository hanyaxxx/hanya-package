/* eslint-disable no-global-assign */
/* eslint-disable no-undef */
// class publicFollow {
//   constructor(params) {

try {
  if (global) {
    // eslint-disable-next-line no-global-assign
    document = {};
    window = {};
    window.history = {};
    window.history.pushState = function (arg) {
      console.log(arg);
    };
    class virtualDom {
      constructor(arg) {
        //  super()
        this.name = arg;
        this.attribute = {};
        this.style = {};
        this.innerHTML = 'innerhtml';
        this.firstChild = {};
      }

      attr (type, value) {
        if (value) {
          this.attribute[type] = value;
        } else {
          if (!this.attribute[type])
            throw new Error('设置属性不正确,没有该属性名请检查参数');

          return this.attribute[type];
        }
      }
    }

    document.querySelector = function (arg) {
      return new virtualDom(arg);
    };
  }
  // eslint-disable-next-line no-empty
} catch (e) { }
//  
if (!Array.isArray) {
  Array.isArray = function (arg) {
    return Object.prototype.toString.call(arg) === '[object Array]';
  };
}

Object.isObj = function (arg) {
  return Object.prototype.toString.call(arg) === '[object Object]';
};

String.isStr = function (arg) {
  return Object.prototype.toString.call(arg) === '[object String]';
};
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




class Router extends publicMethod {
  // eslint-disable-next-line no-unused-vars
  constructor(params) {
    //!还可更新的功能
    //* 1.在路由响应和路由跳转前添加拦截器
    //* 2.配置url可否可编码
    //* 3.配置标签名字
    //TODO:4.刷新页面在什么情况下需要?
    //* 5.在历史记录跳转前添加拦截器
    super();
    this.entranceElement = params.entrance; //配置入口元素
    this.homepage = params.homepage;//配置主页面
    this.URLEscape = params.urlescape; //配置url是否编译
    this.tagPath = params.tagpath || 'path' //配置路由标识
    this.routerViewId = params.viewid || 'router-view-id'//配置view标识

    //FIXME:渲染器和响应器使用数据
    //字面量渲染方法关闭了.
    //? this.rawData = params;

    //!控制器相关的数据
    //this.path2MapDom = {}; //通过path树映射router-view

    this.routerEl = {}; //通过path映射控制器 ,控制器的mapdom属性就是视图

    //FIXME:History使用数据
    //before是router对象
    this.historybefore = null;
    this.beforeTree = []
    //当前location的pathname防止url错乱
    this.location_pathname = location.pathname;
    this.location = location.href;
    //初始化启动
    this.routerInit();
  }

  //FIXME:初始化
  routerInit () {
    let _this = this;

    //1.渲染器解读数据模板

    //2.还有一个字面量方法生成没有打开
    _this.routerRender = new routerRender(_this);
    // _this.routerRender(_this.rawData);

    //添加初始化的历史记录
    _this.initHistoy();

    //为监听历史记录添加响应事件
    _this.HistoryPopstate();
    //让路由器进入首页


    //设置响应拦截器
    this.setResponseBlocker((tigger, before, next, router) => { next() })
    this.setHistoryBlocker((trigger, before, next, router) => { next() })
  }

  isPathLegal (path) {
    if (!path) return false;
    if (!String.isStr(path)) return false;
    if (path.substr(0, 1) != '/') path = '/' + path;
    return path;
  }
  initHistoy () {
    let _this = this;
    //初始化历史状态
    _this.historybefore = document.createElement('div');
    _this.historybefore['routerpath'] = '';
    _this.beforeTree = [_this.historybefore]
    //检查homepage路径是否合法
    _this.homepage = _this.isPathLegal(_this.homepage);
    //homepage格式合法就添加到历史记录中去
    _this.homepage && _this.routerHistory(_this.routerEl[_this.homepage]);


  }

  // response ->next
  HistoryNext (router, tigger) {
    return function () {
      router.analyzePathTree(tigger);
      // _this.routerEl[responser]
      // router.routerHistory(tigger)
    }
  }

  //FIXME: 路由响应前的拦截器->回调函数
  setHistoryBlocker (fn = null) {
    //todo 要判断是不是一个函数
    if (!Object.checkType(fn, 'function')) throw new Error("拦截器必须要传入函数")
    this.HistoryReadyBack = fn
  }

  HistoryPopstate () {


    let _this = this;
    window.onbeforeunload = function (e) {
      event.preventDefault();
      e.returnValue = ("哈哈");

    };

    window.onpopstate = function routerHistoryCheck () {
      let decode = _this.URLEscape ? unescape(location.pathname) : this.decodeURIComponent(location.pathname);

      let reg = new RegExp(_this.location_pathname + '(.+)');
      let responser;
      try {
        responser = reg.exec(decode)[1];
      } catch (e) {
        responser = '/';
      }
      let trigger = _this.routerEl[responser]
      if (!trigger) return
      _this.notHistory = false
      _this.HistoryReadyBack(
        trigger,
        _this.historybefore,
        _this.HistoryNext(_this, trigger),
        _this
      )

    };
  }



  // response ->next
  responseNext (router, tigger) {
    return function () {
      router.routerHistory(tigger)
    }
  }

  //FIXME: 路由响应前的拦截器->回调函数
  setResponseBlocker (fn = null) {
    if (!Object.checkType(fn, 'function')) throw new Error("拦截器必须要传入函数")
    this.responseBlockerRun = fn
  }

  //FIXME:2.路由响应器
  routerResponse () {
    let _this = this; //获得被响应的dom元素
    let router = _this.router;  //对应控制器的 el[router]属性
    router.notHistory = true
    //!第一个参数响应路由,第二个参数当前的路由,第三个参数next,第4个参数当前路由
    router.responseBlockerRun(
      _this, //响应元素
      router.historybefore, //当前元素
      router.responseNext(_this.router, _this), //使用next的,一个闭包
      router);

    event.stopPropagation();
  }


  //FIXME:history 响应路由写入历史
  routerHistory (responser) {
    let _this = this;
    let before = _this.historybefore;
    let responserpath = responser.routerpath; //取得路径
    let beforepath = before.routerpath;//!对应控制器[routerpath]属性

    //1.对比responser与before的路径 是否一致
    if (responserpath === beforepath) return;

    _this.analyzePathTree(responser);
    //缓存当前路由 如果打开编码就编译url
    if (_this.URLEscape) responserpath = escape(responserpath)

    window.history.pushState(
      null,
      null,
      _this.location_pathname + responserpath,
    );
    // console.log(_this.location_pathname + escape(responserpath))
  }

  //todo 路径解释器,控制器读出数据展示view的过程,开始
  analyzePathTree (responser) {
    let _this = this;

    //*记录响应后的路由
    //todo 响应后的路由应该是responser下的router-view
    _this.historybefore = responser;

    //*从控制器中解析出路径树,
    //?因为渲染路径树的时候直接将split, push进了这里所以要加个0调了很久BUG
    //let r_pathtree = responser['pathtree'][0];
    _this.jumpBeforeAction(responser['pathtree']);



  }
  //做拦截操作 和生成view-router
  jumpBeforeAction (pathtree) {
    let _this = this;

    let r_mapdom_tree = _this.buildMapDom(pathtree);
    _this.routerJump(r_mapdom_tree);

  }

  //TODO: 解析路径树将路径树上的路径从router-map依赖中读出
  //todo 控制器用到了哪些数据?routerpath->取出控制器,pathtree->取出控制器路径链表, _this.routerEl[str]['mapdom']->取出链表上对应的视图

  buildMapDom (pathtree) {
    let tree = []
    let _this = this;
    let view
    pathtree.forEach(str => {
      //debugger
      view = _this.routerEl[str]['mapdom']
      tree.push(view); //?这一条什么意思?this.routerEl[str][mapdom]=视图,
    })
    return tree;
  }

  //! 路由跳转器
  routerJump (r_tree) {
    //实现跳转
    //TODO:
    let _this = this
    _this.beforeTree.forEach(el => {
      _this.routerShow(el, false)
    });//?b_tree[视图1,视图2,视图3]保存的是控制器路径链表上的所有控制器视图,意思跳转一次所有路径链表上的视图刷新一遍
    let showTree = []
    if (r_tree) r_tree.forEach(el => {
      showTree.push(el)
      el.style.visibility = 'visible'
      el.style.display = 'inherit'
      el.style.position = 'unset'
      _this.routerShow(el)
    });
    _this.beforeTree = showTree
    // 跳转后发送通知
    if (_this.notHistory) {
      _this.routerJumpEnd(_this.historybefore['routerpath'])
    }
  }
  routerJumpEnd (path) {
    //console.log(path + '完成跳转')

    if (path === '/企业设置') {
      this.jumpTo('/企业信息');
    }

  }

  jumpTo (path) {

    //解析企业信息的pathtree上是否有企业设置
    //1.通过path找到dom
    //_this.historybefore['routerpath']
    let jumppath = this.historybefore['routerpath'] + path

    let jumproute = this.routerEl[jumppath] || this.routerEl[path]
    // if(!jumproute)jumproute=this.routerEl[path]

    this.routerHistory(jumproute)
  }

  setJumpEnd (fn) {
    this.routerJumpEnd = fn
  }


  routerShow (el, show = true) {
    if (show) {
      el.style.visibility = 'visible'
      el.style.display = 'inherit'
      el.style.position = 'unset'

    } else {

      el.style.visibility = 'hidden'
      el.style.position = 'absolute'
    }

  }


}

class routerRender {
  constructor(router) {
    //todo 控制器一共承载了哪些数据? 
    //todo router routerpath  pathtree mapdom 
    //?渲染器做了哪些核心工作? 1.通过path查询控制器,2.通过router-view-id查询视图,3.通过控制器与视图的依赖关系进行遍历,根据控制器的数据需求进行数据渲染
    this.router = router;
    this.path = router.tagPath;
    this.routerViewId = router.routerViewId;

    this.renderinit();
  }

  renderinit () {
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
    _this.fn = [
      _this.routerConditionSelector,
      //_this.forloopConditionSelector
    ]

    _this.elementTraversePoly(elements)
  }

  //* 根据条件选择器的名字返回一个签名标识
  traverseSign (name) {
    return name.name + 'elementTraversePoly'
  }
// async asyncActionRun(action,_this,element,...arg){
//   let res
//   await res=action.call(_this, element, ...arg)

// }

  elementTraversePoly (elements, ...arg) {
    let _this = this
    let fn = _this.fn
    if (arg.length == 0) arg = [null]

    Object.keys(elements).forEach(el => {
      let element = elements[el]
      //fn.forEach=选择器队列
      fn.forEach(action => {
        //* 检查元素关于执行函数的标识如果存在就跳过,防意外情况
        let sign = _this.traverseSign(action)
        if (element[sign]) return
        //* action.call是事先准备好的条件选择器函数
        let fnTips =  action.call(_this, element, ...arg)
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


  routerConditionSelector (element, fatherpath) {
    let _this = this;
    let router = element['routerpath']
    let path = element.getAttribute(_this.path)
    if (!router && path) {
      return {
        fn: _this.render,
        // arg: () => {
        //   //? arg必须是函数才能接收到外部参数 可以用数组测试错误吗?
        //   return [element, fatherpath]
        // },
        args: [element, fatherpath]
      }
    }

  }


  // routerSearcher(elements, fatherpath) {
  //   let _this = this;
  //   Object.keys(elements).forEach(el => {
  //     let element = elements[el]
  //     let router = element['routerpath']
  //     let path = element.getAttribute(_this.path)
  //     //判断标签里有path属性,并且没有被渲染过否则取出子元素进行遍历
  //     if (!router && path) {
  //       //满足条件调用函数  fn[check()](..arg)
  //       //childrens肯定要遍历,不满足的加入一个队列
  //       // elements=函数.
  //       _this.render(element, fatherpath);
  //     } else {

  //       let elc = element.children;
  //       if (elc.length > 0) _this.routerSearcher(elc, fatherpath);

  //     }
  //   });
  // }

  routerMapRender (el, viewRouter) {
    let children
    el['mapdom'] = viewRouter
    //所有的视图默认是隐藏的
    //映射关系,隐藏视图,遍历子路由.
    this.router.routerShow(viewRouter, false)
    // viewRouter.style.visibility = 'hidden';
    // //el.style.visibility = 'hidden'
    // viewRouter.style.position = 'absolute'
    children = viewRouter.children;
    if (children.length > 0) this.elementTraversePoly(children, el['routerpath']);
  }


  checkRouterMap (el, viewId) {
    let viewRouter
    if (viewId) {
      viewRouter = document.querySelector(viewId)
      if (!viewRouter) throw new Error("视图id填写不正确没有对应的id")

    } else {
      //!没有的话就制造一个viewRouter!
      let title = el.getAttribute('title')
      // if (title === "组织排序") {
      //   console.log(title)
      // }
      el.innerHTML = '<span>' + title + '</span><router-view>' + el.innerHTML + '</router-view>'
      viewRouter = el.getElementsByTagName('router-view')[0]
    }
    this.routerMapRender(el, viewRouter)

  }

  render (el, fatherPath) {

    let _this = this;
    let router = _this.router;
    //这一步路径补全
    let path = el.getAttribute(_this.path);
    //if (el['routerpath']) return 之前用这个方法解决的小bug纪念它
    if (path == "") throw new error('路径中不能含有非法字符("")')
    if (path.substr(0, 1) != '/') path = '/' + path;
    if (fatherPath) path = fatherPath + path;

    // 先检查控制器下没有没有router-view-id如果有跳转到视图器下进行遍历,如果没有就在子节点下遍历.
    let routerViewId = el.getAttribute(_this.routerViewId);
    //检查路由映射关系是单页面还是内联页面



    //!映射
    if (router.routerEl[path]) throw new Error('数据渲染错误检查路由路径是否重名' + path)
    router.routerEl[path] = el; //?为每一个path配置控制器,那么当有路径跳转的时候就能找到控制器,然后控制器又可以读取各种属性
    el['routerpath'] = path;//?在渲染view的时候 ->通过这个属性找到path的层级关系
    el['router'] = router;//?用于最终router实列,控制器响应的时候让通过这个属性让他使用实列里面的方法 已便访问实列中的数据

    //将控制器与视图进行映射
    _this.checkRouterMap(el, routerViewId);

    //添加响应事件
    el.addEventListener('click', router.routerResponse)


    //TODO 只要有EL就有mapdom,将当前路径与view绑定 那么就可以从路径中读取控制器对应的视图
    //不过这样搞 数据模板就乱了 最后是以控制器为中心, 导出数据流
    //router.path2MapDom[path] = el['mapdom'];

    //!控制器要跳转前要把他父亲以上的信息读出来所以要有一个pathtree
    //渲染状态树
    el['pathtree'] = [];
    renderPathTree(path);

    async function renderPathTree (path) {

      await function start () {
        //pathtree的内容要打上/标记
        let trees = []
        let tree = path.split('/')
        //debugger
        tree.splice(0, 1)
        tree.forEach(
          (item, index, t) =>
            trees.push(
              //第一次1 第二次2 第三次3   
              // 1-index
              //第二次 1-index
              //第三次1-index
              t.slice(0, index + 1)
                .reduce(
                  (pre, cur) =>
                    pre + '/' + cur, ''
                )))
        //console.log(trees)
        el['pathtree'].push(...trees);
      }()


    }
  }

}



class literalRouterRender {
  constructor() {
    //!字面量模板
    //! let routers = {
    //!   dom: '#root',
    //!   path: '/root',
    //!   mapdom: '映射dom',
    //!   routers: [],
    //! };
  }
  routerRender (data) {
    //递归判断->中间层
    let _this = this;
    let recursiveQuery = (data, fatherpath) => {
      //如果是数据是数组遍历出剩余的所有对象
      let fp = fatherpath;
      if (Array.isArray(data)) {
        data.forEach(item => {
          recursiveQuery(item, fatherpath);
        });
      } else if (Object.isObj(data)) {
        //如果是对象对其进行解析与渲染
        //判断是否为空对象,空对象就跳过
        if (!Object.keys(data).length == 0) render(data, fp);
      } else {
        throw new Error(
          '路由初始化错误,数据类型不正确,确定参数是否为数组或者对象',
        );
      }
    };

    recursiveQuery(data);

    function render (data, fatherPath = null) {
      let domId = data.dom;
      let path = data.path;
      let mapdom = data.mapdom;

      if (path.substr(0, 1) != '/') path = '/' + path;
      if (fatherPath && fatherPath != '/') path = fatherPath + path;
      let children = data.routers;
      let dom = document.querySelector(domId); //这个家伙是dom元素草
      //如果考虑兼容性的话这个方法要改
      dom['routerpath'] = path;
      dom['router'] = _this;
      // 这里有一个路由与dom的映射关系,为路由注册响应事件,控制div的显示与隐藏
      //router.onclick那么router到底是谁?这一步要分离出去
      dom.onclick = _this.routerResponse; //为dom注册响应事件

      //映射mapdom
      //mapdom没有就创建一个节点,把节点挂载
      checkMapdom(mapdom);
      function checkMapdom (mapdom) {
        if (mapdom) {
          let md = document.querySelector(mapdom);
          mapto(md);
        } else {
          let routerHTML = dom.innerHTML;
          dom.innerHTML = `<div>${routerHTML}</div>`;
          let el = dom.firstChild;
          mapto(el);
          //1.遍历出routerdom的所有子节点
          //2.将routerdom的所有子节点挂载在
        }
        function mapto (el) {
          dom['mapdom'] = el;
          el.style.visibility = 'hidden';
          //构建路径2 mapdom的转换模板
          _this.path2MapDom[path] = el;
        }
      }

      //检查是否有子路由
      if (children) recursiveQuery(children, path);

      //渲染状态树
      dom['pathtree'] = [];
      renderPathTree(path);

      async function renderPathTree (path) {
        await dom['pathtree'].push(path.split('/'));
      }
    }

    //检查有没有设置跟路由/没有设置就报错
    if (!_this.path2MapDom['/'])
      throw new Error("没有设置根路径 '/',请设置一个根路径'/' ");
  }
}

try {
  // eslint-disable-next-line no-undef
  module.exports = Router;
  // eslint-disable-next-line no-empty
} catch (e) { }

export default Router;
