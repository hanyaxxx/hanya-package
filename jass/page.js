
//分页只处理切换逻辑,页面控制不处理视图更新,视图更新交给用户
/*   //*无默认值
  buttonBox: pagination[0], 
  viewBox:staffList[0],
  button:'.paginationNav',
  pageList:StaffList,             //?分页数据集合
  atPageViewUpdate:,             //?回调该函数做视图更新
  atButtonUpdate:,               //?回调该函数做按钮更新
  //*有默认值可配置
  maxPageItem:                 //?单页可显示的数据条目/ 默认20
  maxCurrentNum:              //?可显示的最大分页范围, 默认5 比如一共10个分页,设置5就是先显示5页出来
  minCurrentNum:             //?最小分页数量,默认1,可不设置 
  offset:                   //?刷新后序号偏移量 默认1
  */

class page {
  constructor(init) {
    //todo: 将数据列表按照maxpage切换成几个小块
    //todo 100条数据/20 就是5页
    //todo:分页切换时用到的数据
    this.pageSum = 0        //分页总数
    this.currentOrder = 0   //当前分页位置
    this.packetPage = []    //分页分组用来切换数据
    this.maxLength          //分页分组的最大长度  
    this.atCurrentCount = 0   // 当前分页计数
    this.init(init)
  }

  init (init) {
    //* 分页 必要数据
    init = Object.assign({
      offset: 1,
      maxPage: 20,
      maxCurrentNum: 5,
      minCurrentNum: 1,
    }, init)
    this.buttonBox = document.querySelector(init.buttonBox) //分页容器
    this.buttons = init.button
    this.pageList = init.pageList
    this.viewBox = document.querySelector(init.viewBox)
    this.atPageViewUpdate = init.atPageViewUpdate
    this.atButtonUpdate = init.atButtonUpdate

    //* 分页可配置
    this.offset = init.offset       //刷新前进时的偏移量
    this.maxPage = init.maxPage      //每页最大显示条目
    this.maxCurrentNum = init.maxCurrentNum     //当前能显示的最大分页数量
    this.minCurrentNum = init.minCurrentNum   // 当前能显示的最小分页数量
    this.pageInit(this.pageList)
  }

  //分页注册,可以不改
  pageInit (list) {

    let length = list.length
    // list=姓名,部门...有序列表组成的数组 [{}{}]
    this.pageResult = length / this.maxPage

    // 比如把100个数组修改成5组20个的数组
    if (this.pageResult > 1) this.pageSum = Math.ceil(this.pageResult);


    //数组截取 ,重组
    for (let i = 0; i < this.pageSum; i++) {
      let num = i * this.maxPage
      this.packetPage.push(list.slice(num, num + this.maxPage))
    }


    this.currentOrder = 1
    this.maxLength = this.packetPage.length - 1

    //如果当前数据<this.maxCurrentNum,那么显示this.maxLength
    this.atCurrentCount = Math.min(this.maxCurrentNum, this.maxLength)

    this.updatePagingButton()
    this.atPageViewUpdate(this.viewBox, this.packetPage[this.currentOrder])
  }

  //* 用户配置函数 ,带参数 视图容器, 当前视图分页数据packet
  atPageViewUpdate (container, packet) {
    // staffView.DomReset(container)
    // staffViewUpdate(container,packet,'in')
  }

  //* 用户配置函数 ,带参数, 按钮容器, 分页数量,当前分页位置-1,
  atButtonUpdate (container, atCurrentCounts, count) {
    // staffView.DomReset(container)
    // staffView.update({
    //    container: container,
    //    head: '<li><a id="paginationTop" href="#">«</a></li>',
    //    viewData: atCurrentCounts,// 可枚举对象,或者整数配合key+使用
    //    viewHead: '<li ><a class=paginationNav href="#">',
    //    viewFoot: '</a></li>',
    //    viewOrder: 'key+'+count, // key+ 之争 in 使用自身数据  
    //    foot: '<li><a id="paginationBottom" href="#">»</a></li>',
    //  })
  }

  updatePagingButton (count = 1) {
    let atCurrentCounts = this.atCurrentCount
    if (count + atCurrentCounts > this.maxLength) {
      atCurrentCounts = this.maxLength - count + 1// 刷新页数
    }
    //刷新按钮
    this.atButtonUpdate(this.buttonBox, atCurrentCounts, count)
    //按钮刷新完毕 注册按钮切换
    this.setPagingSwitch()
  }

  setPagingSwitch () {
    let _this = this
    setTimeout(() => {
      let button = document.querySelectorAll(_this.buttons)
      button = [...button]
      this.maxCurrentNum = button[button.length - 1].textContent
      this.minCurrentNum = button[0].textContent
      button.forEach(el => {
        el.addEventListener('click', function () {
          let t = this
          _this.switch(t)
        })
      })

    }, 100)

  }

  switch (button) {
    if (this.currentOrder != button.textContent) {
      this.currentOrder = button.textContent
      this.atPageViewUpdate(this.viewBox, this.packetPage[this.currentOrder])
    }

    //如果按钮 超前了 重渲染
    if (this.currentOrder == this.maxCurrentNum && this.currentOrder < this.maxLength) {
      this.setStepSize()
      this.updatePagingButton(this.result)
    } else if (this.currentOrder == this.minCurrentNum && this.currentOrder > 1) {
      this.cutStepSize()
      this.updatePagingButton(this.result)
    }

  }

  setStepSize () {
    this.result = this.currentOrder - this.offset
    // stepSize(count)
  }

  cutStepSize () {
    this.result = this.currentOrder - this.atCurrentCount + this.offset
    this.result = Math.max(this.result, 1)
  }

}




export default page





