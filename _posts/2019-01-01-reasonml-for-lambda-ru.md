---
layout: post
title:  "Используем ReasonML в AWS Lambda"
ref: "reason-for-lambda"
lang: "ru"
published: false
description: "Как настроить AWS Lambda и писать код на ReasonML"
excerpt: ""
---

В этом руководстве я покажу как создать простой сервис при помощи AWS Lambda
и запустить его в Амазоне совершенно бесплатно.

Амазон предоставляет многие сервисы бесплатно, если не выходить за лимиты.
При этом лимиты весьма щедрые: миллионы запросов в месяц, 5 ГБ хранилища в S3,
25 ГБ в базе данных DynamoDB. Этого более чем достаточно для нашего учебного проекта.

## Регистрация аккаунта AWS

Для начала работы нужно [зарегистрировать аккаунт][register]. Вас попросят ввести личные и
платежные данные.

## Получение прав доступа

Для работы с сервисами Амазона программно нам нужно создать пользователя,
выдать ему соответствующие права и получить ключи доступа.

Для этого переходим в консоль AWS, [раздел IAM][IAM].
Слева вбираем пункт _Users_ и нажимаем _Add user_.

![Add user][add-user-img]

В открывшейся форме указываем имя
пользователя (_User name_) и выбираем пункт _Programmatic access_.

На следующем шаге выбираем вкладку _Attach existing policies directly_ и ищем в таблице
политику _AdministratorAccess_.

![Set policy][policies-img]



[register]: https://aws.amazon.com/free/ "Регистрация"
[console]: https://console.aws.amazon.com/console/home "Консоль AWS"
[IAM]: https://console.aws.amazon.com/iam/home "Консоль AWS: IAM"
[add-user-img]: /assets/img/reason-lambda/add-user.png "AWS add user"
[policies-img]: /assets/img/reason-lambda/policies.png "AWS policies"
