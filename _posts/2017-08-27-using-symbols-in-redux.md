---
layout: post
title:  "Using symbols in Redux"
ref: "redux-symbols"
lang: "en"
published: true
description: "Using symbols in Redux as metadata for storage items."
excerpt: ""
---

> There are only two hard things in Computer Science: cache invalidation and naming things.
>
> _-- Phil Karlton_

When doing frontend cache invalidation, there is not such a huge problem. You can always
ask a server for fresh data. However, it is not always good to pass data via
a network, when a client already has this data. The only thing you need to check
is this information relevant.

Besides some cases require knowledge about data status and depend on context.
Example: a list of popular blog posts can contain the elements which have already been in a cache
for few hours. However, when you visit post page, you need to fresh the data.

## Application

Let's take a look at two pages: the list of articles page and the article page.

### Data structure

Each article is an object.

```javascript
{id: 1, title: 'Songs recorded by Madonna'}
```

All server interaction are wrapped into API with two methods:

* `getPosts()` — returns a Promise with array of articles
* `getPost(id)` — returns a Promise with the article by ID

### Action creators

The code is pretty simple and generates only two types of actions: receiving
a list and receiving an article.

```javascript
import api from '../api'
import { POSTS_LOADED, POST_LOADED } from '../constants/ActionTypes';

// Load all articles
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

### State

The reducer code is also simple. Notice that articles are stored in object
instead of array. Keys in the object are IDs of articles. This normalized
way allows fast search — O(1).

```javascript
import { POSTS_LOADED, POST_LOADED } from '../constants/ActionTypes';

export default function counter(state = {}, action) {
  switch (action.type) {

    case POSTS_LOADED:
      // Convert array to object with keys-ids
      return action.posts
        .reduce(
          (posts, post) => ({...posts, [post.id]: post}),
        {})
    case POST_LOADED:
      // Replace article by ID
      return {
        ...state,
        [action.post.id]: action.post
      }
    default:
      return state;
  }
}
```

### List component

```javascript
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import {loadPostsList} from '../actions/posts'

const PostLink = ({post}) => <li>
  <Link to={`/posts/${post.id}`}>
    {post.title}
  </Link>
</li>

class App extends Component {
  componentDidMount() {
    // After mounting load all articles
    this.props.loadPostsList()
  }

  render() {
    const {posts} = this.props

    // Until articles loaded — show preloader
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
    posts: Object.values(state.posts)
  }),
  {loadPostsList}
)(App);
```

### Article component

The component receives  ID from a router and renders the corresponding article
or shows preloader if the article is not in the state.

When component appears, it fetches data from the server.  If the article is
already in the state, the component renders it, and after new data arrives,
the component shows a fresh version.

```javascript
import React, {Component} from 'react'
import {connect} from 'react-redux'
import {loadPost} from '../actions/posts'

class PostPage extends Component {
  componentDidMount() {
    // this.props.params from react-router
    // Depends on routing system the process of getting ID can be
    // different
    this.props.loadPost(this.props.params.id)
  }
  render() {
    const {post} = this.props

    // Show preloader if no article in state
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

## Checking cache

Assume we want to show only reliable info. On the article page we want to show data 
received one minute ago or later.

If data is old, we can notify a user about it while fetching update. Alternatively,
to show preloader.

## Implementation

For this requirement, we need to store info about time the datum was fetched
from the server.
There are few options for that.

### Separate state

The most obvious and straightforward variant is to keep this timestamp in the separate state object. It can be just map (ID -> Date).

In this case, you have two places with a coupled state which you need to synchronize. Also each time you need timestamp you have to pass it through props.

### Field inside data item

Another way to store timestamp is to store it inside the article.

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

You can always retrieve a timestamp from the article. However, it leads to
some issues:

* **Overwriting the field**. You have to avoid this field in server data
* **Field appears in iteration**. If you use `Object.keys` (ie for showing all
fields in table) you also show this field.

### WeakMap

[WeakMap][weakmap]{:target="_blank"} allows you to store link from one object (data entity) 
to another object (metadata). 
Moreover, GC removes metadata if entity is removed.

Thus we can create separate module which contains info about last update with API:

```javascript
const updatedMap = new WeakMap()

export function saveUpdatedAt(item) {
  updatedMap.set(item, new Date())
}

// Returns object age in milliseconds
export function getAge(item) {
  return Date.now() - updatedMap.get(item)
}
```

This method has a downside that you loose when copying the object.

```javascript
const object = {field: 'yip yip'}

saveUpdatedAt(object)

const copy = {...object}

getAge(copy) // doesn't make any sense
```

### Symbol

I want to talk about a way that uses one of the new features of language — 
[symbols][symbol]{:target="_blank"}.

It is similar to the approach with filed inside a object. However, instead of a string,
we use a Symbol for a key.

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

Using symbols, we remove both issues (naming collision and iteration). A
component needs to have the symbol for getting the value.

```javascript
const updatedAt = post[updatedAtKey]
```

It is a good idea to hide implementation details inside the module and prevent direct 
usage from the component or reducer.

```javascript
// meta.js

const updatedAtKey = Symbol()

// Returns object copy with timestamp field
export function withUpdatedAt(item) {
  return {
    ...item,
    [updatedAtKey]: new Date()
  }
}

// Return object age in milliseconds
export function getAge(item) {
  return Date.now() - item[updatedAtKey]
}
```

Now update the reducer:

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

And the component:

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
      {isFresh || <i>Data is obsolete. Updating...</i> }
    </div>
  }
}
```

## Symbols essentials

As any implicit approach, meta information can lead to implicit errors.
Example: while using [spread operator][spread]{:target="_blank"} symbol
keyed field is copied.

```javascript
const key = Symbol()
const source = {
  regularField: 'hello',
  [key]: 'world'
}

const target = {...source}

console.log(target.regularField + ' '+ target[key]) // hello world
```

However, if you use some library to clone an object, these fields can be lost.

Also, these fields would be omitted when serialized.

## Other languages

OCaml gives explicit way to define wrapper types for data.

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

## Conclusion

This usage is one of many for symbols-keys for metadata. Field with updated timestamp
can be used, for example, in cation creators to check whether a data entity needs an update 
from server or not.

Symbols give powerful and therefore dangerous instrument. If you decide to use them for storing data, you
need to understand clearly what you are doing and safely write code 
to keep program without errors even if you lost metadata.

[weakmap]: https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/WeakMap "WeakMap"
[symbol]: https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Symbol "Symbol"
[spread]: https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Operators/Spread_operator "Spread operator"
