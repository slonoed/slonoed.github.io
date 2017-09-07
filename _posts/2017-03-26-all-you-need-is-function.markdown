---
layout: post
title:  "All you need is function"
published: true
excerpt: ""
---

Functional programming in javascript is a thing. There are many blog posts, videos, courses about.
People spread ideas about immutability, composition, pure functions, recursion, (paste any hypeword you want).
I think all these intentions are not strong enough.
We should go deeper and start using only functions in our code.

## Boolean operators

The basic blocks we need are boolean operations: AND and OR.

```javascript
const and = (...args) => {
  let z
  args.every(k => (z = k, k))
  return z
}
```
How it works. Variable `args` is array of two elements (operands).
The `every` method calls callback on each element in the array until callback returns
[falsy](https://developer.mozilla.org/en-US/docs/Glossary/Falsy) value. Let’s take a look at the callback function.

```javascript
k => (z = k, k)
```
We put current element in `z`, and return it.
If the callback returns false value for the first operand `every` stops and function
returns the first operand.
If not, it continues for the second operand and returns it.

Similar code for OR function, but with `some`. `some` stops when the callback returns
truthy value.

```javascript
const or = (...args) => {
  let z;
  args.some(k => (z = k, k));
  return z;
}
```

I didn't find  nice functional way to obtain similar behavior.
But I swear before the god of functionality it is the last time I use `return` or `let`.

## Conditional

Javascript has a handy ternary `? :` operator for branching.
You can replace it with `a && b || c` trick.
We can implement it with function.

```javascript
const tern = (x, k, j) => or(and(x, k), j)
```

**Notice**. The difference between this function and `a && b || c` expression
is that in the function all the arguments will be evaluated before function call,
but in the expression `c` evaluation can be skipped if `a && b` is truthy.
This issue can be avoided by using function (and we love functions).

## The Datum

For holy functional programming we need immutable functional data Grail.
I offer you a **pair**. Pair contains two elements: the **head** and the **tail**.
And, of course, `pair` is function:

```javascript
const pair = (a, b) => x => tern(x, a, b);
```

This function creates clojure with arguments and returns new function,
that can be used to obtain values (head and tail) from the pair.

```javascript
const head = x => x(true)
const tail = x => x()
```

We can use it this way

```javascript
const numbers = pair(1, 2)
head(numbers) // => 1
tail(numbers) // => 2
```

Empty pair is the pair which has falsy elements.

```javascript
const empty = p => and(!head(p), !tail(p))
```

**Notice**. This doesn't work with falsy values properly.
I choose this for simplicity.

The most interesting part: we can create lists based on `pair`.
List is the pair which head is the first value and the second element is the pair which
head is the second element and so on.

This code represents a list with range from 1 to 3. Empty pair shows the end of the list.

```javascript
pair(1, pair(2, pair(3, pair())))
```

We need helper for creating ranges of numbers.

```javascript
const range = (min, max) => tern(min < max,
                                 () => pair(min, range(min + 1, max)),
                                 () => pair())
                            ()
```

**Notice**. In `tern` I use function and then what `tern` returns.
This prevent evaluation of the third argument if the first if it truthy.

**FYI**. Pairs can also  be used for building trees.

## List iteration

The Simplest function for a list is the `each`. It takes the elements one by one and call `fn` with it.

```javascript
const each = (x, fn) => tern(empty(x),
                             () => pair(),
                             () => (fn(head(x)),
                                    each(tail(x), fn)))
                        ()
```

`map` function is also one of the most used tools in our programs.


```javascript
const map = (x, fn) => tern(empty(x),
                            () => x,
                            () => pair(fn(head(x)),
                                       map(tail(x), fn)))
                       ()
```

What we do when we accumulated value from the list? We use `reduce`!

```javascript
const reduce = (x, fn, i) =>
  tern(empty(x),
       () => i,
       () => tern(tail(x),
                  reduce(tail(x),
                         fn,
                         fn(i, head(x))),
                  head(x)))
  ()
```

And of course we want to filter output.

```javascript
const filter = (x, fn) => tern(empty(x),
                               () => x,
                               () => tern(fn(head(x)),
                                          () => pair(head(x), filter(tail(x), fn)),
                                          () => filter(tail(x), fn))
                                     ())
                          ()
```

Or maybe reverse whole list

```javascript
const reverse = x => reduce(x, (a, d) => pair(d, a), pair());
```

Finally it will be nice to have `toString` and `print` functions.

```javascript
const toString = x => '<' + reduce(tail(x), (a, b) => a + ', ' + b, head(x)) + '>'
const print = x => console.log(toString(x))
```

## Check it

```javascript
const sum = (a, x) => a + x;
const even = x => x % 2 === 0
const odd = x => x % 2 !== 0
print(range(1, 10))                    // <1, 2, 3, 4, 5, 6, 7, 8, 9>
print(filter(range(1, 10), odd))       // <1, 3, 5, 7, 9>
print(filter(range(1, 10), even))      // <2, 4, 6, 8>
print(map(range(1, 10), x => x*2))     // <2, 4, 6, 8, 10, 12, 14, 16, 18>
print(reverse(range(1, 10)))           // <9, 8, 7, 6, 5, 4, 3, 2, 1>
```

## Conclusion

Function is a powerful tool that can do anything you want in your code.
With functional programming, your code becomes more readable, has less errors
and is easy to maintain. Your product  gathers more money. Your open source library
collects more start on github.

## Real conclusion

Functions is a powerful tool that complements other language features.
Functional programming has advantages and disadvantages as any other
paradigm. Use any tool properly with reason and you'll achieve more.
And, please, **don't use the code from this post in production**.


