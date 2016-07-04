---
layout: post
title:  "Restore deleted Git branch"
published: true
---

It can happen to anyone: remove branches that has not been merged.  

Quick fix:  

1. `git reflog`
2. Look for last commit in deleted branch, copy it SHA (first column).
3. `git checkout [sha]`
4. `git checkout -b restored-branch`
5. You are amazing!

Details?

A branch in Git is simply a lightweight movable pointer to commit. 

![simple brunch][1]

HEAD is pointer to commit you currently have in working copy.   
When you delete branch (with `git branch -D feature-branch`) git just delete this pointer

![simple brunch][2]

Fortunately we can create new branch on this commit.
First you need to find SHA of this commit with `git reflog`

```
7a94c18 HEAD@{0}: commit: last commit
3fe702c HEAD@{1}: checkout: moving from feature-branch to master
8879406 HEAD@{2}: commit: feature commit
3fe702c HEAD@{3}: checkout: moving from master to feature-branch
3fe702c HEAD@{4}: commit: second comit
e57b217 HEAD@{5}: commit (initial): Initital commit
```

Now, move HEAD pointer to **feature commit**. ```git checkout 8879406```

![simple brunch][3]

And finally create new branch
`git checkout -b restored-branch`

![simple brunch][4]

*ps. always check git response to command: it notifies when you try to do something stupid.*

[1]: /assets/img/restore-deleted-git-branch/1.png "head and master"
[2]: /assets/img/restore-deleted-git-branch/2.png "head and master"
[3]: /assets/img/restore-deleted-git-branch/3.png "head and master"
[4]: /assets/img/restore-deleted-git-branch/4.png "head and master"
