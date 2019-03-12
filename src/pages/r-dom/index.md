---
title: Intro to r-dom library
date: '2019-03-10'
description: Introduction to r-dom library which allows you to write ReactJS components without JSX.
---
[r-dom][r-dom] — is a tiny wrapper around `React.createElement` function, which allows you to write React components without JSX.

I'm using this library for more than a year in one of my projects and want to share why I like it.

---

The library itself is a very tiny (96 lines) wrapper around `React.createElement` plus few handy features. It doesn't change the way you structure your application. You can even mix it with JSX and can (probably you shouldn't). This is how you use it:

## Usage

I will show how to use this library. If you already familiar with JSX it not something
different.

For simple tags you can use form `r[tag]([properties], [children])`

```jsx
r.span(Hello)
// same as
<span>hello</span>
```

Use an array to pass few children

```jsx
r.span(['Hello, ', name])
// same as
<span>Hello, {name}</span>
```

Pass props as a first argument

```jsx
r.a({href: '/page'}, 'home')
// same as
<a href="/page">home</a>
```

Components use form `r(Component, [properties], [children])`

```jsx
r(Alert, 'Danger!')
// same as
<Alert>Danger!</Alert>
```

## Why not JSX?

**Probably you should use JSX for your React project. It is a standard solution and used in documentation, tutorials, open source projects.**

## Why to use r-dom

When ReactJS only started to gain popularity, there were many debates around using JSX with different arguments.

I don't want to raise these arguments again and instead share why I'm using plain JS syntax for ReactJS components and benefits it could bring.

### JavaScript

Many benefits of using this library come from the benefits of using JS.

When you use JS syntax, you have all kind of editor support, snippets, and flexibility of JS code.

*Editor support can be considered the minor thing, because of modern IDE, like Webstorm, have a very robust set of tools for working with JSX.*

### No language mixing

This one is very opinionated. I found that switching between two completely syntaxes is unnecessary complexity.

```jsx
r.div(
  {style: {color: 'red'}},
  users.map(user => r.span({key: user.id}, user.name))
)

// same as

<div style={{color: 'red'}}>
  {users.map(user => <span key={user.id)>{user.name}</span>}
</div>
```

### No trailing space problem

You have to remember to add explicit whitespace between inline elements in JSX.

```jsx
r.div([
  r.a('first),
  ' ',
  r.a('second')
])

// same as

<div>
    <a>first</a>{' '}
    <a>second</a>
</div>
```

### Using shorthand property names

```jsx

r(Alert, {type}, 'Danger!')

// same as

<Alert type={type}>Danger!</Alert>
```

### Conditional rendering feature

This is **my favorite feature** of the library. It allows skipping component rendering by setting special `isRendering` property to `false`. In many cases, this makes code much more readable.

```jsx
r.div(
  r.span({isRendered: user.credits < 0}, 'You have no credits')
)

// same as

<div>
  {user.credits < 0 && <span>You have no credits</span>}
</div>
```

### Comments

*No comments on this*

```jsx
r.div([
  r.label('User email'),
  // Nice oneline comment
  r.input({type: 'email'})
])

// same as

<div>
  <label>User email</label>
  {/* Ugly bastard */}
  <input type="email"/>
</div>
```

### Don't need to maintain a closing tag

If you need to change component for this element, you have to do it in two places.

```jsx
<Component>
  A long list of components here
<Component>
```

In r-dom you need to change it ones.

```jsx
r(Component, [
  'A long list of components here'
])
```

I also find annoying switching from `<Component/>` to `<Component></Children>` when I need to add children because Prettier is always trying to collapse tags without children.

*Closing tag problem could be mitigated with good IDE support.*

### classSet feature

r-dom has build-in support for [classnames](https://www.npmjs.com/package/classnames) library.

```jsx
r.div(
  {
    classSet: {
      alert: credints < 0,
    }
  },
  ['You have ', credits, ' credits']
)
```

I'm not using this feature often, because CSS-in-JS, but I see a massive benefit for using it with libraries like bootstrap.

## Bonus: ugly part

One thing that I suffer from is when r-dom use children object as props.

```jsx
function Component() {
  const text = r.strong('Boo!')
  return r.div(text) // text looks like props object for r-dom
}
```

In this code `text` is a React element, but the library treats it as properties object. Wrapping in the array helps.

```jsx
function Component() {
  const text = r.strong('Boo!')
  return r.div([text]) // works!
}
```

## </Conclusion>

I started to use r-dom when I got a legacy project with it. Uncomfortable at first it became one of my favorite tools for React projects. I also see how other people started to like it over time. My next project, which I will do for myself I will be writing with r-dom.

[r-dom]: https://github.com/uber/r-dom
