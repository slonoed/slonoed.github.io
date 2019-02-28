---
title:  "Redux in clojurescript with rum"
date: '2017-01-20'
---

Keeping consistent code in your app is hard task. Keeping consistent code in your team's app even harder. People love redux for two features:
Firstly, it is simple. If you don't use some weird libraries redux is about one object and few functions.
Secondly, it provides strict understanding where the things should be. You have one place for state, one place for changing state (well, really you have bunch of reducers) and place for async logic (action creators).
Other features like hot reload, state history, one way data flow you get for free.

I want to show you how to achieve same profits with clojurescript and run library, using native language constructions and stdlib methods.

This post targets developers who already familiar with react, clojure and figwheel. If you are not, check these links

* [Clojure for the Brave and True](http://www.braveclojure.com/) – nice book for one who wants to start with clojure
* [clojuredocs.org](http://clojuredocs.org/) – online docs with examples and comments
* [Clojurescript koans](http://clojurescriptkoans.com/) – fun way to learn clojurescript
* [Reactjs](https://facebook.github.io/react/) – docs and tutorials
* [How to Create ClojureScript App](https://medium.com/@roman01la/how-to-create-clojurescript-app-4e38778c4762)

I use the [rum library](https://github.com/tonsky/rum) as wrapper for react, but these ideas can works with any view framework/library.
I suppose you have already installed [lein](https://leiningen.org/#install).
Also I recommend to install [rlwrap](https://github.com/hanslub42/rlwrap) for better experience. It can be done on OSX by `brew install rlwrap`.

## Concept
This scheme represents dataflow in application.
![Dataflow][1]
We have few entities here.

* **State** – single atom of data. Keeps all app state not only data, but also UI state
* **Actions channel** – [core.async](https://clojure.github.io/core.async/) channel. Pass actions one by one to transform
* **Transform** – function that receives action, states value and returns new states value. This function is **synchronous**
* **UI** – can be DOM, React, Canvas etc.
* Other sources of actions. For example: timers, global handlers. If you use [sente](https://github.com/ptaoussanis/sente) you can map and pipe it values to action channel.

Rules is simple. If you want to change state you should dispatch an action. Action represents intention of changing data but doesn't guarantee changing. Transform function always sync. It receives state and action and should return new state. If something should be done async transform **should dispatch new action**. That's all. You always know when things happen and you always know where to put new code.

I don't use separate action creators. If you need complex request or data processing before dispatch action – it is just regular function.

I don't use any complex flows like [redux-saga](https://github.com/redux-saga/redux-saga). The problem they want to solve is to keep async operations in one place. It can be achieved with `<!` macro in clojurescript.

## Create project
In shell run

```bash
lein new figwheel redux
cd redux
```

Project structure

```
.
├── README.md
├── dev
│   └── user.clj
├── project.clj
├── resources
│   └── public
│       ├── css
│       │   └── style.css
│       └── index.html
└── src
    └── redux
            └── core.cljs
```

Open `project.clj` file. Add rum to dependencies. Not it should looks like

```clojure
:dependencies [[org.clojure/clojure "1.8.0"]
               [org.clojure/clojurescript "1.9.229"]
               [org.clojure/core.async "0.2.391"
                :exclusions [org.clojure/tools.reader]]
               [rum "0.10.8"]]
```

Run `rlwrap lein figwheel` or `lein figwheel` for installing dependencies and repl session.
Open [http://localhost:3449/index.html](http://localhost:3449/index.html). You should see simple html template from server. Now we ready for coding.

## Coding part (best part)
We keep `resources/public/index.html` untouched

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="css/style.css" rel="stylesheet" type="text/css">
  </head>
  <body>
    <div id="app">
      <h2>Figwheel template</h2>
      <p>Checkout your developer console.</p>
    </div>
    <script src="js/compiled/redux.js" type="text/javascript"></script>
  </body>
</html>
```

Create file `src/redux/flow.cljs` and fill it with

```clojure
(ns redux.flow
  (:require [cljs.core.async :as a])
  (:require-macros [cljs.core.async.macros :refer [go go-loop]]))

(defonce state (atom {:name "World"}))
(defonce actions (a/chan))

;; Components call this function to request state changing.
(defn dispatch
  "Dispatch new action. Type should be keyword."
  ([type] (dispatch type nil))
  ([type data]
   (a/put! actions [type data])))

;; All state changes should be done via this method.
(defmulti transform
  "Transform state by action. Return updated state."
  (fn [state data dispatch action-type] action-type))

;; Start actions pipeline
(go-loop []
         (when-let [a (a/<! actions)]
           (let [[type data] a]
             (println "Handle action" type)
             (swap! state transform data dispatch type))
          (recur)))
```

As you can see we define state and actions channel with `defonce` – it helps to keep data between code reloads.
`go-loop` is used to receive actions from channel.
Notice than we have `transform` multimethod, but we don't have any implementation. We will add them latter.

Create `src/redux/components.cljs`

```clojure
(ns redux.components
  (:require [rum.core :as r]
            [clojure.string :as str]
            [redux.flow :refer [dispatch]]))

(r/defc +form
  [state]
  [:.app
   [:h1 (str "Hello, " (:name state))]
   [:input {:value (:name state)
            :on-change #(dispatch :change-name (.. % -target -value))}]])

(r/defc +app < r/reactive
  [state-atom]
  (+form (r/react state-atom)))
```
It renders header and input with name from the state. Notice `on-change` handler. It doesn't change the state directly (and it can't do because state map is immutable). Instead of it calls dispatch.

Sometimes you don't want to pass state through the components tree. In this case you can use `redux.flow/state` directly, but don't change it. For a big codebase you can add getter.

Last part is the `src/redux/core.cljs` file. It ties all things together and provides start point plus some dev tools.

```clojure
(ns redux.core
  (:require [redux.components :as components]
            [redux.flow :as flow]
            [rum.core :as rum]))

(enable-console-print!)

;; Attach react tree to DOM
(rum/mount (components/+app flow/state)
           (js/document.getElementById "app"))

;; Dev helper. It touches state when code reloaded to start rerender.
(defn on-js-reload []
  (swap! flow/state update-in [:__figwheel_counter] inc))
```

Last thing we need is transform for `:change-name` action. Add this code to the bottom of `src/redux/flow.cljs`

```clojure
(defmethod transform :change-name
  [state value]
  ;; State here is map, not atom!
  (assoc state :name value))
```

All state changes should live in methods like this one.

## Summary
This data workflow is simple enough and any developer can start write nice code after few hours of reading project. Downside is boilerplate code you need to write sometimes. But it easy to write helpers for these stuff leave flow itself untouched.

Next good part: this flow plays well with [server render](http://slonoed.net/clojure-render-react).

In the next post I'll show how to include async requests and channels into this flow.

You can find source code in [my github](https://github.com/slonoed/blog-redux-in-closurescript-with-rum).

[1]: ./flow.png "flow"
