---
layout: post
title:  "Third party libraries"
ref: "third-party"
lang: "en"
published: true
excerpt: ""
---

Quite a lot of products use third-party libraries.
A good example is the Google Analytics scripts.
Such libraries are loaded from a separate domain and provide API to the final product.
I was engaged in supporting and improving such a library in Flocktory company.
I will tell you about the peculiarities of developing such a library, and I will show good practices and tell you how to get around the basic mistakes. This note is structured from the bottom up. Therefore, first I will touch on the issues of writing code, and by the end, I will tell you about common things.

## Principles
For the structuring and application of information, it is convenient to agree on the principles for the development of such products. I propose four basic principles in order of decreasing importance.

1. Do not harm (Safety)
2. Work correctly (Correctness)
3. Timing is critical (Time optimization)
4. Performance is critical

*Actually, items 3 and 4 can change places. It all depends on the purpose of the product and the sites where it is used.*

Let's consider each of them separately.

### Do no harm
The library code is executed on a third-party site. New customers appear every day.
Breaking the code of any of the sites can lead to huge reputational and monetary losses.

### Work correctly
For business, it is vital that this code works correctly. Agree, no one will use Google Analytical if an analytics data are not correct.

### Timing is critical
For such libraries, download and start speed are important. An Early start allows not to miss the first user actions.

### Performance is critical
No one will tolerate a code that slows down and worsens the user experience.

## Global Object
In an ideal version, your code should be wrapped in a closure without any way of being called from the outside.
In case you need to give an API, the best you can afford is one global object that does not cause collisions,
for example, `window.companyname` or` wingow.ga`.
It is a good practice to enable this global object (noConflict), [as jquery does][jquery noconflict] (*do no harm*).
Your global object should not show the inside. Use closures to store your data.

What should be a global object? The options depend on the structure of your API.

### Array
This global object is an array, and the API call looks like adding a new element via the `push` method. The main advantage is that the site code can use such an object before the library is loaded: when loading the library, it takes out the elements and makes calls to the API. Then it replaces the `push` method of the global object. This approach is used by Google Analytics from the old version (to universal) and Google Tag Manager.


```javascript
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-XXXXX-X']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();
```

Note that the default variable is initialized with an empty array. This allows you to unify the queries to API and do not think about whether the library is loaded or not.


### Function
This approach is used by Google Analytics (script analytics.js). Pros is an obvious and understandable API - function call.
However, you need to make sure that the variable is available before the script is loaded. It can be done providing partners with a ready-made snippet for insertion on the site. Inside, the snippet must create a global variable and store the call arguments ​​until the library is loaded.

```javascript
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-XXXXX-Y', 'auto');
ga('send', 'pageview');
```

*In this version, the library adds calls to the array.*

### An object
It can be useful in the case of a large number of methods or a hierarchy of methods. Examples: jquery, moment, lodash.
Use [Object.freeze()][freeze],
To exclude changes to your object by external code (*work correctly*).

## Trust no one
Sites still use polyfill. Often these polyfills do not work properly.
You can stumble upon a broken implementation of `window.Promise`.
Once I found the old version prototype.js which replaced added polyfill in arrays which broke JSON.stringify.
Or you can run into the fact that the `map` method of the array returned not exactly an array.
Therefore, all necessary dependencies need to be packed along (*work correctly*).
However, you need to keep a balance (*timing is important*). For example, dragging an internal  Promise polyfill is a good idea if you support IE.
In the case of prototype.js, it was easier to convince the client to update the version, than to bring own serializer.
An excellent tool for packaging polyfills is the webpack and the  **ProvidePlugin**.
Its setting is simple and straightforward:

```javascript
New webpack.ProvidePlugin ({
  Promise: 'promise-package-polyfill',
  Fetch: 'fetch-package-polyfill'
}),
```

As a result, all `window.Promise` **in your** code will be replaced with polyfills.
Of course assuming jquery on sites is a bad idea😁.

## Dependencies
Try to avoid third-party libraries whenever possible. This reduces the size of the bundle.
For example, if you need methods from the lodash, simply extract the necessary ones into a separate file.
Only real used code should be in the bundle.

## Backward compatibility (work correctly, do no harm)
If your script provides any API, then it is there forever.
You can not go to all who use your script and ask to change the code or update the version.
The release of a new incompatible version only leads to the fact that you will have two versions for support (hello python!).
If you need a coordinate new behavior of the API method, consider creating a new method.
I can advise [Rick Hickey's excellent report on addictions][Rich Hickey].

## Server requests
There are three main ways your library interacts with your server.

### CORS
Supported in all browsers (IE> = 8). CORS is the only standard browser API for querying a third-party server.
You can use both `XMLHttpRequest` and `fetch`.
The devil is in the details: any non-simple queries generate an additional **OPTIONS** request.
Simple queries are considered to be queries that use the methods **GET**, **POST** or **HEAD** and contain only the headers from the list:

* Accept
* Accept-Language
* Content-Language
* Content-Type with the value of `application/x-www-form-urlencoded`, `multipart/form-data` or `text/plain`

Please note no cookies. So when you try to transfer cookies **OPTIONS** request appears.
Why **OPTIONS** requests is an issue? [Some proxy blocks them][jsonp still madatory].
As a result, your library may stop sending requests to the server (*work correctly*).

### Iframe
An interesting option is to create a hidden iframe, in which you open a page on your domain.
With this frame, you can communicate through `postMessage`, and make requests to the server from iframe.
Since the domain of the frame and the server are the same, there is no problem with CORS. Bonus you get crossdomain `localStorage`,
Doing such a mechanism, do not forget about the dangers of XSS attacks.
The main disadvantage of this approach is the additional frame loading (*timing is critical*).
Also, Safari blocks cookies and localStorage within frames.

### JSONP
The simplest option and it works everywhere. If you place the callbacks on `window`,
and not on your object, then do not forget to give them quite complex random names.
The downside of the approach is the complexity of query caching.

## User tracking
You most likely want to understand that two requests are made by one user.
The list of ways depends very much on how sensitive the identifier is.
The standard way is to use cookies. However, in the case of JSONP and CORS, we fall under the rule of third-party cookies.
This means that most browsers will not by default send cookies to your domain if the user has never visited it.
Iframe don't have this issue, the cookies will be sent.
But this will not work in safari.
If the interception of the identifier by third parties does not lead to any sensitive consequences,
Then you can pass the identifier for each request and store it in the site cookie.
The best option is to combine both methods.

## Testing
Code coverage with units depends on your desire. For me, this is a good way to test complex business logic.
I do not think 100% is the main target.
Integration tests work very well at which the entire library code is tested with some mocks
for requests to the server and complex browser APIs. To simplify testing of the existing code, I made [IoC wrapper][ioc].
Ideal options are functional tests right on the sites where the library is used.
However, this can raise false positives.

## Caching
If your library implies incremental updates, then you need a mechanism that allows update it as necessary,
without changing the code of sites where the library is installed.
Also, at the same time, it is necessary to have caching to reduce server load and downloads speed up (**timing is critical**).

There are two main approaches

### Loader
Site require only small **noncached** file. It is only purposed to add a script tag with a link to the main bundle.
In the link, there is a hash of the bundle, and the bandle has the maximum
cache time. This approach allows you to quickly deploy and at the same time have a large cache.
The cons are obvious - at the first visit and after deploy browser loads two scripts (timing is critical).

### A small bundle cache
If the first boot is vital and the user sessions are short, then the option with one file and a small cache can be better.
It is important to calculate the benefit of a quick first boot and a loss in the cost of traffic.
Nice to have a separate setting, which you can change the cache of the file.
Then before the release, it is possible to reset the cache to zero, wait for cache invalidation from all users and roll up the update. Later you can increase cache again.

## Errors and Logging
Your library will be executed on other sites, in unknown conditions and unknown browsers.
Periodically **there will be** errors. Errors can be completely arbitrary.
Errors that you did not intercept will **fall into the context of the site** and be sent to the logging system of your clients.
Therefore, any code with possible exception should be in `try/catch`. Wherever there is a `Promise.then`, there must be `catch`.

A good idea will be to hang on to global errors and determine whether they come from the library on the stack.

```javascript
Window.addEventListener ('unhandledrejection', event => {
  If (isOurError (event)) {
    // log
  }
});
Window.addEventListener ('error', event => {
  If (isOurError (event)) {
    // log
  }
});
```

Logs should be divided by level and give the opportunity to change the level in a production.
This allows testers to catch warnings in a testing phase.
I use [such a simple logger][log].

All critical errors must be sent to the server for further analysis.
In addition to the text of the error and the stack,
it is worth sending information about the browser (userUagent, screen resolution, etc.)
and the state of the library itself (version, API methods called, and so on).
This greatly simplifies the search for floating errors.
To store a significant number of errors on the server you can use elastic

## Browser Support
The support of a particular browser always depends on the amount of money that can be get from users of this browser and the costs of support.
However, there are nuances: there can be browsers that break your code in the most unpleasant way.
And you will find out about this only after you get angry clients whom users kicked in the support.
So the whitelist model can be useful: a set of browsers, where the library runs.
For all others, it will be turned off or perform a minimum of functions.
It is important to collect statistics of all browsers to understand when to add support.
Do not forget to check the new versions.

[Rich Hickey]: https://www.youtube.com/watch?v=oyLBGkS5ICk
[jsonp still madatory]: https://blog.algolia.com/jsonp-still-mandatory/
[log]: https://gist.github.com/slonoed/32b40f5d5af2de0e889c169e436d2b80
[ioc]: https://github.com/slonoed/startup
[jquery noconflict]: https://api.jquery.com/jquery.noconflict/
[freeze]: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze
