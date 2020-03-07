
class stateStore{

  constructor(){
    this.state=null 
    this.useState=null
  }

  of(state,useState){
    this.state = state 
    this.useState = useState
  }
set(p){
  this.useState(p)
}
get(){
return this.state
}

}


export const yaux=(params)=>{
const store={}
  Object.keys(params).forEach(item => store[params[item]]=new stateStore() )

Object.freeze(store)

  const validator={
    set(obj,prop,value){
      if (obj.hasOwnProperty(prop)){
        throw new Error('store没有找到对应state是否未被初始化?')
      }else{
        throw new Error('store不接受数据直接突变')
      }


    },

  }

const storePoxy = new Proxy(store, validator)
return storePoxy

}
