class eather {
  constructor(arg,right) {
    this.index = 0
    this.isTrue = []
    this.action = []
    this.isTrueLength = 0
    this.result=null
    this.of(arg, right)

    // arg.forEach(())
  }
  of (arg, right) {
    if (typeof arg === 'object') {
      const that = this
      //只放值
      Object.keys(arg).forEach(item => that.isTrue.push(arg[item]))

    } else {
      
      this.isTrue.push(arg)
      !(right===undefined )? this.isTrue.push(right):null
    }


    this.isTrueLength = this.isTrue.length
    return this
  }

  then (action, elseAction) {

    // 单值就是这么做 
    if (typeof action === 'object') {
      const that = this
      //只放值
      const actions = Object.keys(action)
      let isTrue
      let item
      for(let index=0;index<actions.length;index++){
        item = action[actions[index]]
        that.action.push(item)
        // forEach无法终止. 
        // true 运行对应条件 !true判断下一个条件 
        //actions 应该要比index大于1 最后一个条件没有成立直接运行最后一个函数
        // that.index+1
        isTrue = that.isTrue[that.index]
        if
          (isTrue) {
         that.result = that.action[that.index](isTrue)
         return this
        }
        else if
          (that.isTrueLength === that.index) {
          //最后一个条件没满足 
          // 直接运行 action.length=isTure.length+1
         // let elseFn=()=>{}
          const elseFn=that.action[that.index]
          that.result = elseFn()

       
        }

        that.index++
      }
      

     
    } else if (typeof action === 'function') {
      // action只有一个说明
      const second=this.index
      this.index = Math.min(this.isTrue.length-1,this.index)
      const isTrue = this.isTrue[this.index]
      if (second === 1 && this.index === 0) {
        this.result = action(isTrue) 
        return this
      }
      
   

      this.index++
      this.result = isTrue 
        ?action(isTrue) 
        : this.isTrue[this.index]===undefined
      ?  elseAction && elseAction(isTrue):
      this.isTrue[this.index]
            ? elseAction && elseAction(isTrue):null;
     // return this
    } else {

      throw new Error('then的值应该为函数')
    }

    return this

  }
 result(){
   return this.result
 }
}


const If = (arg, right) => { return new eather(arg, right) }
export default  If


// const action1={
//   check1: () => { console.log('true') },
//   check2: () => { console.log('true') },
//   check3: () => { console.log('true') },
//   check4: () => { console.log('false') },
// }

// const isTrue=[
//   true === false,
//   true === false,
//   true === true,
// ]
// If(true === false)
// .then(
// () => { console.log('true1')},

// )
