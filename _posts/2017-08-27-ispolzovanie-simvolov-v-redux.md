---
layout: post
title:  "Использование символов в Redux"
ref: "redux-symbols"
lang: "ru"
published: true
description: "Использование символов (Symbol) в Redux для сохранения метаинформации."
excerpt: ""
---

> There are only two hard things in Computer Science: cache invalidation and naming things.
>
> _-- Phil Karlton_

В случае фронтенда, инвалидация кеша не такая большая проблема.
Всегда можно запросить актуальные данные у сервера. Однако не всегда выгодно гонять
по сети данные, которые уже есть на стороне клиента. И тогда нужно понимать, являются ли
эти данные актуальными.

К тому же бывают случаи, когда данные могут трактоваться
как актуальные в зависимости от контекста. Например: список популярных постов в блоге
может содержать элементы, которые в кеше уже несколько часов. А при переходе на страницу
конкретного поста актуальными можно считать только новые данные.

## Приложение

Рассмотрим пример, состоящий из двух страниц: списка постов и страницы с отдельным постом.

### Структура данных

Каждый пост представляет собой объект вида

```javascript
{id: 1, title: 'Songs recorded by Madonna'}
```

Взаимодействие с сервером завернуто в API, который имеет два метода

* `getPosts()` — возвращает промис с массивом постов
* `getPost(id)` — возвращает промис с одним постом с указанным ID

### Action creators

Код достаточно простой и генерирует только два типа экшенов: получения списка
от сервера и получение одного поста.

```javascript
import api from '../api'
import { POSTS_LOADED, POST_LOADED } from '../constants/ActionTypes';

// Загрузить список постов
export function loadPostsList() {
  return dispatch => {
    api.getPosts()
    .then(posts => {
       dispatch({type: POSTS_LOADED, posts})
    })
  }
}

// Загрузить один пост
export function loadPost(id) {
  return dispatch => {
    api.getPost(id)
    .then(post => {
       dispatch({type: POST_LOADED, post})
    })
  }
}
```

### Стейт

Редьюсер, который обрабатывает экшены, весьма прост. Обратите внимание, что
посты хранятся не в массиве, а в объекте. Ключами объекта выступают ID постов,
а значениями — сами посты. Такой подход позволяет искать посты по ID быстрее — O(1).

```javascript
import { POSTS_LOADED, POST_LOADED } from '../constants/ActionTypes';

export default function counter(state = {}, action) {
  switch (action.type) {

    case POSTS_LOADED:
      // Конвертируем массив в объект с ключами-id
      return action.posts
        .reduce(
          (posts, post) => ({...posts, [post.id]: post}),
        {})
    case POST_LOADED:
      // Заменяем пост по ID
      return {
        ...state,
        [action.post.id]: action.post
      }
    default:
      return state;
  }
}
```

### Компонент списка

```javascript
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import {loadPostsList} from '../actions/posts'

// Удобнее иметь компонент для отрисовки каждой ссылки
const PostLink = ({post}) => <li>
  <Link to={`/posts/${post.id}`}>
    {post.title}
  </Link>
</li>

class App extends Component {
  componentDidMount() {
    // После появления компонента запрашиваем список
    this.props.loadPostsList()
  }

  render() {
    const {posts} = this.props

    // До того как посты загрузились показываем
    // сообщение о загрузке
    if (!posts.length) {
      return <b>Loading...</b>
    }

    return <ul>
      {posts.map(post => <PostLink post={post}/>)}
    </ul>
  }
}

export default connect(
  state => ({
    // Конвертируем обратно в массив для удобства
    posts: Object.values(state.posts)
  }),
  {loadPostsList}
)(App);
```

### Компонент отдельного поста

Компонент получает ID от роутера и отрисовывает соответствующий пост
или показывает заглушку, если поста нет.
Также, при первом появлении компонент запрашивает данные от сервера.
Если переход был со страницы со списком, то пост уже есть в стейте и будет
сразу показан, а после ответа от сервера компонент покажет свежую версию.

```javascript
import React, {Component} from 'react'
import {connect} from 'react-redux'
import {loadPost} from '../actions/posts'

class PostPage extends Component {
  componentDidMount() {
    // this.props.params — свойство, которое добавляет react-router
    // В зависимости от роутинга получение ID может отличаться
    this.props.loadPost(this.props.params.id)
  }
  render() {
    const {post} = this.props

    // Показываем заглушку, если поста нет
    if (!post) {
      return <b>Loading...</b>
    }

    return <div>
      <h1>{post.title}</h1>
    </div>
  }
}

export default connect((state, props) => ({
  post: state.posts[props.params.id]
}), {loadPost})(PostPage)
```

## Контроль свежести данных

Допустим, нам очень важно показывать пользователю свежую информацию. И на странице с постом
нам нужны данные, полученные не позднее, чем минуту назад (или любое другое время).

Если данные старые, то мы можем показать пользователю сообщение об этом, пока новые
данные в пути. Или вовсе показать заглушку.

## Реализация

Для подобного сценария нам необходимо где-то хранить информацию о времени, когда
пост был получен от сервера. Способов несколько.

### Отдельный стейт

Прямой и явный вариант: использовать отдельный объект в стейте, который отображает
ID поста в дату получения.

В таком случае у вас будет два отдельных места, которые
нужно держать синхронизированными. К тому же, каждый раз, когда вам будет необходима
информация о дате получения, вам придется ее прокидывать из компонента в компонент.

### Поле внутри элемента данных

Вторым вариантом будет добавлять дату прямо в посты отдельным полем. Например, так:

```javascript
export default function counter(state = {}, action) {
  switch (action.type) {
    case POSTS_LOADED:
      return action.posts
        .reduce(
          (posts, post) => ({
            ...posts,
            [post.id]: {
              ...post,
              updatedAt: new Date()
            },
          }),
        {})
    case POST_LOADED:
      return {
        ...state,
        [action.post.id]: {
          ...action.post,
          updatedAt: new Date()
        }
      }
    default:
      return state;
  }
}
```

В таком случае всегда можно легко получить информацию о дате получения поста.
Но возникают другие трудности.

* **Перезапись поля**. Данные от сервера уже могут содержать такое поле, и мы его
  перезапишем. Это можно решить созданием уникального имени, но выглядеть будет странно.
* **Поле будет использовано при итерации**. Если вы хотите вывести все поля в таблице
  с помощью `Object.key`, то это служебное поле там тоже появится.

### WeakMap

[WeakMap][weakmap]{:target="_blank"} позволяет хранить связь между объектом и набором данных (любого типа).
При этом наличие этой связи никак не останавливает сборщик мусора от уничтожения
объекта (при условии, что других ссылок на него нет).

Таким образом, мы можем создать отдельный модуль, в котором будем хранить информацию
о последнем обновлении. А в качестве API выведем наружу пару методов.

```javascript
const updatedMap = new WeakMap()

export function saveUpdatedAt(item) {
  updatedMap.set(item, new Date())
}

// Вернет возраст объекта в миллисекундах
export function getAge(item) {
  return Date.now() - updatedMap.get(item)
}
```

Этот способ плох тем, что при копировании объекта ссылка будет потеряна.
То есть

```javascript
const object = {field: 'yip yip'}

saveUpdatedAt(object)

const copy = {...object}

getAge(copy) // не имеет смысла
```

### Символ (Symbol)

Я же хочу рассказать о способе, который использует одну из новых (относительно)
возможностей языка — [символы][symbol]{:target="_blank"}.

По своей сути этот способ похож на описанный выше способ с полем внутри объекта. Но
ключем поля является не строка, а уникальный символ.

```javascript
const updatedAtKey = Symbol()

export default function counter(state = {}, action) {
  switch (action.type) {
    case POSTS_LOADED:
      return action.posts
        .reduce(
          (posts, post) => ({
            ...posts,
            [post.id]: {
              ...post,
              [updatedAtKey]: new Date()
            },
          }),
        {})
    case POST_LOADED:
      return {
        ...state,
        [action.post.id]: {
          ...action.post,
          [updatedAtKey]: new Date()
        }
      }
    default:
      return state;
  }
}
```

Так мы избавимся от двух проблем, описанных выше. Для того, чтобы получить дату
обновления, компонент должен иметь ссылку на символ.

```javascript
const updatedAt = post[updatedAtKey]
```

Хорошей идеей будет спрятать эту мета-информацию в отдельном модуле и не давать
ни компоненту, ни редьюсеру работать с этим полем напрямую.

```javascript
// meta.js

const updatedAtKey = Symbol()

// Вернет копию объекта + поле с датой
export function withUpdatedAt(item) {
  return {
    ...item,
    [updatedAtKey]: new Date()
  }
}

// Вернет возраст объекта в миллисекундах
export function getAge(item) {
  return Date.now() - item[updatedAtKey]
}
```

Тогда редьюсер будет выглядеть так:

```javascript
export default function counter(state = [], action) {
  switch (action.type) {
    case POSTS_LOADED:
      return action.posts
        .reduce(
          (posts, post) => ({...posts, [post.id]: withUpdatedAt(post)}),
        {})
    case POST_LOADED:
      return {
        ...state,
        [action.post.id]: withUpdatedAt(action.post)
      }
    default:
      return state;
  }
}
```

А компонент так:

```javascript
class PostPage extends Component {
  //...

  render() {
    const {post} = this.props

    if (!post) {
      return <b>Loading...</b>
    }

    const isFresh = getAge(post) < 5000

    return <div>
      <h1>{post.title}</h1>
      {isFresh || <i>Данные могли устареть. Идет обновление...</i> }
    </div>
  }
}
```

## Особенности работы с символами

Как любой неявный подход, работа с мета-информацией всегда несет опасности неявных
ошибок. Так, например, ошибки могут возникнуть при копировании объекта.
Если вы используете [spread оператор][spread]{:target="_blank"}, то символы будут скопированы:

```javascript
const key = Symbol()
const source = {
  regularField: 'hello',
  [key]: 'world'
}

const target = {...source}

console.log(target.regularField + ' '+ target[key]) // hello world
```

Однако, при использовании библиотек для копирования поля с символами могут быть потеряны.

Еще одна опасность: такие поля будут потеряны при сериализации в JSON.

## Другие языка

OCaml позволяет создавать обертки над данными:

```ocaml
type user = {
  id: int;
  name: string;
}
type timestamp = int
type 'a entity =
  | Empty
  | Loading of 'a
  | InState of 'a * timestamp

let user =
  InState ({ id = 123; name = "Zohan" }, 1504470691)
```

## Заключение

Описанный пример — лишь частный случай использования символов как ключи для мета-данных.
Поле с временем обновления можно использовать, например, в экшенах, чтобы налету
определять делать ли запрос на сервер за новыми данными или старые актуальны.

Символы представляют собой мощный, а потому опасный инструмент. Используя их для
хранения данных, вы должны точно понимать, что делаете, а код желательно писать так,
чтобы от потери символа программа не ломалась.


[weakmap]: https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/WeakMap "WeakMap"
[symbol]: https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Symbol "Symbol"
[spread]: https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Operators/Spread_operator "Spread operator"
