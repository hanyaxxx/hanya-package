import { DomControl } from './DomControl.js';
import {viewUpdate} from './ViewUpdate.js';
import verify from '../../verify.js';


// 1. 匹配两个字符串不一样的部分, 
// 2. 缓存怎么实现,缓存的思路是要一个局部接收器在, 有一个依据就好办
class Method {
  constructor() {
     this.viewUpdate=function(html, parent, order,delay){
      let node= this.getStoreEl(parent)[0]
      
      viewUpdate.viewUpdate.call(this,html,node,order,delay)
      return this
     }
     this.renderHTML=viewUpdate.renderHTML
  }
}

Method.prototype.__proto__ = new DomControl();

export {Method}

