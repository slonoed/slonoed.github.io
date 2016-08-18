---
layout: post
title:  "Best macOS screenshot tool"
published: true
excerpt: ""
---

MacOS has nice screenshot tool. You can use these commands to save screenshots to folder or clipboard.

* `Command+Shift+3` save a screenshot of the full screen
* `Command+Shift+4` save selected box
* `Command+Shift+4, then space, then click window` save a screenshot of selected window

Also there are same commands with Ctrl pressed save screenshot to clipboard. You can paste it somewhere later.

By default macOS saves screenshots to ~/Desktop folder. You can change it. Eval this commands in your terminal.
{% highlight bash %}
defaults write com.apple.screencapture location /screenshot_folder/
killall SystemUIServer
{% endhighlight %}
Change `/screenshot_folder/` to folder you want to use.
Don't forget to create it if not exist.


