---
layout: post
title:  "loopback-connector-fakemail (deprecated)"
published: true
excerpt: ""
---
Last few month I use [loopback.io][loopback] on one of my projects. In this project I need to send emails to users. But I don't want to send email when in development. This simple [fake email loopback connector][connector] save email to disk using JSON format.
 
You just need install it
{% highlight bash %}
npm i --save loopback-connector-fakemail
{% endhighlight %}

Then use this connector in your email data source.
{% highlight json %}
{
  "db": {
    "host": "localhost",
    "port": 27017,
    "database": "mydb",
    "name": "db",
    "connector": "mongodb"
  },
  "email": {
    "name": "email",
    "connector": "fakemail"
  }
}
{% endhighlight %}

Don't forget to ovveride it with normal email connector in your `datasource.production.js` config.

[loopback]: http://loopback.io/
[connector]: https://github.com/SLonoed/loopback-connector-fakemail
