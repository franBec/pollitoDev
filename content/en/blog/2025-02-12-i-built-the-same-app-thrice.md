---
author: "Franco Becvort"
title: "I Built The Same App Thrice"
date: 2025-02-12
description: "Groovy, Java, Kotlin"
categories: ["Programing talk"]
thumbnail: /uploads/2025-02-12-i-built-the-same-app-thrice/thrice.jpg
---
<!-- TOC -->
  * [Inspiration](#inspiration)
  * [Understanding The Application](#understanding-the-application)
  * [Quick Metrics](#quick-metrics)
  * [There&rsquo;s No The Good, The Bad, And The Ugly](#theres-no-the-good-the-bad-and-the-ugly)
  * [The Good: Java](#the-good-java)
  * [The First Love: Groovy](#the-first-love-groovy)
    * [Groovy Relaxed Typing](#groovy-relaxed-typing)
    * [Writing Tests With Spock](#writing-tests-with-spock)
    * [I Would Use Groovy Again Given The Chance](#i-would-use-groovy-again-given-the-chance)
  * [The Disappointment: Kotlin](#the-disappointment-kotlin)
    * [OpenAPI Generator Didn&rsquo;t Work Out Of The Box](#openapi-generator-didnt-work-out-of-the-box)
    * [Handling Java Time In Tests](#handling-java-time-in-tests)
    * [It Was Not Bad](#it-was-not-bad)
  * [Conclusion](#conclusion)
<!-- TOC -->

## Inspiration

This blog is heavily inspired by Theo's _"I built the same app with 5 different stacks"_ video.

{{< youtube O-EWIlZW0mM >}}

So I decided to do my take on it, but with two languages I already know well ([Java](https://www.java.com/) and [Groovy](http://www.groovy-lang.org/)) plus one new language I wanted to try for a long time: [Kotlin](https://kotlinlang.org/).

Here is the code for the repos:

- [Java version](https://github.com/franBec/roundest_java)
- [Groovy version](https://github.com/franBec/roundest_groovy)
- [Kotlin version](https://github.com/franBec/roundest_kotlin)

## Understanding The Application

I made the typical "Roundest Pokémon" programming exercise. Although the live application is no longer running (as I've since repurposed the VPS it was hosted on for other projects), you can still see how it looked and functioned in this brief recording:

{{< youtube IC-tFT7nq9Q >}}

I added a twist:

- On the top of the page, you can choose which backend system processes your vote (Next.js + _).
![backend-selector.gif](/uploads/2025-02-03-vps-5/backend-selector.gif)
- No matter which backend you choose, all votes end up in the same place.
![vote-flow.gif](/uploads/2025-02-03-vps-5/vote-flow.gif)
- The frontend application (the thing you interact with in the browser) is made in **Next.js**.
    - Yes, I can do frontend.
    - I'm a [Next.js](https://nextjs.org/) and [Tailwind](https://tailwindcss.com/) fanboy.
    - I think [react-query](https://tanstack.com/query/latest/docs/framework/react/overview) is the best package ever created (honorable mention [swr](https://swr.vercel.app/)).
    - I watch all [Theo&rsquo;s videos](https://www.youtube.com/@t3dotgg).
    - I like to make fun of [JQuery](https://jquery.com/) even though [half of the internet is made with it](https://www.reddit.com/r/webdev/comments/r7nz99/jquery_is_still_used_on_80_of_websites/)... (flashbacks of JQuery + Bootstrap Argentinian government web pages still haunt me in my sleep).
![jquery.jpg](/uploads/2025-02-12-i-built-the-same-app-thrice/jquery.jpg)

Here's the [code for the Next.js frontend](https://github.com/franBec/roundest_nextjs).

## Quick Metrics

This blog is mostly a comparison of backends. Spoiler alert, in terms of performance in this small sample project, they are the same.

Let's do some comparison of the codebases:
- Overall, the three backends are not that different.
- The frontend is its own different thing, not really much point in comparing it against the backend applications.

The following tables were generated using [cloc](https://github.com/AlDanial/cloc).

Backend application **Groovy**

| Language     | files  | blank   | comment | code     |
|--------------|--------|---------|---------|----------|
| Groovy       | 22     | 174     | 1       | 727      |
| YAML         | 3      | 0       | 0       | 296      |
| SQL          | 1      | 1       | 2       | 157      |
| Bourne Shell | 1      | 28      | 118     | 106      |
| Gradle       | 2      | 12      | 0       | 96       |
| DOS Batch    | 1      | 21      | 2       | 71       |
| Markdown     | 1      | 10      | 0       | 47       |
| Dockerfile   | 1      | 1       | 2       | 7        |
| Properties   | 1      | 0       | 0       | 7        |
| **SUM:**     | **33** | **247** | **125** | **1514** |

Backend application **Java**

| Language     | files  | blank   | comment | code     |
|--------------|--------|---------|---------|----------|
| Java         | 22     | 131     | 2       | 660      |
| YAML         | 3      | 0       | 0       | 296      |
| SQL          | 1      | 1       | 2       | 157      |
| Gradle       | 2      | 12      | 0       | 108      |
| Bourne Shell | 1      | 28      | 118     | 106      |
| DOS Batch    | 1      | 21      | 2       | 71       |
| Markdown     | 1      | 9       | 0       | 45       |
| Dockerfile   | 1      | 1       | 2       | 7        |
| Properties   | 1      | 0       | 0       | 7        |
| **SUM:**     | **33** | **203** | **126** | **1457** |

Backend application **Kotlin**

| Language     | files  | blank   | comment | code     |
|--------------|--------|---------|---------|----------|
| Kotlin       | 24     | 134     | 4       | 589      |
| YAML         | 3      | 0       | 0       | 301      |
| Gradle       | 2      | 25      | 0       | 167      |
| SQL          | 1      | 1       | 2       | 157      |
| Bourne Shell | 1      | 28      | 118     | 106      |
| DOS Batch    | 1      | 21      | 2       | 71       |
| Markdown     | 1      | 9       | 0       | 44       |
| Dockerfile   | 1      | 1       | 2       | 8        |
| Properties   | 1      | 0       | 0       | 7        |
| **SUM:**     | **35** | **219** | **128** | **1450** |

When it comes to deployment times, also there's nothing remarkable:

- If it is a redeployment with no building, it takes around 1 minute and a half.
- If the deployment implies building, it takes around 4 minutes and a half.

I have all the backends with the same very conservative resource limits:

![resource-limits.png](/uploads/2025-02-12-i-built-the-same-app-thrice/resource-limits.png)

On idle they have acceptable CPU and memory usage. All of them present:

- CPU% = 0,2
- MEM = 270M

## There&rsquo;s No The Good, The Bad, And The Ugly

All three options are totally valid for a serious big project, and they would fall into "The Good".

I would say a better phrase would be _"The Good, the First Love, and the Disappointment"_. Let's go one by one.

## The Good: Java

Let's start by inserting obvious  `public static void String main args` joke here.

{{< youtube m4-HM_sCvtQ >}}

Fun fact, `public static void String main args` [is no longer needed since Java 21](https://medium.com/@shwetha.narayan/java-21-no-more-public-static-void-main-c90334d6d95e).

In one word, Java is **reliable**:

- There’s a certain comfort in knowing that you’re backed by a vast community and a wealth of documentation and best practices.
- It would be strange that you get an error that nobody else had before.

Everything just worked, probably because Java is what I've been doing for 8 hours a day, 5 days a week, for more than 2 years by now.

Java is not glamorous but comfortable.

![honest-work-meme-c7034f8bd7b11467e1bfbe14b87a5f6a14a5274b.jpg](/uploads/2025-02-12-i-built-the-same-app-thrice/honest-work-meme-c7034f8bd7b11467e1bfbe14b87a5f6a14a5274b.jpg)

## The First Love: Groovy

My journey with Groovy began back in 2021. I remember in the job interview I was only asked two things:

- Do you know Java?
- Do you know SQL?

_It was a simpler time._

Without realizing, I had joined a project built using [Grails](https://grails.org/), a very niche monolith framework that uses Groovy as its primary language.

- **Fun fact**: [MercadoLibre heavily used Groovy and Grails before moving away to Go](https://go.dev/solutions/mercadolibre).
  - I suspect that the reason these particular projects were also using Grails was because someone from MercadoLibre started them. I don't have any proof of it, though.

I quickly fell in love with its expressive syntax and the way it aimed to make Java better by cutting down on boilerplate and embracing a more dynamic style.

- **Semicolons?** Optional.
- **Checked exceptions?** Handled.
- **Java verbosity?** Neutralized by closures and the `?.` safe navigation operator.

Yet Groovy remains the indie artist of JVM languages: beloved by Gradle buildscript writers and the few Grails developers that may exist out there, but never quite achieving Scala's academic prestige or Kotlin's JetBrains-backed fame.

### Groovy Relaxed Typing

Groovy relaxed typing is a double-edge sword.

During the writing of the Groovy version, I had a CORS issue. My first immediate suspect was a bad configured `application.yml` (as I read the allowed origins from that file), but the solution was this:

![Screenshot2025-02-11190416.png](/uploads/2025-02-12-i-built-the-same-app-thrice/Screenshot2025-02-11190416.png)

I had `as String` probably from an IntelliJ suggestion or ChatGPT copy-paste, but that was enough to break CORS in the application. These kinds of mistakes simply don't happen in Java.

### Writing Tests With Spock

You can use [JUnit](https://junit.org/junit5/) in a Groovy-based project, but it would be a waste to not use [Spock](https://spockframework.org/) (is like going to Madrid and not eating a tortilla).

I always found Spock syntax more readable, personal preference. Here you have a snippet of code in Java Junit, and Groovy Spock, both testing the find Pokémon by id functionality

**Java JUnit**:

```java
@Test
void whenFindByIdThenReturnPokemon() {
    when(pokemonRepository.findById(anyLong())).thenReturn(Optional.of(mock(Pokemon.class)));
    assertNotNull(pokemonService.findById(1L));
}
```

**Groovy Spock**:

```groovy
def "when findById then return Pokemon"(){
    given: "a mocked repository behaviour"
    pokemonRepository.findById(_ as Long) >> Optional.of(new Pokemon())

    when: "finding a pokemon"
    def result = pokemonService.findById(1L)

    then: "result is not null"
    result != null
}
```
### I Would Use Groovy Again Given The Chance

Not because it's objectively superior, but because maintaining code should feel like coming home. Even if home has some leaky type checking and mysterious `NoSuchMethodError` ghosts in the closet. I guess I miss being part of a project I really care about, and Groovy reminds me of those days.

## The Disappointment: Kotlin

**Disclaimer**: This was my first time starting a Kotlin project solo, so maybe my bad experience is due to skill issue.

![skill-issue-skill-3427506110.gif](/uploads/2025-02-12-i-built-the-same-app-thrice/skill-issue-skill-3427506110.gif)

### OpenAPI Generator Didn&rsquo;t Work Out Of The Box

I'm a big fan of OpenAPI Generator, and I don't ever want to write a DTO ever again. Using the [OpenAPI Generator Gradle Plugin](https://github.com/OpenAPITools/openapi-generator/tree/master/modules/openapi-generator-gradle-plugin) was basic in Java and Groovy, but in Kotlin I had two issues:

- DTO fields were declared as immutable using `val`, but I needed them to be mutable with `var`.
  - I ended up having to create a custom task that scanned the generated classes and swapped val for var. 
- A parameter that should've been nullable (`List<String>?`), was not (it was missing the `?`).
  - The same solution created another custom task that did the replacement.

Those extra steps felt like a step backward in terms of efficiency. You can say _"Bro, just write the DTOs yourself"_, to which I answer _"I didn't have to do that in Java and Groovy, why do I have to write them here?"_

### Handling Java Time In Tests

You can also use JUnit in a Kotlin-based project, but it would be a waste to not give a try to [MockK](https://mockk.io/). It is quite close to JUnit syntax.

The problem arrived when it was unable to mock `java.time.Instant` and `java.time.format.DateTimeFormatter`.

- MockK simply couldn't, or at least I was not able to find a way to do it.
- I had to introduce an interface just to abstract away the `java.time` functionality.
  - While this extra layer made the tests pass, it also added complexity that I hadn’t expected and somewhat muddied the clarity of the design.

If you are curious what MockK looks like, here's a test on the find Pokémon by id functionality:

```kt
@Test
fun `when findById then return Pokemon`() {
    val pokemon = Pokemon(name = "Bulbasaur", spriteUrl = "url")
    every { pokemonRepository.findById(any<Long>()) } returns Optional.of(pokemon)
    
    assertNotNull(pokemonService.findById(1L))
}
```

### It Was Not Bad

But it was the little things that didn't convince me. Maybe my expectations for Kotlin were a bit too high, or perhaps I simply took a few wrong turns along the way. Despite these frustrations, I’m not closing the door on Kotlin entirely.

## Conclusion

- With a solid foundation in Java, you can explore Groovy, Kotlin, and other languages in the JVM ecosystem.
- The image loading in the frontend app could be improved if I have the Pokémon images in the project `public` folder instead of relying on a GitHub api. Nonetheless, it is not that painful of a loadtime.
- I would've liked trying [Scala](https://www.scala-lang.org/), even did initial research on the [Play Framework](https://www.playframework.com/), but got distracted by acquiring a VPS and the rest was history.