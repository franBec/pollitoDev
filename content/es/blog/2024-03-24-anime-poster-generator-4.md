---
author: "Franco Becvort"
title: "Anime Poster Generator 4: Cómo un backend intenta hacer frontend"
date: 2024-03-24
description: "Review del repo anime-poster-generator-frontend"
categories: ["Anime Poster Generator"]
thumbnail: /uploads/2024-03-24-anime-poster-generator-4/IMG_20240316_182242.jpg
---

La imagen en miniatura no tiene ninguna relación con el contenido del blog. Es solo una foto que tomé del arte mural de la [estación de metro Cais do Sodré](https://www.metrolisboa.pt/viajar/cais-do-sodre/).

Esta es una continuación de [Anime Poster Generator 3: Puedo hacer frontend](/es/blog/2024-03-21-anime-poster-generator-3).

Todo el código mostrado aquí puedes encontrarlo en el repo de github [anime-poster-generator-frontend](https://github.com/franBec/anime-poster-generator-frontend).

## ¿Cómo abordé este desafío?

Creo que en cualquier situación es importante identificar primero las limitaciones y encontrar estrategias para solucionarlas. Aquí estaban los míos:

- Mi experiencia y conocimientos de UI/UX son casi nulos. No tengo buen gusto cuando se trata de elegir colores, tamaños, fuentes y todo eso de "hacer que las cosas se vean bonitas".
  - Sigamos soluciones bien pensadas y preestablecidas: [tailwind](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), [aceternity](https://ui.aceternity.com/)
- Mi conocimiento de Typecript es un poco tosco. ¿Cómo solucionaré las situaciones complejas que puedan surgir? Lo mismo con React...
  - Bienvenido a 2024, ChatGPT completo (más algo de sentido común).

## Objetivos

Hice este proyecto frontend con tres objetivos principales en mente:

- Intento de lograr todas las "User Stories" que propuse en [Anime Poster Generator 1: Bocetando la idea](/es/blog/2024-03-13-anime-poster-generator). Resumidos son:
  - Buscar animes.
  - Seleccione el anime deseado.
  - Generar póster con imagen anime original.
  - Adjunte y use imágenes personalizadas.
  - Descargar cartel.
- Salir de mi zona de confort de Java.
- Utilizar esto como prueba de que el desarrollo basado en contratos puede funcionar fuera de Java.

## anime-poster-generator-frontend repo

El repositorio se creó siguiendo [shadcn/ui Next.js docs](https://ui.shadcn.com/docs/installation/next), por lo que su estructura de carpetas es similar a la mayoría de los proyectos de Next.js.

![repo files](/uploads/2024-03-24-anime-poster-generator-4/Screenshot2024-03-24214531.png)

### Ejemplo de un componente .tsx

No explicaré en profundidad cada archivo, porque hay muchos archivos. Pero principalmente, para ser honesto, la mayor parte de la explicación de los archivos tsx sería "Busqué en Google _componente que necesitaba en tailwind_, copié, pegué, cambié lo que se necesitaba para que encajara, y seguí adelante.

Ejemplo: el archivo src\components\animePosterGenerator\anime\mal_id\animeData.tsx es responsable de esta vista:

![animeData](/uploads/2024-03-24-anime-poster-generator-4/screencapture-localhost-3000-anime-43608-2024-03-24-21_49_21.png)

Una imagen a la izquierda, información a la derecha. En la información, podemos ver un texto similar a un título, algo de información debajo del título y un párrafo de descripción... Esto es lo mismo que el detalle de un producto en la página de una tienda.

Después de buscar "Viento de cola de detalles del producto" y desplazarme por algunas opciones, [elegí ésta](https://tailwindcomponents.com/component/product-detail):

![product-detail](/uploads/2024-03-24-anime-poster-generator-4/screencapture-tailwindcomponents-component-product-detail-landing-2024-03-24-21_53_41.png)

Puedes ver un poco el parecido, especialmente cuando miras las clases de tailwind en el código. Pero hay que darle crédito a quien lo merece (yo), me esforcé un poco para que se adaptara a lo que estaba buscando. Entonces, sí, el código se ve similar, pero no es un copy-paste.

Aquí está el código final del componente:

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

### ¿Qué es /generated?

En el último fragmento de código, puedes encontrar un import interesante:

```tsx
import { AnimeFull } from "../../../../../generated/rtk-query/jikanApi";
```

¿Qué podría ser? Por el contexto, podemos suponer que es un tipo de TypeScript generado, que tiene algo que ver con rtk-query y jikanApi. Sólo para estar seguros, pidamos a ChatGPT su opinión al respecto.

> ¿Cuál es el papel de AnimeFull en el código de este componente?

Aquí está la respuesta dada:

> En el código del componente proporcionado, `AnimeFull` parece ser un tipo TypeScript importado de un directorio generado, probablemente el resultado de una herramienta de generación automática de código que interactúa con la API Jikan, una API no oficial de MyAnimeList. Este tipo se utiliza para escribir fuertemente el prop `data` en el componente `AnimeData`, asegurando que el objeto pasado como `data` se adhiera a la estructura y los tipos definidos por el tipo `AnimeFull`.

> Esta tipificación fuerte proporciona varios beneficios:

> 1. **Seguridad de tipos**: Garantiza que el componente `AnimeData` reciba datos en el formato esperado, que incluye campos específicos como `score`, `rank`, `popularity`, `title`, `url`, y `sinopsis`. Esto ayuda a evitar errores de tiempo de ejecución debido a estructuras o tipos de datos inesperados.

> 2. **Autocompletado e Intellisense**: en un entorno de desarrollo que admita TypeScript, los desarrolladores que trabajan con el componente `AnimeData` pueden disfrutar del autocompletado y de la documentación en línea para el prop `data`, lo que facilita la comprensión de qué datos están disponibles y cómo se puede utilizar.

> 3. **Mantenibilidad**: Al definir claramente la estructura esperada del prop "data", el código se vuelve más fácil de mantener y actualizar. Si la estructura de "AnimeFull" cambia, TypeScript resaltará los errores en los que el componente "AnimeData" puede no ser compatible con la nueva estructura, guiando a los desarrolladores hacia las actualizaciones necesarias.

> 4. **Documentación**: El uso de un tipo específico como `AnimeFull` sirve como una forma de documentación, aclarando el contenido esperado y el formato de los datos que el componente necesita para funcionar correctamente.

> En resumen, `AnimeFull` en este contexto define la estructura y los tipos de datos esperados por el componente `AnimeData`, contribuyendo a la seguridad de tipos, un desarrollo más fácil y la mantenibilidad del código.

Incluso sabe qué es jikanApi sin que yo ni siquiera se lo diga ni se lo pida. Estas IA son cada vez más inteligentes.

Además, al observar la estructura de carpetas, hay algunos archivos y carpetas extraños que no tienen nada que ver con Next.js:

![repo files w/red](/uploads/2024-03-24-anime-poster-generator-4/Screenshot2024-03-24214531-copy.png)

## RTK Query

Para implementar prácticas de desarrollo basado en contratos, quería encontrar una herramienta similar a lo que [openapi-generator-maven-plugin](https://mvnrepository.com/artifact/org.openapitools/openapi-generator-maven-plugin/7.4.0) es en Java Spring Boot.

![openapi-generator-maven-plugin.png](/uploads/2024-03-18-pollitos-manifest-on-java-spring-boot-cdd-2/openapi-generator-maven-plugin.png)

Después de mirar algunas opciones, me decidí por [RTK Query](https://redux-toolkit.js.org/) y sus capacidades de [Code Generation](https://redux-toolkit.js.org/rtk-query/usage/code-generation).

Al acceder a la página principal de RTK Query, te encuentras con esto:

> El conjunto de herramientas oficial, opinionado y con baterías incluidas para el desarrollo eficiente de Redux

No podría estar más feliz de leer eso, aunque no tenía idea de lo que significaba "desarrollo Redux".

Intenté saltar al infierno de los tutoriales, pero decidí que no valía la pena y, en cambio, seguí ejemplos que encontré en Internet + ChatGPT + sentido común como desarrollador. Gran reconocimiento a Steven Lemon y su blog sobre [Generación de código en React with RTK Query](https://steven-lemon182.medium.com/code-generation-in-react-with-rtk-query-e2410db6c868).

Entonces, ¿hace el trabajo esperado? ¡Sí! Pero necesita algunos ajustes.

### El código generado debe ser consistente

¿Qué quiero decir con eso? Al seguir el blog de Steven y los documentos de Code Generation Redux, obtendrás un archivo con el código completo listo para usar:

![outline](/uploads/2024-03-24-anime-poster-generator-4/Screenshot2024-03-25103142.png)

Genial, ¿no? Sí, pero **se espera que el dev lo guarde y sea responsable de ello.**

Quizás pienses _"Eso no es gran cosa, git add . git commit, listo"_. Pero aquí está el truco. ¿Qué pasaría si en el futuro algún desarrollador quisiera hacer trampa para evitar una advertencia o un error? (el clasico number|undefined can't be assigned to a number const). La forma más sencilla sería cambiar el lugar donde está la definición.

Podemos llamar a esto una acción irresponsable y culpar al desarrollador de ser vago. Pero...

- Quizás este código perdió a todos sus desarrolladores originales.
- Tal vez estos nuevos desarrolladores no se den cuenta de que el archivo es código generado y piensen "wow, la gente antes que nosotros hizo todas estas definiciones, mantengámoslas actualizadas".
- Quizás... [inserte aquí alguna otra situación que termine en que un desarrollador cambie la definición generada]

Aquí la culpa es más de los desarrolladores originales por no dejar clara la intención del archivo. Y no, **nombrar el archivo algo_GENERADO.ts no es suficiente**.

¿Y si cambia el contrato? Ahora tengo que regenerar el código, pero si alguien más escribió encima del código generado previamente, todo eso se sobrescribirá y desaparecerá.

Estos son mis criterios para lo que se genera el código:

> El código generado debe ser **de solo lectura**, **desechable** y **generado**.

Este enfoque garantiza que se mantengan la integridad y la coherencia de las bases de código, evitando los peligros de las modificaciones manuales que podrían introducir errores o inconsistencias.

- Hacer hincapié en el aspecto de **solo lectura** subraya la importancia de no modificar directamente el código generado, ya que dichos cambios pueden sobrescribirse fácilmente con generaciones de código posteriores.
- Al enmarcar el código generado como **desechable**, el texto transmitiría la idea de que este código no es valioso ni irremplazable, sino más bien un activo transitorio y fácilmente recreable que debe integrarse y actualizarse perfectamente dentro del flujo de trabajo de desarrollo.
- El código generado debe ser **generado**, no escrito manualmente por los desarrolladores, para garantizar la eficiencia, la coherencia y la reducción de errores mediante la automatización de tareas de codificación repetitivas y complejas, lo que permite a los desarrolladores centrarse en aspectos más estratégicos del desarrollo.

### Garantizar la coherencia

Hacer que el código generado sea de solo lectura y desechable es extremadamente fácil: simplemente agregar al .gitignore

El desafío aquí es hacer que el código generado, bueno, se genere. Si se va a eliminar el código, necesito una forma confiable de generarlo una y otra vez.

En Java Spring Boot, openapi-generator-maven-plugin logra esto adjuntándose a la tarea de compilación de maven. Entonces tal vez podría recrear este comportamiento con un script package.json, pero ¿cómo? Una vez más, ChatGPT viene al rescate.

Después de algunos intercambios entre el código de ChatGPT y mi comportamiento deseado, nació **generateRtkQuery.ts**.

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

Este código TypeScript define dos funciones, preProcessApi y processApi, y luego ejecuta una secuencia de operaciones que involucran estas funciones para administrar y generar código API basado en las especificaciones OpenAPI para un conjunto de APIs. Aquí hay un desglose de lo que hace cada parte:

preProcessApi:

- La función establece una ruta de directorio a ./generated/rtk-query, que está destinada a almacenar los archivos API generados.
- Comprueba si este directorio existe usando existSync. Si lo hace:
  - Lee el contenido del directorio con readdirSync.
  - Itera sobre cada archivo en el directorio y lo elimina usando unlinkSync. Esto borra los archivos antiguos generados antes de generar otros nuevos, manteniendo limpio el directorio.
  - Registra un mensaje que indica que se han borrado todos los archivos del directorio.
- Si el directorio no existe:
- Crea el directorio utilizando mkdirSync, incluidos los directorios principales necesarios.
- Registra un mensaje indicando que se ha creado el directorio.

processApi:

- Toma un nombre de API como argumento y configura una ruta para generar el archivo API, siguiendo el patrón ./generated/rtk-query/[apiName]Api.ts.
- Crea un archivo vacío en la ruta especificada usando writeFileSync. Esto garantiza que el archivo exista antes de intentar escribir el código API generado en él.
- Construye una cadena de comando para generar código API usando @rtk-query/codegen-openapi, que es una herramienta para generar endpoints y hooks de Redux Toolkit Query (RTK Query) a partir de las especificaciones OpenAPI. El comando especifica la ruta al archivo de configuración de OpenAPI para la API determinada.
- Ejecuta el comando construido usando exec, que ejecuta el comando en un shell. La función de devolución de llamada maneja cualquier error, registra la salida estándar y registra la salida de error estándar, proporcionando información sobre el éxito o el fracaso de la operación.

Finalmente, creo un nuevo script npm:

```json
"generate-apis": "tsc generateRtkQueryCode.ts && node generateRtkQueryCode.js"
```

No olvide combinar el reducer del cliente y concatenar el middleware en el store... sea lo que sea que eso signifique. No me molesté en aprender cómo funciona redux, solo seguí la documentación.

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

Aquí hay un diagrama rápido de cómo funciona todo. Algo similar al plugin openapi-generator-maven, pero con sus cosas propias de JavaScript.

![redux generate diagram](/uploads/2024-03-24-anime-poster-generator-4/Untitled-2024-02-21-1828.png)

Aquí hay un fragmento de un código generado que se está utilizando:

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

### Esto es mucho trabajo, ¿por qué no useEffect + useState?

Si vienes del infierno de los tutoriales de React (todos hemos estado allí), puedes pensar: _"Puedo hacer fetch de datos con un useEffect y almacenar el resultado en un useState, no es tan complicado y parece requerir menos trabajo"._

![react fetch data example](/uploads/2024-03-24-anime-poster-generator-4/Screenshot2024-03-25155400.png)

Permítanme responder eso con una cita del video "React for Haters":

> useEffect is specially fun and was originally going to be called useFootGun.

{{< youtube HyWYpM_S-2c >}}

En React, especialmente cuando se trata de recuperar datos, es extremadamente fácil hacerlo mal. Entonces necesitaré que confies en mí: usa una biblioteca. Aquí hay un vídeo de Theo hablando más sobre ello:

{{< youtube vxkbf5QMA2g >}}

## ¿Qué hacer cuando el código generado no hace lo que necesitas?

Tuve esta situación: cuando solicito un póster a anime-poster-generator-backend, responde un application/pdf (en el mundo javascript, un [blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob)).

Por alguna razón mágica de JavaScript, lamentablemente el endpoint generado no era lo suficientemente bueno: le faltaba un responseHandler.

La solución en sí es muy sencilla: agregue un responseHandler que abra el blob en una nueva pestaña. El problema es que eso implicaba modificar el código generado automáticamente... ¡Eso va totalmente en contra de lo que dije anteriormente en este blog!

¿Cómo proceder entonces? [injectEndpoints en el cliente](https://redux-toolkit.js.org/rtk-query/usage/code-splitting)! ¿Qué es inyectar un punto final? ¿Es esto [Inyección de dependencia](https://en.wikipedia.org/wiki/Dependency_injection#)? ¿Cómo funciona esto? Me encantaría responder todo eso, pero **no tengo idea**. Solo soy un desarrollador backend que hace lo que mejor sabe: hacer que las cosas funcionen.

Este es el resultado: una copia y pegado del endpoint generado + el responseHandler que faltaba.

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

Entonces, ahora, cuando necesito useMakePosterMutation, solo tengo que importar el que creé en lugar del generado automáticamente. Esto tiene un inconveniente: tuve que escribir un endpoint, en lugar de depender de uno generado automáticamente. Eso es tiempo perdido y será necesario mantenerlo si las cosas cambian.

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

## ¿Que sigue?

Dejaré la serie aquí por un tiempo. Al regresar, quiero implementarlo en alguna parte. Ahora mismo estaré ocupado con:

- **Aplicando a empresas portuguesas aleatorias:**

  - Hasta ahora, todos menos dos me han ignorado.
  - Solicitar trabajos en los que ni siquiera estás seguro de estar lo suficientemente calificado es una práctica saludable como desarrollador. Te ayuda a entender cuáles son tus puntos fuertes y qué mejorar.
  - Citando al coach Frank: _"Hacer contacto. Romper el hielo. Establecer una relación. Mantener y desarrollar la relación. Comunicación."_
  - Hablar con reclutadores de talento me resulta una actividad muy entretenida.
    {{< youtube x71Rm0MWVHY >}}

- **En DEVSU (una de las empresas en las que trabajo):**
  - Las personas muy importantes que deciden mi salario no se sentarán conmigo para una revisión anual hasta que complete algunos cursos en una plataforma educativa de su elección, a la que debo pagar de mi dinero o utilizar el bono educativo que me dan (que al final del día, es mi dinero).
  - Para ser honesto, esto me parece una gran m\*edra. Hermano, he estado obteniendo certificaciones del banco en el que me estás haciendo trabajar:
  - [Java - Mítico](https://drive.google.com/file/d/1KLyjpp5LkGLyPqN6MI4cMSoI_au0ZTtp/view?usp=sharing)
  - [Pruebas de Mutación](https://drive.google.com/file/d/1LwXHdNoykp_mQxs3Jo4pMMiJy34f_WFR/view?usp=sharing)
  - [Codificación Segura](https://drive.google.com/file/d/1RCuZ0HFi0OZaAHvhR_S99p-hjhvrH_pJ/view)
  - [Élite - Estándares de Bases de Datos V1.2](https://drive.google.com/file/d/1gPIrGVEsBwN58tAdoX5RNjNyWjBlZj0E/view?usp=drive_link)
  - [Élite - Buenas prácticas de bases de datos](https://drive.google.com/file/d/1wES8N8_c47TmSvH2703PejGNTEE2mBfC/view?usp=drive_link)
  - [Élite - Java](https://drive.google.com/file/d/1zrM9CsskGtgbFLhdKlSeNYM_HzIDLQHn/view?usp=drive_link)
  - [Estándares - Java](https://drive.google.com/file/d/1B641YzqLzrWbwOPu7oIxRW6CJrW9PDUo/view?usp=drive_link)
  - No puedo evitar pensar que es estúpido que quieras que te demuestre que conozco Java después de **un año codificando en Java**. Pero bueno, lo que sea, seguiré sus reglas (aunque qué pérdida de tiempo).
- **En Atica (la otra empresa en la que trabajo):**
- Un desarrollador que perdió su trabajo cuando cambió el gobierno argentino, recuperó su trabajo. Así que ya no estoy solo. Siempre se agradecen algunas manos extra.
  - Realmente quiero iniciar una migración SIGEM, de monolito a microservicios. Pero primero tengo que explorar la situación actual de todo: código, bases de datos, infraestructura. Una buena primera etapa de documentación me dará una idea clara de si es posible.
- La primavera (la temporada, no el marco de Java en el que gira mi vida) está comenzando, eso significa **¡temporada de anime de primavera!**. Los que me están llamando la atención hasta ahora son:
  - [Date a Live V](https://myanimelist.net/anime/52196/Date_A_Live_V) (Si, soy culpable de simpear por Kurumi, es lo que hay).
  - [Hananoi-kun to Koi no Yamai](https://myanimelist.net/anime/55597/Hananoi-kun_to_Koi_no_Yamai): Al leer los comentarios en el avance de YouTube, parece estar basado en un manga "hopeless romantic" realmente bueno. Así que aquí las expectativas son altas.
  - [Sasayaku You ni Koi wo Utau](https://myanimelist.net/anime/54233/Sasayaku_You_ni_Koi_wo_Utau): Nunca antes vi un romance de yuri.
  - [Seiyuu Radio no Uraomote](https://myanimelist.net/anime/53912/Seiyuu_Radio_no_Uraomote): Nunca antes vi un romance de yuri x2.

Así que sí... al menos escribí 7 blogs durante marzo. Esta fue una buena racha productiva. ¡Nos vemos! <🐤/>

![terreiro do paco](/uploads/2024-03-24-anime-poster-generator-4/IMG_20240316_175801.jpg)
