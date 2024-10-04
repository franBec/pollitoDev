---
draft: true
author: "Franco Becvort"
title: "Anime Poster Generator 4: A backend dev approach to frontend"
date: 2024-03-24
description: "Review of anime-poster-generator-frontend repo"
categories: ["Anime Poster Generator"]
thumbnail: /uploads/2024-03-24-anime-poster-generator-4/IMG_20240316_182242.jpg
---

The thumbnail image does not have any relation to the content of the blog. It is just a photo I took of the [Cais do Sodré metro station](https://www.metrolisboa.pt/viajar/cais-do-sodre/) wall art.

This is a continuation of [Anime Poster Generator 3: I can do frontend](/en/blog/2024-03-21-anime-poster-generator-3).

You can check the code at the github repo [anime-poster-generator-frontend](https://github.com/franBec/anime-poster-generator-frontend).

## How did I approach this challenge?

I think in any situation is important to first identify limitations and find strategies to sort them. Here were mine:

- My UI/UX experience and knowledge is close to none. I don't have a good taste when it comes to picking colors, sizes, fonts, and all of those "making things look pretty" things.
  - Let's follow pre-established well thought solutions: [tailwind](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), [aceternity](https://ui.aceternity.com/)
- My Typescript knowledge is kinda rough around the edges. How will I solve complex situations that may arise? Same with React...
  - Welcome to 2024, ChatGPT all the way (plus some common sense).

## Objectives

I made this frontend with three main goals in mind:

- Attempt to achieve all the "User Stories" I put myself in [Anime Poster Generator 1: Sketching the idea](/en/blog/2024-03-13-anime-poster-generator). Summarized they are:
  - Search animes.
  - Select desired anime.
  - Generate poster with original anime image.
  - Attach and use custom images.
  - Download poster.
- Put me out of my Java comfort zone.
- Use this as proof that Contract-Driven Development can work outside of Java.

## anime-poster-generator-frontend repo

The repo was built following [shadcn/ui Next.js docs](https://ui.shadcn.com/docs/installation/next), so its folder structure looks similar to most Next.js projects.

![repo files](/uploads/2024-03-24-anime-poster-generator-4/Screenshot2024-03-24214531.png)

### Example of a .tsx component

I won't explain in depth each file, cause there are a lot of files. But mainly, to be honest with you, most of the tsx files explanation would be "I googled _component I needed in tailwind_, copy-pasted, changed what was needed to fit, move on.

Example: the file src\components\animePosterGenerator\anime\mal_id\animeData.tsx is responsible for this view:

![animeData](/uploads/2024-03-24-anime-poster-generator-4/screencapture-localhost-3000-anime-43608-2024-03-24-21_49_21.png)

An image to the left, information to the right. In the information, we can see a title-like text, some info under the title, and a description parapragh... This is the same as a product detail in a shop page.

After searching for "Product detail tailwind" and scrolling through some options, I chose [this one](https://tailwindcomponents.com/component/product-detail):

![product-detail](/uploads/2024-03-24-anime-poster-generator-4/screencapture-tailwindcomponents-component-product-detail-landing-2024-03-24-21_53_41.png)

You can kinda see the resemblance, specially when looking at the tailwind classes in the code. But credit where credit is due, I put some effort to make it fitting for what I was looking for. So yep, code looks similar, but is not a straight yoink.

Here's the final component code:

```tsx
import Link from "next/link";
import { AnimeFull } from "../../../../../generated/rtk-query/jikanApi";
import { ExternalLink } from "lucide-react";
import { Fragment } from "react";

const Separator = () => (
  <div>
    <span className="text-5xl">·</span>
  </div>
);

const AnimeData = ({ data }: { data: AnimeFull }) => {
  const stats = [
    { stat: "Score", value: data.score },
    { stat: "Ranked", value: `#${data.rank}` },
    { stat: "Popularity", value: `#${data.popularity}` },
  ];

  return (
    <>
      <h2 className=" text-3xl title-font font-medium mb-1">{data.title}</h2>
      <div className="flex space-x-3 mb-4 items-center">
        {stats.map((item, index) => (
          <Fragment key={index}>
            {index !== 0 && <Separator />}
            <div className="flex flex-col items-center">
              <div>
                <span>{item.stat}</span>
              </div>
              <div>
                <span className="font-bold">{item.value ?? "-"}</span>
              </div>
            </div>
          </Fragment>
        ))}
        {data.url && (
          <>
            <Separator />
            <div className="flex flex-col items-center">
              <Link href={data.url} target="_blank">
                <ExternalLink strokeWidth={2} />
              </Link>
            </div>
          </>
        )}
      </div>
      <p className="leading-relaxed">{data.synopsis}</p>
    </>
  );
};

export default AnimeData;
```

### What's the deal with /generated

In the last piece of code, you can find an interesting import:

```tsx
import { AnimeFull } from "../../../../../generated/rtk-query/jikanApi";
```

What could it be? From the context, we can assume is a generated typescript type, that has something to do with rtk-query and jikanApi. Just to be sure, let's ask ChatGPT for its opinion on the matter.

> What's the role of AnimeFull in this component code?

Here's the answer given:

> In the provided component code, `AnimeFull` appears to be a TypeScript type imported from a generated directory, likely the result of an automatic code generation tool that interfaces with the Jikan API, an unofficial MyAnimeList API. This type is used to strongly type the `data` prop in the `AnimeData` component, ensuring that the object passed as `data` adheres to the structure and types defined by the `AnimeFull` type.

> This strong typing provides several benefits:

> 1. **Type Safety**: It ensures that the `AnimeData` component receives data in the expected format, which includes specific fields like `score`, `rank`, `popularity`, `title`, `url`, and `synopsis`. This helps prevent runtime errors due to unexpected data structures or types.

> 2. **Autocompletion and Intellisense**: In a development environment that supports TypeScript, developers working with the `AnimeData` component can enjoy autocompletion and inline documentation for the `data` prop, making it easier to understand what data is available and how it can be used.

> 3. **Maintainability**: By clearly defining the expected structure of the `data` prop, the code becomes easier to maintain and update. If the structure of `AnimeFull` changes, TypeScript will highlight errors where the `AnimeData` component may no longer be compatible with the new structure, guiding developers toward necessary updates.

> 4. **Documentation**: The use of a specific type like `AnimeFull` serves as a form of documentation, clarifying the expected content and format of the data the component needs to function properly.

> In summary, `AnimeFull` in this context defines the structure and types of the data expected by the `AnimeData` component, contributing to type safety, easier development, and maintainability of the code.

Damn even knows what jikanApi is without me never even telling him nor asking for it. These AIs are getting smarter by the minute.

Also when looking to the folder structure, there are some odd files and folders that have nothing to do with Next.js:

![repo files w/red](/uploads/2024-03-24-anime-poster-generator-4/Screenshot2024-03-24214531-copy.png)

## RTK Query

For implementing Contract-Driven Development practices, I wanted to find a tool similar to what [openapi-generator-maven-plugin](https://mvnrepository.com/artifact/org.openapitools/openapi-generator-maven-plugin/7.4.0) is in Java Spring Boot.

![openapi-generator-maven-plugin.png](/uploads/2024-03-18-pollitos-manifest-on-java-spring-boot-cdd-2/openapi-generator-maven-plugin.png)

After looking around through some options, I settled on [RTK Query](https://redux-toolkit.js.org/) for its [Code Generation](https://redux-toolkit.js.org/rtk-query/usage/code-generation) capabilities.

When landing on the RTK Query main page, you are greeted with this:

> The official, opinionated, batteries-included toolset for efficient Redux development

I couldn't be more happy to read that, though I had no idea what _"Redux development"_ meant.

I tried to hop into tutorial hell but decided it was not worth my time, and instead I followed examples I found on the internet + ChatGPT + common sense as a developer. Big shoutout to Steven Lemon and its blog on [Code Generation in React with RTK Query](https://steven-lemon182.medium.com/code-generation-in-react-with-rtk-query-e2410db6c868).

So, does it do the expected job? Yes! But it needs some tweaks.

### Generated code should be consistent

What do I mean by that? When following Steven's blog and the Code Generation Redux's docs, you end up with a file with fully tiped code ready to use:

![outline](/uploads/2024-03-24-anime-poster-generator-4/Screenshot2024-03-25103142.png)

Great no? Yes, but **you are expected to save it and be made responsible of it.**

You may think _"That's no big deal, git add . git commit, done"_. But here's the catch. What if in the future, some developer wanted to cheat its way out of a warning or error? (your typical number|undefined can't be assigned to a number const). Easiest way would be to change the place where the definition is.

We can call this an irresponsible action and blame the developer of being lazy. But...

- Maybe this codebase lost all of its original developers.
- Maybe these new devs don't realise that file is generated code and think "wow, people before us made all these definitions, let's keep'em updated".
- Maybe... [insert here some other situation that end up in a dev changing the generated definition]

Here the blame is more on the original devs for not leaving the intention of the file clear. And not, **naming the file something_GENERATED.ts is not good enough**.

Also what if the contract changes? Now I have to regenerate the code, but if someone else wrote on top of the previously generated code, all of that is gonna be overwritten and gone.

Here's my criteria for what is generated code:

> Generated code should be **read-only**, **disposable**, and **generated**.

This approach ensures that the integrity and consistency of codebases are maintained, avoiding the pitfalls of manual alterations that could introduce errors or inconsistencies.

- Emphasizing the **read-only** aspect underscores the importance of not directly modifying generated code, as such changes can be easily overwritten by subsequent code generations.
- By framing generated code as **disposable**, the text would convey the idea that this code is not precious or irreplaceable, but rather a transient, easily re-creatable asset that should be seamlessly integrated and updated within the development workflow.
- Generated code should be **generated**, not manually written by developers, to ensure efficiency, consistency, and error reduction by automating repetitive and complex coding tasks, allowing developers to focus on more strategic aspects of development.

### Ensuring consistency

Making generated code read-only and disposable is extremely easy: just .gitignore it!

The challenge here is making generated code, well, generated. If code is gonna be disposed, I need a reliable way if generating it again and again over and over.

In Java Spring Boot, the openapi-generator-maven-plugin achieve this by attaching itself to the maven compile task. So maybe I could recreate this behaviour with a package.json script, but how? Once again, ChatGPT comes to the rescue.

After some back and forth between ChatGPT's code and my desired behaviour, **generateRtkQuery.ts** was born.

```ts
import {
  existsSync,
  mkdirSync,
  writeFileSync,
  readdirSync,
  unlinkSync,
} from "fs";
import { exec } from "child_process";
import { join } from "path";

const preProcessApi = () => {
  const directoryPath = "./generated/rtk-query";

  if (existsSync(directoryPath)) {
    const files = readdirSync(directoryPath);

    for (const file of files) {
      unlinkSync(join(directoryPath, file));
    }
    console.log(`All files cleared in: ${directoryPath}`);
  } else {
    mkdirSync(directoryPath, { recursive: true });
    console.log(`Directory created at: ${directoryPath}`);
  }
};

const processApi = (apiName: string) => {
  const directoryPath = "./generated/rtk-query";
  const filePath = `${directoryPath}/${apiName}Api.ts`;

  writeFileSync(filePath, "");

  const command = `npx @rtk-query/codegen-openapi ./src/schemas/openapi/${apiName}-config.ts`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
  });
};

preProcessApi();
const apiNames = ["jikan", "animePosterGeneratorBackend"];
apiNames.forEach((apiName) => {
  processApi(apiName);
});
```

This TypeScript code defines two functions, preProcessApi and processApi, and then executes a sequence of operations involving these functions to manage and generate API code based on OpenAPI specifications for a set of APIs. Here's a breakdown of what each part does:

preProcessApi Function:

- The function sets a directory path to ./generated/rtk-query, which is intended to store the generated API files.
- It checks if this directory exists using existsSync. If it does:
  - Reads the contents of the directory with readdirSync.
  - Iterates over each file in the directory and deletes it using unlinkSync. This clears out any old generated files before generating new ones, keeping the directory clean.
  - Logs a message indicating that all files in the directory have been cleared.
- If the directory doesn't exist:
- Creates the directory using mkdirSync, including any necessary parent directories ({ recursive: true }).
- Logs a message indicating that the directory has been created.

processApi Function:

- Takes an API name as an argument and sets up a path for the API file to be generated, following the pattern ./generated/rtk-query/[apiName]Api.ts.
- Creates an empty file at the specified path using writeFileSync. This ensures that the file exists before trying to write the generated API code into it.
- Constructs a command string to generate API code using @rtk-query/codegen-openapi, which is a tool for generating Redux Toolkit Query (RTK Query) hooks and endpoints from OpenAPI specifications. The command specifies the path to the OpenAPI configuration file for the given API.
- Executes the constructed command using exec, which runs the command in a shell. The callback function handles any errors, logs the standard output, and logs the standard error output, providing feedback on the operation's success or failure.

Finally, I create a new npm script:

```json
"generate-apis": "tsc generateRtkQueryCode.ts && node generateRtkQueryCode.js"
```

Don't forget to combine the reducer from the client and concat the middleware in the store... whatever that means. I didn't bother to learn how redux works, I just followed documentation.

```ts
import {
  combineReducers,
  configureStore,
  Reducer,
  UnknownAction,
} from "@reduxjs/toolkit";
import { jikanClient } from "@/clients/jikanClient";
import { animePosterGeneratorBackendClient } from "@/clients/animePosterGeneratorBackendClient";

const combinedReducer = combineReducers({
  [jikanClient.reducerPath]: jikanClient.reducer,
  [animePosterGeneratorBackendClient.reducerPath]:
    animePosterGeneratorBackendClient.reducer,
});

const rootReducer: Reducer = (state: RootState, action: UnknownAction) => {
  if (action.type === "store/reset") {
    return {} as RootState;
  }
  return combinedReducer(state, action);
};

export const makeStore = () => {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware()
        .concat(jikanClient.middleware)
        .concat(animePosterGeneratorBackendClient.middleware),
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
```

Here's a quick diagram how everything works. Kinda similar to the openapi-generator-maven-plugin, but with its own javascript twists.

![redux generate diagram](/uploads/2024-03-24-anime-poster-generator-4/Untitled-2024-02-21-1828.png)

Here's a fragment of some generated code being used:

```tsx
"use client";

import {
  DEFAULT_animeSearchQueryOrderbyValues,
  DEFAULT_searchQuerySortValues,
  SearchAnimeForm,
} from "@/components/animePosterGenerator/search/searchAnimeForm";
import { useSearchParams } from "next/navigation";
import {
  AnimeSearchQueryOrderby,
  SearchQuerySort,
  useGetAnimeSearchQuery,
} from "../../../generated/rtk-query/jikanApi";
import Loading from "@/components/animePosterGenerator/layout/loading";
import { AlertDestructive } from "@/components/animePosterGenerator/layout/alertDestructive";
import AnimeBentoGrid from "@/components/animePosterGenerator/search/animeBentoGrid";
import PaginationAnimeSearch from "@/components/animePosterGenerator/search/paginationAnimeSearch";

const SearchPage = () => {
  const searchParams = useSearchParams();

  const getAnimeSearchApiArg = {
    q: searchParams.get("q") || "",
    sort: (searchParams.get("sort") ||
      DEFAULT_searchQuerySortValues) as SearchQuerySort,
    orderBy: (searchParams.get("orderBy") ||
      DEFAULT_animeSearchQueryOrderbyValues) as AnimeSearchQueryOrderby,
    limit: 9,
    page: Number(searchParams.get("page")) || 1,
  };

  const { data, isLoading, isError, error } = useGetAnimeSearchQuery(
    getAnimeSearchApiArg,
    {
      skip:
        !getAnimeSearchApiArg.q ||
        !getAnimeSearchApiArg.sort ||
        !getAnimeSearchApiArg.orderBy ||
        !getAnimeSearchApiArg.page,
    }
  );

  if (isLoading) {
    return <Loading />;
  }

  if (isError || !data) {
    return (
      <AlertDestructive alertDescription={JSON.stringify(error, null, 2)} />
    );
  }

  return (
    <div className="grid gap-4">
      <div className="flex justify-center">
        <SearchAnimeForm getAnimeSearchApiArg={getAnimeSearchApiArg} />
      </div>
      <AnimeBentoGrid data={data.data} />
      {data.pagination && (
        <PaginationAnimeSearch
          paginationPlus={data}
          getAnimeSearchApiArg={getAnimeSearchApiArg}
        />
      )}
    </div>
  );
};

export default SearchPage;
```

### This is a lot of work, why not useEffect + useState?

If you come from React tutorial hell (all of us have been there), you may think _"I can fecth data with a useEffect and store the result in a useState, it is not that complicated and it seems to be less work."_

![react fetch data example](/uploads/2024-03-24-anime-poster-generator-4/Screenshot2024-03-25155400.png)

Let me answer that with a quote out of "React for Haters" video:

> useEffect is specially fun and was originally going to be called useFootGun.

{{< youtube HyWYpM_S-2c >}}

In React, especially when talking about fetching data, is extremely easy to do it wrong. So I will need you to just believe me here: use a library. Here's a video of theo talking more about it:

{{< youtube vxkbf5QMA2g >}}

## What to do when the generated code does not do what you need?

I had this situation: When requesting for a poster to anime-poster-generator-backend, it answers an application/pdf (in javascript world, a [blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob)).

For some javascript magical reason, sadly the generated endpoint wasn't quite good enough: it was lacking a responseHandler.

The fix itself is very easy: add a responseHandler that opens the blob in a new tab. The problem is, that implied modifing auto-generated code... That goes totally against what I stated earlier in this blog!

How to proceed then? [injectEndpoints in the client](https://redux-toolkit.js.org/rtk-query/usage/code-splitting)! What is injecting an endpoint? Is this [Dependency Injection](https://en.wikipedia.org/wiki/Dependency_injection#)? How is this working? I would love to answer all of that, but **I have no idea**. I'm just a backend dev doing what I do best: making things work.

Here's the result: a copy-pasted of the generated endpoint + the missing responseHandler.

```ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  MakePosterApiArg,
  MakePosterApiResponse,
} from "../../generated/rtk-query/animePosterGeneratorBackendApi";

export const animePosterGeneratorBackendClient = createApi({
  reducerPath: "animePosterGeneratorBackendClient",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_ANIME_POSTER_GENERATOR_BACKEND_BASE_URL,
  }),
  endpoints: () => ({}),
});

//created custom endpoint that is able to treat blobs
//based on https://github.com/reduxjs/redux-toolkit/issues/1522#issuecomment-1167482553
const injectedRtkApi = animePosterGeneratorBackendClient.injectEndpoints({
  endpoints: (build) => ({
    makePosterAsBlob: build.mutation<MakePosterApiResponse, MakePosterApiArg>({
      query(args) {
        return {
          url: `/poster`,
          method: "POST",
          body: args.posterContent,
          responseHandler: async (response) => {
            const url = window.URL.createObjectURL(await response.blob());
            window.open(url, "_blank");
          },
          cache: "no-cache",
        };
      },
    }),
  }),
  overrideExisting: false,
});

export const { useMakePosterAsBlobMutation } = injectedRtkApi;
```

So now when in need of the useMakePosterMutation, I just gotta import the one I created instead of the autogenerated one. This has a drawback: I had to write an endpoint, instead of relying on an autogenerated one. That's time lost and will need time to be mantained if things changes.

```tsx
import { SubmitHandler, useForm } from "react-hook-form";
import {
  MakePosterApiArg,
  PosterContent,
} from "../../../../../generated/rtk-query/animePosterGeneratorBackendApi";
import { useMakePosterAsBlobMutation } from "@/clients/animePosterGeneratorBackendClient";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

const GenerateWithDefaultImage = ({
  posterContent,
}: {
  posterContent: PosterContent;
}) => {
  const form = useForm<MakePosterApiArg>({ defaultValues: { posterContent } });
  const [makePosterAsBlob] = useMakePosterAsBlobMutation();

  const onSubmit: SubmitHandler<MakePosterApiArg> = (makePosterApiArg) => {
    makePosterAsBlob(makePosterApiArg);
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Button type="submit">Generate Poster</Button>
        </div>
      </form>
    </Form>
  );
};

export default GenerateWithDefaultImage;
```

## What's next?

I'm gonna drop the series here for a while. When returning on it, I want to deploy it somewhere.

Right now I'm gonna be busy with:

- **Applying to random Portuguese companies:**

  - So far ghosted by everyone but two.
  - Applying for jobs you are not even sure you are qualified enough is a healthy practice as a developer. Helps you understand what are your strong points and what to improve
  - Citating coach Frank: _"Make contact. Break the ice. Establish a relationship. Mantain and develop the relationship. Communication."_
  - Talking with talent recruiters is to me a very entretaining activity.
    {{< youtube x71Rm0MWVHY >}}

- **At DEVSU (one of the companies I work at):**
  - The very important people that decide my salary won't seat with me for an annual review until I complete some courses in an educational platform of their choice, to which I gotta pay from my money or use the educational bonus they give me (which at the end of the day, is my money).
  - I find this a huge bullsh\*t to be honest. Bruh I've been getting certifications from the bank you are making me work at:
    - [Java - Mythical](https://drive.google.com/file/d/1KLyjpp5LkGLyPqN6MI4cMSoI_au0ZTtp/view?usp=sharing)
    - [Mutation Testing](https://drive.google.com/file/d/1LwXHdNoykp_mQxs3Jo4pMMiJy34f_WFR/view?usp=sharing)
    - [Secure Coding](https://drive.google.com/file/d/1RCuZ0HFi0OZaAHvhR_S99p-hjhvrH_pJ/view)
    - [Database Standards](https://drive.google.com/file/d/1gPIrGVEsBwN58tAdoX5RNjNyWjBlZj0E/view?usp=drive_link)
    - [Good Database Practices](https://drive.google.com/file/d/1wES8N8_c47TmSvH2703PejGNTEE2mBfC/view?usp=drive_link)
    - [Java - Elite](https://drive.google.com/file/d/1zrM9CsskGtgbFLhdKlSeNYM_HzIDLQHn/view?usp=drive_link)
    - [Java - Standards](https://drive.google.com/file/d/1B641YzqLzrWbwOPu7oIxRW6CJrW9PDUo/view?usp=drive_link)
  - Can't help but think it is stupid you want me to demostrate that I know Java after **a year coding in Java**. But meh, whatever, will play by their rules (what a waste of time though).
- **At Atica (the other company I work at):**
  - A developer who lost his job when the Argentinian goverment changed, got his job back. So yay I'm not alone anymore. Some extra hands are always appreciated.
  - I really wanna kickstart a SIGEM migration, from monolith to microservices. But first I gotta scout the current situation of everything: codebase, databases, infrastructure. A good first documentation stage is gonna give me a clear picture about if it is even possible.
- Spring (the season, not the Java framework my life spins around at) is starting, that means **Spring anime season!**. The ones that are catching my eye so far are:
  - [Date a Live V](https://myanimelist.net/anime/52196/Date_A_Live_V) (Yes I'm guilty of simping for Kurumi, it is what it is).
  - [Hananoi-kun to Koi no Yamai](https://myanimelist.net/anime/55597/Hananoi-kun_to_Koi_no_Yamai): by reading the comments at the youtube trailer, seems to be based on a really good "hopeless romantic" manga. So expectations are high here.
  - [Sasayaku You ni Koi wo Utau](https://myanimelist.net/anime/54233/Sasayaku_You_ni_Koi_wo_Utau): I've never watched a yuri romance before.
  - [Seiyuu Radio no Uraomote](https://myanimelist.net/anime/53912/Seiyuu_Radio_no_Uraomote): I've never watched a yuri romance before x2.

So yeah... at least I wrote 7 blogs during March. This was a nice productive streak. See ya around! <🐤/>

![terreiro do paco](/uploads/2024-03-24-anime-poster-generator-4/IMG_20240316_175801.jpg)
