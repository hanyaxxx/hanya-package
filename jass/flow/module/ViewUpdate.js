const  forReg=/@for ([A-Za-z0-9_$]+),?,?([A-Za-z0-9_$]+)? in ([A-Za-z0-9_$.]+) =>{([^]+)}/g

const  valueAsyReg=/{([\w.$]+)}/g

//const RENDERHTMLREG = /(<[\w \s=\@$'\"-.+*!#$%^():?;]+>)(?:\s?\[?\{([\w .@$#\[\]&]+)\}\]?)(.+)?(<\/[\w \s=\$'\"-]+>)/



class ViewUpdate {
  constructor() {

  }

  viewUpdate (html, parent,  delay) {
    let render = this.renderHTML(html)
    ViewUpdate.domUpdate(render, parent, delay)

    // ViewUpdate.domCover(render, parent, delay) 
  }

 static generatorData(moduleChars,data,valKeywords,indexKeywords,currentIndex){
    let item
    let splitAttr
    let splitAttrLength
    let _this=this
     return moduleChars=moduleChars.replace(valueAsyReg,(_,g1)=>{
      splitAttr=g1.split('.')
       splitAttrLength=splitAttr.length
        if(splitAttr[0]===valKeywords){
          item=data
        }else{
          item=ViewUpdate.getModuleCharsVal.call(_this,splitAttr[0])
        }
        for(let i=1;i<splitAttrLength;i++){
          if(splitAttr[i]===indexKeywords) splitAttr[i]=currentIndex
          item=item[splitAttr[i]]
    
        }
    
       return `${item}`
    
     })
    
    
    
    }

  static getModuleCharsVal(chars){
    
    let _this=this 
    let data=_this[chars]
    if(!data) data=eval(chars)
    return data
  }

  //增加添加或者覆盖命令
  renderHTML (html) {
   let _this=this
    html.replace(forReg,(_,g1,g2,g3,g4)=>{
      let joinHtml=''

      let data=ViewUpdate.getModuleCharsVal.call(_this,g3)

      if(g1&&data&&g4){

        Object.keys(data).forEach((item,index)=>{

          joinHtml= joinHtml+ViewUpdate.generatorData.call(_this,g4,data[item],g1,g2,index)
        })
        
      }
      
      return joinHtml
    })
  }


  static domUpdate (rules, node, model=null, delay = 0) {

    if(model!=='add') ViewUpdate.domReset(node)
    delay===0?node.innerHTML = node.innerHTML + rules:  setTimeout(() => {
      node.innerHTML = node.innerHTML + rules
    }, delay)

  

    //node.appendChild(c)
  }
  static domReset (node) {
    node.innerHTML = ''
  }

  static domCover (rules, node) {
    node.innerHTML = rules
  }

}

const viewUpdate = new ViewUpdate()

export { viewUpdate }


