---
author: "Franco Becvort"
title: "Works once, make it works n times"
date: 2022-11-26
description: "My first contribution in Yacaré (in progress...)"
categories: ["The weekly update"]
thumbnail: /uploads/csv.png
---
## What is it about?

Currently there is a transfer system that works. The idea is that there are scenarios where you want to make many transfers at the same time \(perhaps a salary settlement?\). So together with a guy from Yacaré we are creating that: given a csv with cbus and amounts, make multiple transfers one after the other

## Why isn't it ready yet?

One of the points to comply with is to return to whoever consumes this api a url of a report where it is reported which transfers were successful, which were not, and a reason

My partner \(Nicolás Britos, a great guy\) knew how to create an Excel report very quickly. At the moment, however, we don't know what the f*ck to do with that report. Saving it as a blob in the database is an option \(this is being done at the moment\)

However our superiors have suggested upload the report to a cloud, save it, and provide a download url. Getting permissions from a cloud bucket to upload things has slowed down all development, so a downer at the moment. I hope this bureaucratic inconvenience is resolved quickly