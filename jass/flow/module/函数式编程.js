class functor{
  constructor(val){
    this.val=val
  }

  map(f){
    return new functor(f(this.val))
  }
}

functor.of=function(val){
  return new functor(val)
}

functor.of(2).map((two)=>{
  return two+2
}).map((haha)=>{
console.log( haha)
})

class maybe extends functor{
  map(f){
    return this.val?maybe.of(f(this.val)):maybe.of(null)
  }
}
maybe.of(null).map((val)=>{
  console.log(val )
})


//tither hanzi 

class either {
constructor(left,right){
  this.left=left;
  this.right=right
}
map(f){
  return this.right?either.of(this.left,f(this.right)):
  either.of(f(this.left),this.right)
}
}
either.of = function (left, right) {
  return new either(left, right);
};
var addOne = function (x) {
  console.log(x)
  return x + 1;
};

either.of(5, 6).map(addOne);
// Either(5, 7);

either.of(1, null).map(addOne);
// Either(2, null);
function x(x){
  return 1,2,3,4,5
}
a=x(5)
console.log(a)