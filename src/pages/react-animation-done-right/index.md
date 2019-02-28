---
title:  "React animation done right"
date: '2017-09-08'
description: "Create performant React animation with Web Animations API"
---

_TL;DR use Web Animation API. Works only in Chrome, FF_

There are some ways to animate DOM elements.
The most old is the [jQuery .animate()][jquery]. Back in time it gave
web-developers the holy grail: nice API and perfect browser support.

```javascript
$("#book").animate({
  opacity: 0.25,
  left: "+=50",
  height: "toggle"
}, 5000, function() {
  // Animation completed
});
```

The animation is calculated in JS, which is both a plus (cross-browser) and a
significant disadvantage regarding performance. Any complex animation started
to slow down on a weak processor.

There are other libraries that use JS for DOM elements animations. Pros and cons
are the same.

## CSS to the rescue

It was obvious that a way was needed to enable the creation of performant
animation, which could be accelerated by hardware. That's why specification
[css3-animations][css3-animations] was created.

The main difference was the declarative syntax based on CSS, which could
describe the behavior of the elements. There are many advantages to this method.
The main one is the  support for hardware acceleration for obtaining 60 fps
for animations. The downside is that it's extremely inconvenient to use such
animations from JS.

For example, to do something after the end of the animation, you have to listen
the `animationend` and` webkitAnimationEnd` events on the element.

## React way

From the very beginning, the developers of React suggested the way to animate components
by setting the CSS classes to elements. And to handle addition and removal of
elements they event created [addon][addon], which looks totally weird.

Here is an example from the official documentation:

```html
<ReactCSSTransitionGroup
    transitionName="example"
    transitionEnterTimeout={500}
    transitionLeaveTimeout={300}>
    {items}
</ReactCSSTransitionGroup>
```

In addition to the component, you need to describe CSS:

```css
.example-enter {
  opacity: 0.01;
}

.example-enter.example-enter-active {
  opacity: 1;
  transition: opacity 500ms ease-in;
}

.example-leave {
  opacity: 1;
}

.example-leave.example-leave-active {
  opacity: 0.01;
  transition: opacity 300ms ease-in;
}
```

There are different kinds of libraries that work similarly.

## Web Animations API

Blink based browsers and Firefox already have the support for a new way to animate
In Blink based browsers (Chrome, Opera, etc.) and in Firefox there is already
elements —  [Web Animations API][spec].

The component code can be:

```javascript
const style = {
  background: '#f49',
  width: '100px',
  height: '100px',
  margin: '50px auto',
  color: 'white'
}

class Animated extends React.Component {
  run() {
    this.el.animate([
      { transform: 'scale(1)' },
      { transform: 'scale(1.3)' },
      { transform: 'scale(1)' }
    ], {
        duration: 400,
        iterations: 3
      })
  }

  render() {
    return <div onClick={this.run.bind(this)} ref={e => this.el = e} style={style}>
      Click me!
    </div>
  }
}
```

[Live example][example].

In addition, to the declarative description of the animation, the execution time
and the number of repetitions, you can specify the start delay, the type of
animation, and other properties, which can be specified in CSS.

`Element.animate` returns an object of the type [Animation][Animation]. Which can
be used to:

* Subscribe to animation finish (with Promise)

  ```javascript
  const animation = element.animate(keyframes, options)
  animation.finished.then(() => {
    console.log('Done!')
  })
  ```

* Cancel animation
  ```javascript
  animation.cancel()
  ```

* Or event play it reversed
  ```javascript
  animation.reverse()
  ```

* Other cool stuff


## Conclusion


Web animations API are a powerful animation management tool for JavaScript.
It is extremely useful in the React components.

Unfortunately, given the support of browsers, it is impossible to use this method
in production in most cases. However, if you are lucky and need to support only
Chrome and FF, then `Element.animate` can be a good helper.


[jquery]: http://api.jquery.com/animate/ "jQuery .animate()"
[css3-animations]: https://www.w3.org/TR/css3-animations/ "CSS3 animation"
[addon]: https://facebook.github.io/react/docs/animation.html "React Animation Add-Ons"
[spec]: https://w3c.github.io/web-animations/ "Web animations API spec"
[example]: https://codesandbox.io/s/4z1768j30x "Пример"
[Animation]: https://developer.mozilla.org/en-US/docs/Web/API/Animation "Animation"
