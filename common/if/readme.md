
https://juejin.im/post/5e78831a6fb9a07ce01a5014 这篇文章可以帮你循序渐进理解,内容差不多,语句顺序不一样

#If() 函数介绍:

##特性:
1.优化If-else多分支使用的情况,
2.优化嵌套If-else分支使用情况
3.优化代码结构.
4.支持链式调用 
5.支持基本 if-else结构 
6.支持异步调用 
7.支持条件与函数体分离 

###使用:
```js
 If() //生成一个If实列化对象 
 const newIf=If() //实列化 
// 其他接口:
 newIf.of() 存放条件 
 newIf.fn() 存放函数体
 newIf.then() 检查条件并执行
```

 ##### 基本用法:
 If()实列化
 ```js
 // 参数存放类型为布尔值, 可接收数组或者对象或者函数 
 If(arg[type:boolean,array,object,function])  

 If(value===1)
 If([value===1,value===2]) 
 If({check1:value===1,check2:value===2}) //使用对象作为参数用于复杂分支场景下区分
 If([()=>{}])  // 函数需要返回布尔值 
 ```
 then方法
 ```js
// then 的参数存放函数执行体 类型为数组, 对象,函数,函数执行体可接收参数,
 If().then(arg[type:function,array,object])  
 then([fn1,fn2])
 then({fn1:fn1})
 then(fn1)
 ```
  函数执行体与布尔值的关系是一一映射的
  ```js
  const condition=[value===1,value===2,value===3]
  const action=[()=>{},()=>{},()=>{}]
  If(condition).then(action) 
  // condition[0]成立执行action[0],以此类推
  ```


 比如:
 ```js
//1
if(value===1){
    pass()  
 }else{
    error()
 }
 
//等价于:
If(1===1).then(pass,error)

//或者使用链式调用
If(1===1).then(pass).then(error)

//2
if(value===1){
pass()
}else if(value===2){
error()
}

//等价于:
If(value===1,value===2).then(pass,error) 
If(value===1,value===2).then(pass).then(error)

布尔超过2个以上参数中请使用数组或者对象进行映射
```

###### if已经很简单了,这样用有什么的好处?

假设一种简单的业务场景,通过boolean的状态显示或者隐藏一个按钮并做一系列业务操作,一般是这么写
```js
if(value===true){
  show()
  other()
}else{
  hide()
}
```
后面业务需求改变了.不管boolean如何都显示这个按钮,但进行其他业务操作

```js
if(value===true){
  show()
  other()
}else{
  //hide()
}

// 现在代码结构有点不好看, 有代码洁癖的朋友可能还会这样改
value===true?show(),other():null

这样有个缺点这样子改结构简洁了,但是万一哪一天功能需要回退还要改回来,很麻烦
```

现在可以这样改
```js
#1
If(value===true).
then(()=>show(),other())
//.then(()=>hide())  万一哪一天产品抽风了直接改回来,结构也不错 
```

##### 示范2 多分支使用:

```js
...
other1()      //各种业务代码
if(value===1){

}else if(value===2){

}else if(value===3){

}else if(value===4){

}else if(value===5){

}else if(value===6){

}

other2()
...
```
可以做逻辑检查和函数执行体的分离
```js
#2
 ***数据块***
 //*逻辑检查的数据*
//数组格式
const condition=[
  value===1,
  value===2,
  value===3,
  value===4,
  value===5,
  value===6,
]

//对象格式
const condition={
  check1:value===1,
  check2:value===1,
}

//*函数执行体数据*
action={
  action1:()=>{log(1)},
  action2:()=>{log(2)},
  ........
}
```
使用If()函数修改后
```js
...
other1()  //各种乱七八糟业务代码  

 //具体执行阶段抽象成一行代码
If(condition).then(action) // value=3 输出3
other2()
...
```

###### 这样做好处显而易见,抽象出来的数据如果依赖于多种状态代码是可以二次复用的,其次将
###### 业务代码与复杂的分支结构进行了分离,让代码更好维护,结构更加美观清晰

如果业务逻辑足够简单的话还可以改成循环体使用

```js
#3
//上面代码改成
const newIf=If()

[1,2,3,4,5,6].forEach((value,index)=> newIf.of(value===index).fn(()=>log(index)))

newIf.then() // value=3 输出3   两段等价

//newIf.of 这句话的意思是把布尔值存在newIf里面 
//newIf.fn 是把函数体存在newIf里面
//then     对实列中的布尔值和函数体进行分支检查

```
##### #1 #2 #3 三段代码等价

高级使用:

示范3
解决-> 嵌套多分支的情况:
```js
#1
if(){
  if(){
    if(){
       if(){
        if(){
          if(){
    }    
    }  
    } 
    }
  }
}
```

使用If函数修改
```js
#2
const newIf=If()
newIf.of(value===1)
.then(()=>newIf.of(value===2)
.then(()=>newIf.of(value===3))
.then(()=>newIf.of(value===4)
.then(()=>newIf.of(value===5)
.then(...)))
  )
)
```

推荐:
```js
#3
.....
action5=()=>newIf.of(value==4).then(action7)
action4=()=>newIf.of(value==4).then(action6)
action3=()=>newIf.of(value==4).then(action5)
action3=()=>newIf.of(value==4).then(action4)
action2=()=>newIf.of(value==3).then(action3)
action1=()=>newIf.of(value==2).then(action2)
newIf.of(value===1).then(action1)

```


业务逻辑简单也可用循环优化:
```js
#4
const arr=[1,2,3,4,5,6].map((item,index)=>()=>newIf.of(value===index).then(arr[index+1])})

newIf.of(v===1).then(arr[0])
```



#### #1 #2 #3 #4等价

延迟使用:

```js
const newIf=If(value===1).fn(()=>{log(1)})
setTimeOut(newIf.then()) //输出1

```

与函数体分离:
```js
const newIf=If()
newIf.of(value===1).fn(()=>log(1))
newIf.then() //输出1 
```

###### 条件作为一个函数体使用+传递参数 
```js
If(()=>{
  return {
    boolean:true, // 作为函数使用必须返回一个对象,并且有boolean值
    value,
    age,
    name,
    ....
  }
}).then(({value,age,name})=>{
  log(value,age,name)
}) 
```
## 进阶使用

###### 使用参数传递跳出无限递归:

有时候我们要根据一个数据的状态发送一段信息,等待s秒后又要添加一段信息

```js

let isTips=value===true 
if(isTips){
  sendMessage('1')
  setTimeout(()=>{
    if(isTips){
      setTimeout(()=>sendMessage('3'),2000)
    } //不确定x秒后的值

       sendMessage('2')
  },1000)
}

```

现在这样改

```js
const isTips=()=>{
  
  return {
     boolean:value===3,
     message:message,
     delay:delay
  }
}
const send=({message,delay})=>{
   sendMessage(message)
   return delay
}

setTimeout(()=>{
res=If(isTips).then(send).result()   // res等于send返回值

},1000)
```

#### 串联使用--随意的功能扩展

有时候也许需求经常增加和删除怎么改呢?

```js
function run(){
  action1()
  action2()
  action3()
  //action4()
}

if(value===true){
    run()
}


```
If函数这样改

```js
If(isTips)
.then(()=>log(1))   // 输出1
.then(()=>log(2))  // 输出2 
.then(()=>log(3)) // 输出3
//.then(()=>log(4)) 依赖于最后一个条件输出 只要是true 不断执行then函数体

```


链式调用 :
```js
If(value===3).then(()=>log(...))
.of(value===3).then(()=>log(...))
.of(value===4).then(()=>log(...))
.of(value===5).then(()=>log(...))
```


#### 异步使用+参数传递+延迟检查+重复利用
```js
const newIf=If()

let value=0
newIf.of(()=> {
  
  return {
    boolean: value===3  
    value:value,
    state: value===3?通过:不通过
    text:'...'
    ...
}
} )

setTimeout(()=>{
value=3
} ,2000)

setTimeout( ()=>{
  newIf.then(({value,state,...})=>{
    log(value,state) // value=0,state=不通过
  })
} ,1000)

setTimeout( ()=>{
  newIf.then(({value,state,...})=>{
    log(value,state) // value=3 state=通过
  })
} ,5000)

```
