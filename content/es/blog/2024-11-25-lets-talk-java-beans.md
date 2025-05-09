---
author: "Franco Becvort"
title: "Hablemos de Java: Beans"
date: 2024-11-25
description: "La columna vertebral del mecanismo DI de Spring"
categories: ["Let's talk Java"]
thumbnail: /uploads/2024-11-25-lets-talk-java-beans/anime-girl-profile-while-drinking-coffee-szrx2slngz2l7abp.jpg
---

Bean... Es uno de esos términos que nosotros, los desarrolladores Java, lanzamos tan seguido que a veces nos olvidamos de detenernos a apreciar su elegancia. Descubramos qué es realmente un Spring bean.

<!-- TOC -->
  * [¿Qué es un bean?](#qué-es-un-bean)
  * [Características clave de un Spring bean](#características-clave-de-un-spring-bean)
    * [Ejemplo](#ejemplo)
  * [Inyección de dependencias para conectar beans](#inyección-de-dependencias-para-conectar-beans)
    * [Métodos de inyección](#métodos-de-inyección)
    * [¿Por qué usar inyección de dependencias?](#por-qué-usar-inyección-de-dependencias)
  * [¿Por qué singleton por defecto?](#por-qué-singleton-por-defecto)
    * [¿Cuándo querrías cambiar el comportamiento singleton?](#cuándo-querrías-cambiar-el-comportamiento-singleton)
    * [¿Cuándo pegarse a los singletons?](#cuándo-pegarse-a-los-singletons)
  * [El ciclo de vida de un Spring bean](#el-ciclo-de-vida-de-un-spring-bean)
    * [Hooks del ciclo de vida en detalle](#hooks-del-ciclo-de-vida-en-detalle)
    * [Ciclo de vida completo en código](#ciclo-de-vida-completo-en-código)
    * [Ciclo de vida de bean con scopes](#ciclo-de-vida-de-bean-con-scopes)
    * [¿Cuándo usarías estos hooks?](#cuándo-usarías-estos-hooks)
  * [Conclusión](#conclusión)
<!-- TOC -->

## ¿Qué es un bean?

En el framework Spring, un bean es simplemente un objeto que gestiona el contenedor IoC (Inversion of Control) de Spring. Es la columna vertebral del mecanismo de inyección de dependencias (DI) de Spring.

Para desglosarlo:

- **Spring IoC Container:** Se encarga de crear, configurar y gestionar el ciclo de vida de los beans.
- **Bean:** Cualquier objeto instanciado, configurado y gestionado por el contenedor.

## Características clave de un Spring bean

- **Definido en el contexto**
   - Los beans se definen en la configuración de Spring, ya sea mediante:
       - Anotaciones (por ej., `@Component`, `@Service`, `@Repository`, `@Configuration`).
       - Configuración XML (si tenés nostalgia de los inicios de los 2000).
       - Configuración basada en Java (métodos `@Bean` en clases anotadas con `@Configuration`).
- **Singleton por defecto**
   - Por defecto, un Spring bean es singleton (una instancia por contenedor). Esto se puede personalizar con scopes como `@Scope("prototype")`.
- **Inyección de dependencias**
   - Los beans pueden inyectarse entre sí usando `@Autowired`, inyección por constructor o setter injection. Esto fomenta el desacoplamiento y facilita la realización de tests.
- **Gestión del ciclo de vida**
  - El contenedor controla el ciclo de vida de un bean, desde su instanciación hasta su destrucción. Podés definir hooks personalizados con anotaciones como `@PostConstruct` y `@PreDestroy`.

### Ejemplo

Acá tenés un bean sencillo:

```java
@Component
public class CoffeeMaker {
    public String brew() {
        return "¡Preparando una taza fresca de Java!";
    }
}
```

Y otro bean que depende de él:

```java
@Service
public class CoffeeShop {
    private final CoffeeMaker coffeeMaker;

    public CoffeeShop(CoffeeMaker coffeeMaker) {
        this.coffeeMaker = coffeeMaker;
    }

    public void openShop() {
        System.out.println(coffeeMaker.brew());
    }
}
```

El contenedor de Spring detecta las anotaciones `@Component` y `@Service`, crea beans para estas clases y los conecta.

## Inyección de dependencias para conectar beans

La inyección de dependencias (DI) es un patrón de diseño donde las dependencias de un objeto son provistas por una fuente externa (el contenedor IoC de Spring) en lugar de que el objeto las cree por sí mismo.

Este es el mejor video que encontré explicando el tema:

{{< youtube J1f5b4vcxCQ >}}

En Spring, la DI se usa para conectar beans entre sí, haciendo que las aplicaciones estén poco acopladas y sean más fáciles de testear y mantener.

### Métodos de inyección

1. **Inyección en el campo:** Usá `@Autowired` directamente en una variable.

    ```java
    @Autowired
    private MyService myService;
    ```

2. **Inyección por constructor (preferida):** Las dependencias se proporcionan a través del constructor.

    ```java
    @Service
    public class MyService {
        private final MyDependency dependency;
    
        public MyService(MyDependency dependency) {
            this.dependency = dependency;
        }
    }
    ```

3. **Inyección por setter:** Las dependencias se inyectan mediante un método setter.

    ```java
    private MyDependency dependency;
    
    @Autowired
    public void setDependency(MyDependency dependency) {
        this.dependency = dependency;
    }
    ```

### ¿Por qué usar inyección de dependencias?

- Promueve el desacoplamiento entre objetos.
- Hace que el testing sea más sencillo al permitir inyectar dependencias mockeadas.
- Centraliza la gestión de objetos en el contenedor de Spring.

La inyección por constructor es típicamente preferida porque asegura que las dependencias sean inmutables y obligatorias para el funcionamiento del objeto.

## ¿Por qué singleton por defecto?

- **Eficiencia**
  - Crear una única instancia de un bean y compartirla a lo largo de la aplicación minimiza el uso de memoria y la sobrecarga de creación de objetos. Es mucho menos costoso que crear instancias nuevas repetidamente.
  - Los beans singleton funcionan bien para servicios sin estado (que es la mayoría en aplicaciones backend).
- **Consistencia**
  - El scope singleton asegura que la misma instancia se use en todas partes, promoviendo un comportamiento predecible y reduciendo la posibilidad de bugs sutiles por la creación accidental de múltiples instancias con estado.
- **Inyección de dependencias**
  - Los beans singleton simplifican la inyección de dependencias. Inyectás la misma instancia en toda la aplicación, y todos reciben una versión compartida y consistente.
- **Seguridad en entornos multihilo**
  - Para servicios sin estado (el caso más común), un bean singleton es inherentemente thread-safe porque no mantiene un estado interno específico para cada petición o hilo.

### ¿Cuándo querrías cambiar el comportamiento singleton?

El modelo singleton no siempre es apropiado. Acá van algunas situaciones donde cambiarlo tiene sentido:

- **Beans con estado (por ej., con scope Request/Session)**

  - Si el bean mantiene datos específicos de una sesión de usuario o de una petición HTTP, usar un scope singleton causaría compartir datos incorrectamente entre usuarios/peticiones.
  - Usá `@RequestScope` o `@SessionScope` en esos casos.

    ```java
    @Component
    @RequestScope
    public class ShoppingCart {
        private final List<Item> items = new ArrayList<>();
    
        public void addItem(Item item) {
            items.add(item);
        }
    
        public List<Item> getItems() {
            return items;
        }
    }
    ```

- **Scope prototype para comportamiento por instancia**
  - Si necesitás una nueva instancia del bean cada vez que se le solicite, usá `@Scope("prototype")`.
  - Esto es común para objetos que son con estado o de vida corta (por ej., un objeto utilitario que mantiene un estado temporal).
  - Cada inyección o recuperación desde el contenedor crea una nueva instancia.

    ```java
    @Component
    @Scope("prototype")
    public class TemporaryWorker {
        private final String id = UUID.randomUUID().toString();
    
        public String getId() {
            return id;
        }
    }
    ```

### ¿Cuándo usar singleton?

- **Servicios sin estado:** La mayoría de las clases de servicio, como aquellas anotadas con `@Service` o `@Repository`, son sin estado y deben seguir siendo singletons.
- **Clases de configuración o utilidades:** Las clases que actúan como contenedores de configuración o que proveen métodos utilitarios (por ej., para caching, logging) se benefician del scope singleton.

Spring por defecto usa singleton porque se ajusta al caso de uso más común: servicios compartidos y sin estado. Deberías cambiar el scope cuando el estado o la duración sean críticos para la función del bean (por ej., comportamiento por petición/sesión, datos específicos de una tarea).

Si te encontrás preguntando si necesitás un bean no singleton, siempre preguntate:

- _¿Este bean mantiene estado?_
- _¿El estado es único por usuario/sesión/petición/tarea?_

## El ciclo de vida de un Spring bean

1. **Instanciación**.
    - El contenedor IoC de Spring crea una instancia del bean, ya sea mediante su constructor o un método factory.
2. **Inyección de dependencias**.
    - Después de la instanciación, el contenedor inyecta las dependencias (ya sea por constructor, setter o inyección en el campo).
3. **Hooks post-inicialización**.
    - Los beans pasan por hooks post-inicialización para configuraciones o setups adicionales:
        - Si el bean implementa la interfaz `InitializingBean`, se llama a su método `afterPropertiesSet()`.
        - Si el bean tiene un método anotado con `@PostConstruct`, este se ejecuta.
4. **Listo para usar**.
    - El bean ya está completamente inicializado, con sus dependencias inyectadas, y listo para usarse.
5. **Destrucción**.
    - Cuando la aplicación se apaga, el bean se destruye. Spring provee hooks para limpieza personalizada:
        - Si el bean implementa `DisposableBean`, se llama a su método `destroy()`.
        - Si el bean tiene un método anotado con `@PreDestroy`, se ejecuta ese método.

### Hooks del ciclo de vida en detalle

1. **Hooks de inicialización**
   - Se usan frecuentemente para inicializar recursos, iniciar hilos en segundo plano o realizar tareas de setup.
   - Opciones:
       - `@PostConstruct`: Un enfoque moderno basado en anotaciones.
       - `InitializingBean.afterPropertiesSet()`: Enfoque basado en interfaz.
       - Métodos de inicialización personalizados: Declarados con el atributo `@Bean(initMethod = "methodName")`.

    ```java
    @Component
    public class ExampleBean {
        @PostConstruct
        public void initialize() {
            System.out.println("¡El bean se ha inicializado!");
        }
    }
    ```

2. **Hooks de destrucción**

   - Se usan para liberar recursos, cerrar conexiones o realizar tareas de limpieza.
   - Opciones:
       - `@PreDestroy`: El enfoque basado en anotaciones recomendado.
       - `DisposableBean.destroy()`: Enfoque basado en interfaz.
       - Métodos de destrucción personalizados: Declarados con el atributo `@Bean(destroyMethod = "methodName")`.

    ```java
    @Component
    public class ExampleBean {
        @PreDestroy
        public void cleanup() {
            System.out.println("¡El bean se está destruyendo!");
        }
    }
    ```

### Ciclo de vida completo en código

```java
@Component
public class ExampleBean implements InitializingBean, DisposableBean {
    public ExampleBean() {
        System.out.println("1. Se instancia el bean.");
    }

    @PostConstruct
    public void postConstruct() {
        System.out.println("2. @PostConstruct: El bean se inicializa.");
    }

    @Override
    public void afterPropertiesSet() {
        System.out.println("3. afterPropertiesSet(): Lógica de inicialización personalizada.");
    }

    @PreDestroy
    public void preDestroy() {
        System.out.println("4. @PreDestroy: Limpieza antes de la destrucción.");
    }

    @Override
    public void destroy() {
        System.out.println("5. destroy(): Limpieza final.");
    }
}
```

Output:

```log
1. Se instancia el bean.
2. @PostConstruct: El bean se inicializa.
3. afterPropertiesSet(): Lógica de inicialización personalizada.
4. @PreDestroy: Limpieza antes de la destrucción.
5. destroy(): Limpieza final.
```

### Ciclo de vida de bean con scopes

- **Beans singleton:** El ciclo de vida ocurre una sola vez, cuando el contenedor arranca y se apaga.
- **Beans prototype:** El ciclo de vida se produce en cada nueva instancia. Los callbacks de destrucción (como `@PreDestroy`) no se invocan automáticamente, ya que el contenedor no gestiona el ciclo de vida completo de los beans prototype.

### ¿Cuándo usarías estos hooks?

- **Inicialización**:
  - Para configurar recursos como conexiones a bases de datos, caches o pools de hilos.
  - Para realizar validaciones o chequeos de configuración.
- **Destrucción**:
  - Para cerrar conexiones a bases de datos.
  - Para detener pools de hilos o tareas en segundo plano.
  - Para limpiar archivos temporales o liberar bloqueos.

Spring te da un control muy fino sobre el ciclo de vida de un bean. Si bien hooks como `@PostConstruct` y `@PreDestroy` son los más modernos y ampliamente usados, el ciclo de vida es lo suficientemente flexible para incorporar lógica personalizada cuando sea necesario.

## Conclusión

- Los beans permiten la inyección de dependencias, lo que conduce a un código limpio y modular.
- Spring se encarga de tareas complejas como el ciclo de vida de los objetos y la gestión de dependencias, para que vos podás concentrarte en la lógica de negocio.