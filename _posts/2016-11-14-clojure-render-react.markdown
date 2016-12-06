---
layout: post
title:  "Clojure render react"
published: true
excerpt: ""
---

## What is this about?
In this tutorial I'll show how to create simple web application with server render inside JVM and Reactjs on frontend. All code was written in clojure and clojurescript and shares UI code between backend and frontend.

I assume you already know something about clojure(script) and understand concept of reactjs. If not,  you may find this links helpfull.

* [Clojure for the Brave and True](http://www.braveclojure.com/) – nice book for one who wants to start with clojure
* [clojuredocs.org](http://clojuredocs.org/) – online docs with examples and comments
* [Clojurescript koans](http://clojurescriptkoans.com/) – fun way to learn clojurescript
* [Reactjs](https://facebook.github.io/react/) – docs and tutorials

I use OSX for coding. If you use defferent OS you migth need to change some commands. But code itself remains the same.

You can find some links inside the text. I suggest you'll read them briefly (I don't include info you can find in documentation).

## The idea
The app itself is very simple. It's a list of books. You can click on the book to open a detailed view. You can click the "Add book" button to open the modal with a form.

![App][app]

The most interesting is a server side render. When you click on add button URL changes to /add. When you click on book in list URL changes to /book_name. But nothing will be fetched from the server because of clientside render. However, when you reload the page with URL /add, the server renders all html **include visible form**. Why so overengineering? The key is speed. Your users don't have to to wait until all the JS code arrives at the browser. They can see page immediately. And they also don't have to wait the page reloading when they move across your app. Also, you can obtain nice bonuses like search engine availability.

## Prepare the stuff
Firstly, you need to [install Java](http://www.oracle.com/technetwork/java/javase/downloads/index.html).
Secondly, you need to [install lein tool](http://leiningen.org/). 

## Hello world
Inside you working directory call

```bash
lein new default books
cd books
```

Here is the structure of the project

```
.
├── CHANGELOG.md
├── LICENSE
├── README.md
├── doc
│   └── intro.md
├── project.clj
├── resources
├── src
│   └── books
│       └── core.clj
└── test
    └── books
        └── core_test.clj
```

Now start REPL

```
lein repl
```
And run these commands in REPL

```
(require 'books.core)
(book.core/foo "Best")
```
The output should be `Best Hello, World!`. 

## Sharpen tools
I prefer to write tools before coding. At first, add dependencies to **project.clj** file.

```clojure
(defproject books "0.1.0-SNAPSHOT"
  :description "Books list"
  :dependencies [[org.clojure/tools.namespace "0.3.0-alpha2"
                  :exclusions [org.clojure/tools.reader]]
                 [javax.servlet/servlet-api "2.5"]
                 [http-kit "2.2.0"]
                 [compojure "1.5.1"]
                 [org.clojure/clojure "1.9.0-alpha12"]
                 [rum "0.10.7" :exclusions [cljsjs/react cljsjs/react-dom]]
                 [cljsjs/react-dom "15.3.1-0" :exclusions [cljsjs/react]]
                 [cljsjs/react-dom-server "15.3.1-0" :exclusions [cljsjs/react]]
                 [cljsjs/react-with-addons "15.3.1-0"]
                 [org.clojure/clojurescript "1.9.229"]
                 [hiccup "1.0.5"]]
  :resource-paths ["resources"]
  :plugins [[lein-figwheel "0.5.7"]]
  :figwheel {:css-dirs ["resources/public/css"]}
  :cljsbuild {:builds [{:id "exchange"
                      :source-paths ["src/"]
                      :compiler {:main "books.client"
                                 :optimizations :none
                                 :asset-path "/public/js/out"
                                 :output-to "resources/public/js/books.js"
                                 :output-dir "resources/public/js/out"}}]})
```

When you start, REPL Leiningen automatically downloads the dependencies.

Clojure REPL has one annoying thing – it starts long. That's why we need the reloadable system. We will use separate namespace **user** to control our server in development. Just create file **./src/user.clj** with code

```clojure
(ns user
  (:use org.httpkit.server)
  (:require [books.core :as b]
            [clojure.tools.namespace.repl :refer [refresh]]))

(defonce server (atom nil))

(defn app [req]
    {:status  200
     :headers {"Content-Type" "text/html"}
     :body    "hello HTTP!"})

(defn go []
  (reset! server (run-server #'app {:port 8080})))

(defn reset
  []
  (when-not (nil? @server)
     (@server :timeout 100)
     (reset! server nil))
  (refresh :after 'user/go))

```

## Simple web server

 In your **core.clj** file add

```clojure
(ns books.core)

(defn app
  [req]
  {:status  200
   :headers {"Content-Type" "text/html"}
   :body    "hello HTTP!"})
```

Now start REPL and call `(reset)`. It should start web server on port 8080.

![Hello http browser image][hello_http]

From this point you can use code reload without restarting REPL. Try to change response body from hello HTTP! to hello clojure! and call `(reset)` inside REPL.

![Hello clojure browser image][hello_clojure]

## Routing
http-kit plays well with Compojure. We need few server routes.

* books list route
* book route
* add book form route
* add book route
* static files route
* not found route

```clojure
;; src/books/core.clj
(ns books.core
  (:use [compojure.route :only [files not-found]]
        [compojure.handler :only [site]]
        [compojure.core :only [defroutes GET POST DELETE ANY context]]
        org.httpkit.server))

; App route
(defn render
  [req]
  {:status  200
   :headers {"Content-Type" "text/html"}
   :body    "hello clojure!"})

(defn add-book
  [req]
  {:status 201})

(defroutes all-routes
  (GET "/" [] render)
  (GET "/:route" [] render)
  (POST "/" [] add-book)
  (files "/public/" {:root "resources/public"})
  (not-found "Page not found"))

(def app (site all-routes))
```

## Prepare fronted
Now we need to setup frontend part (javascript + css).
Create file `resources/public/css/books.css` and put some css there (I don't wont to cover css styling here, this part is up to you).
Now prepare page HTML with [hiccup](https://github.com/weavejester/hiccup). Add code to render method.

```clojure
(defn render
  [req]
  {:status  200
   :headers {"Content-Type" "text/html"}
   :body    (hiccup/html
              "<!doctype html>"
              [:html
               [:head
                [:link {:rel "stylesheet" :media "screen"
                        :href  "/public/css/books.css"}]]
               [:body
                [:div#application
                 "PLACE FOR GENERATED HTML"]
                [:script {:src "/public/js/books.js"}]
                [:script
                 "books.client.init()"]]])})
```

Then create file **src/books/client.cljs** (note file extension **cljs**) with content

```clojure
(ns books.client)

(defn init
  []
  (js/console.log "App ready"))
```

Now call `(reset)` in REPL and start **different** REPL for clojurescript build.
```
lein figwheel
```
If you reload browser you will see "App ready" message in browser console.
Сongratulations! Now we can write some code (:

## Books list
We will store all books is one vector (wrapped in atom). Each item is the vector with title, year, author. Place this code in `core.src` files after `ns` form.

```clojure
(defonce books (atom [["The Old Man and the Sea" 1952 "Ernest Hemingway"]
                      ["Hyperion" 1989 "Dan Simmons"]
                      ["The 7 Habits of Highly Effective People" 1989 "Stephen Covey"]]))
```

## Components and server render
A component can be taken from closure and closurescript. To achieve it we'll use [reader conditional](http://clojure.org/guides/reader_conditionals). In short: this language feature allows you to mark some code forms only for each or other language. Create file **src/books/components.cljc** (note **cljc** extension) with this code.

```clojure
(ns books.components
  (:require [rum.core :as r]))

(r/defc link [[title year author]]
  [:li {:key title}
   [:a {:href title} title]])

(r/defc books-list [books]
  [:.list
   [:ul
    (map link books)]
   [:a.btn {:href "/add"} "Add book"]])

(r/defc details [[title year author]]
  [:.details
   [:a {:href "/"} "List"]
   [:label "Title"] title
   [:label "Author"] author
   [:label "Year"] year])

(r/defc add-form []
  [:.modal
   [:form {:action "/" :method "POST"}
    [:input {:type "text" :name "title"  :placeholder "Title"}]
    [:input {:type "text" :name "author" :placeholder "Author"}]
    [:input {:type "text" :name "year"   :placeholder "Year"}]
    [:button.btn {:type "submit"} "Add"]
    [:a.btn {:href "/"} "Cancel"]]])

(r/defc app [{:keys [books route]}]
  [:.page
   ;; If route match any book title - show detailed view
   ;; else - show list
   (if-let [book (some #(when (= route (first %)) %) books)]
     (details book)
     (books-list books))
   ;; If route is "add" – render additional modal window with form
   (when (= route "add")
     (add-form))])
```

In **core.clj** use `rum.core/render-html` to render this component. And update code of `add-book` function. It should receive form data, write to books atom and redirect to list.

Updated code:

```clojure
(ns books.core
  (:require [hiccup.core :as hiccup]
            [rum.core :as r]
            [books.components :as c])
  (:use [compojure.route :only [files not-found]]
        [compojure.handler :only [site]]
        [compojure.core :only [defroutes GET POST DELETE ANY context]]
        org.httpkit.server))

(defonce books (atom [["The Old Man and the Sea" 1952 "Ernest Hemingway"]
                      ["Hyperion" 1989 "Dan Simmons"]
                      ["The 7 Habits of Highly Effective People" 1989 "Stephen Covey"]]))

(defn render
  [\{\{route :route} :route-params}]
  {:status  200
   :headers {"Content-Type" "text/html"}
   :body    (hiccup/html
              "<!doctype html>"
              [:html
               [:head
                [:meta {:charset "utf-8"}]
                [:link {:rel "stylesheet" :media "screen"
                        :href  "/public/css/books.css"}]]
               [:body
                [:div#application
                 (r/render-html (c/app {:route route
                                        :books @books}))]
                [:script {:src "/public/js/books.js"}]
                [:script
                 "books.client.init()"]]])})

(defn add-book
  [\{\{:strs [title author year]} :form-params :as req}]
  (swap! books conj [title year author])
  {:status 303
   :headers {"Location" "/"}})

(defroutes all-routes
  (GET "/" [] render)
  (GET "/:route" [] render)
  (POST "/" [] add-book)
  (files "/public/" {:root "resources/public"})
  (not-found "Page not found"))

(def app (site all-routes))
```

Don't forget to write some styles in `resources/public/css/books.css`. You can get some from [repo](https://github.com/slonoed/rum-server-render-example/blob/master/resources/public/css/books.css)
Call `(reset)` in clojure REPL and refresh browser page. Now we get simple web app that works without javascript.

## Add client logic
To sync html from server and react DOM tree in browser we need to pass all the state that we use for rendering html to browser. And then apply this state to reactjs tree. To simplify work with links I handle all link in one handler. In real app you probably want to create separate actions. Create file **src/controllers.cljs** with this content:

```clojure
(ns books.controllers
  (:import [goog.history Html5History EventType]
           [goog History]
           [goog.net XhrIo]
           [goog.date Date]))

(defonce state nil)
(defonce history nil)


(defn local-link?
  "Check DOM node is 'A' link to local address
  Like <a href='/add'>link</a>
  "
  [a]
  (and (= (.-tagName a) "A")
       (goog.string/startsWith (.-href a)
                               (str
                                 js/location.protocol
                                 "//"
                                 js/location.host))))


(defn handle-url-change
  "set :route field in state when routing changed"
  [e]
  (let [t (.slice (.-token e) 1)
        t' (js/decodeURIComponent t)]
    (swap! state assoc :route t')))


(defn start!
  "Start function. Expects state map"
  [state']
  (set! state state')
  ;; Setup history
  (set! history (Html5History.))
  (doto history
    (.setPathPrefix "")
    (.setUseFragment false)
    (goog.events/listen EventType.NAVIGATE
                        #(handle-url-change %))
    (.setEnabled true))

;; Small hack. When use click link on page we check is this same domain link
;; and instead reloading page only change history
(goog.events/listen js/document.body "click"
                    (fn [e]
                      (when (local-link? (.-target e))
                        (.preventDefault e)
                        (.setToken history (.. e -target -pathname))))))
                

(defn add-book
  "Save book to server. After success redirect to list page."
  [[title year author :as book]]
  (let [esc #(js/encodeURIComponent %)
        form-data (str "title=" (esc title) "&"
                       "year=" (esc title) "&"
                       "author=" (esc author))
        callback (fn []
                   (swap! state update :books conj book)
                   (.setToken history "/"))]
    (.send XhrIo "/" callback "POST" form-data)))
```

In **core.clj** change `render` to provide state for client code.

```clojure
(defn render
  [\{\{route :route} :route-params}]
  (let [state {:route route
               :books @books}]
    {:status  200
    :headers {"Content-Type" "text/html"}
    :body    (hiccup/html
               "<!doctype html>"
               [:html
                [:head
                 [:meta {:charset "utf-8"}]
                 [:link {:rel "stylesheet" :media "screen"
                         :href  "/public/css/books.css"}]]
                [:body
                 [:div#application
                  (r/render-html (c/app state))]
                 ;; Serialize data for client
                 [:script#initial-data {:type "application/edn"}
                  (pr-str state)]
                 [:script {:src "/public/js/books.js"}]
                 [:script
                  "books.client.init()"]]])}))
```

In **client.cljs** tie it together:

```clojure
(ns books.client
  (:require [books.controllers :as ctrls]
            [books.components :as c]
            [rum.core :as r]
            [cljs.reader :as reader]))

(defn load-init-state []
  (reader/read-string (.-text (js/document.getElementById "initial-data"))))

(r/defc wrapper < r/reactive
  [s]
  (c/app (r/react s)))

(defn init
  []
  (let [init-state (atom (load-init-state))]
    (r/mount (wrapper init-state) (js/document.getElementById "application"))
    (ctrls/start! init-state)))
```

The last step is to put the submit handler on form (**components.cljc**). Note changed `ns` form. And form `on-change` property.

```clojure
(ns books.components
  (:require [rum.core :as r]
            #?(:cljs [books.controllers :as c]))) ;; there are no controllers in clojure

(r/defc link [[title year author]]
  [:li
   [:a {:href (str "/" title)} title]])

(r/defc books-list [books]
  [:.list
   [:ul
    (map link books)]
   [:a.btn {:href "/add"} "Add book"]])

(r/defc details [[title year author]]
  [:.details
   [:a {:href "/"} "List"]
   [:label "Title"] title
   [:label "Author"] author
   [:label "Year"] year])

(r/defc add-form []
  [:.modal
   [:form {:action "/"
           :method "POST"
           :on-submit #?(:clj nil
                         ;; We need handler only in cljs
                         :cljs (fn [e]
                                 (.preventDefault e)
                                 (c/add-book ["Hello" 12324 "Dmitry"])))}
    [:input {:type "text" :name "title"  :placeholder "Title"}]
    [:input {:type "text" :name "author" :placeholder "Author"}]
    [:input {:type "text" :name "year"   :placeholder "Year"}]
    [:button.btn {:type "submit"} "Add"]
    [:a.btn {:href "/"} "Cancel"]]])

(r/defc app [{:keys [books route]}]
  [:.page
   ;; If route match any book title - show detailed view
   ;; else - show list
   (if-let [book (some #(when (= route (first %)) %) books)]
     (details book)
     (books-list books))
   ;; If route is "add" – render additional modal window with form
   (when (= route "add")
     (add-form))])
```

## Tips, notes, pitfalls
You can find all code in [repo](https://github.com/slonoed/rum-server-render-example).

This report shows only the basics of rum. I skip few useful topics. It's [documentation](https://github.com/tonsky/rum) pretty good.

I didn't mention about hot reload at all. I think you can find more in [figwheel documentation](https://github.com/bhauman/lein-figwheel).

Trick with links only for this demonstration. In a real app you should handle all the links carefully.

In a huge app direct changing state can create mess. To prevent from it you can use redux like technique. You can create [core.async/chan](https://clojure.github.io/core.async/), put any actions to it and create infinite loop to handle this action and change state.

Be careful when you use some float number functions in components. For example Math.sin in Java and Javascript looks the same, but can produce slightly different numbers. If it happens, react will rerender node.

## Questions
If you have any questions or have found any mistakes in this text, please write me message in [twitter](http://twitter.com/slonoed).


[app]: /assets/img/clojure-react-render/app.png "App"
[hello_clojure]: /assets/img/clojure-react-render/hello-clojure.png "Hello clojure"
[hello_http]: /assets/img/clojure-react-render/hello-http.png "Hello http"
