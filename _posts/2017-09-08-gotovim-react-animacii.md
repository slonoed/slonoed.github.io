---
layout: post
title:  "Готовим React анимации"
ref: "react-animation"
lang: "ru"
published: true
description: "Создаем производительные анимации на чистом JavaScript с помощью Web Animations API"
excerpt: ""
---

_TL;DR используется Web Animation API. Работает только в Chrome, FF_

В вебе есть несколько способов анимировать DOM элементы.
Самый старый из них — [jQuery .animate()][jquery] в свое врем был спасением для
веб-разработчиков. Он давал удобный API, и его можно было использовать в
большинстве браузеров. А главное, что у каждой анимации был коллбек, который
вызывался по окончанию:

```javascript
$("#book").animate({
  opacity: 0.25,
  left: "+=50",
  height: "toggle"
}, 5000, function() {
  // Анимация завершена
});
```

Расчет анимации производился в JS, что было как плюсом (кроссбраузерность),
так и существенным минусом в плане производительности. Любая сложная анимация
начинала тормозить на слабом процессоре.

Существуют и другие библиотеки использующие JS для анимации DOM элементов.
Плюсы и минусы у них точно такие же.

## CSS в помощь

Было очевидно, что нужен способ дать возможность создавать производительные
анимации, которые смогли бы использовать не только браузер но и железо. И появилась
спецификация [css3-animations][css3-animations].

Основным отличием стал декларативный синтаксис на базе CSS, которым можно
описывать поведение элементов. Плюсов у такого способа довольно много.
Главным можно назвать поддержку аппаратного ускорения для получения 60 кадров в
секунду для анимаций.
Минус же заключается в том, что использовать такие анимации из JS крайне неудобно.

Например, для того, чтобы среагировать на окончание анимации нужно слушать
события `animationend` и `webkitAnimationEnd`.

## React way

С самого начала разработчики React предложили способ анимировать компоненты
при помощи установки CSS классов на элементы. А для правильно обработки
удаления и добавления компонентов даже нагородили [аддон][addon], который
выглядит совершенно странно.

Вот пример из официальной документации:

```html
<ReactCSSTransitionGroup
    transitionName="example"
    transitionEnterTimeout={500}
    transitionLeaveTimeout={300}>
    {items}
</ReactCSSTransitionGroup>
```

В добавок к компоненту вам нужно описать CSS:

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

Есть разного вида библиотеки, которые работают схожим образом.

## Web Animations API

В браузерах на основе Blink (Chrome, Opera, и другие), а так же в Firefox
уже есть поддержка нового способа анимировать элементы — [Web Animations API][spec].
По сути это JavaScript API для доступа к CSS анимации.

Код компонента может быть таким:

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

[Живой пример][example].

Помимо декларативного описания анимации, времени выполнения, количества повторов,
можно указать задержку старта, тип анимации и прочее, что можно указывать в CSS.

`Element.animate` возвращает объект типа [Animation][Animation]. С его помощью
можно:

* Подписаться на окончание анимации

  ```javascript
  const animation = element.animate(keyframes, options)
  animation.finished.then(() => {
    console.log('Done!')
  })
  ```

* Отменить анимацию
  ```javascript
  animation.cancel()
  ```

* Или даже запустить в обратном направлении
  ```javascript
  animation.reverse()
  ```

* И многое другое


## Заключение

Web animations API предоставляют действительно мощный механизм управления
анимациями из JS кода. Их крайне удобно использовать в коде React компонентов.

К сожалению, учитывая поддержку браузерами, использовать в продакшене этот способ
в большинстве случаев нельзя. Но если вам повезло и нужно поддерживать только
Chrome и FF, то `Element.animate` может стать хорошим помощником.


[jquery]: http://api.jquery.com/animate/ "jQuery .animate()"
[css3-animations]: https://www.w3.org/TR/css3-animations/ "CSS3 animation"
[addon]: https://facebook.github.io/react/docs/animation.html "React Animation Add-Ons"
[spec]: https://w3c.github.io/web-animations/ "Web animations API spec"
[example]: https://codesandbox.io/s/4z1768j30x "Пример"
[Animation]: https://developer.mozilla.org/en-US/docs/Web/API/Animation "Animation"
