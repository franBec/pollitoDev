---
author: "Franco Becvort"
title: "Hablemos de Java: Beans"
date: 2024-11-25
description: "La columna vertebral del mecanismo DI de Spring"
categories: ["Let's talk Java"]
thumbnail: /uploads/2024-11-25-lets-talk-java-beans/anime-girl-profile-while-drinking-coffee-szrx2slngz2l7abp.jpg
---

<!-- TOC -->
  * [¿Qué es un Bean?](#qué-es-un-bean)
  * [Características clave de un Spring Bean](#características-clave-de-un-spring-bean)
    * [Ejemplo](#ejemplo)
  * [Inyección de dependencia para conectar beans](#inyección-de-dependencia-para-conectar-beans)
    * [Métodos de inyección](#métodos-de-inyección)
    * [¿Por qué utilizar la inyección de dependencia?](#por-qué-utilizar-la-inyección-de-dependencia)
  * [¿Por qué Singleton por defecto?](#por-qué-singleton-por-defecto)
    * [¿Cuándo querrías cambiar el comportamiento de Singleton?](#cuándo-querrías-cambiar-el-comportamiento-de-singleton)
    * [¿Cuándo seguir con los Singleton?](#cuándo-seguir-con-los-singleton)
  * [El ciclo de vida de un Spring Bean](#el-ciclo-de-vida-de-un-spring-bean)
    * [Hooks de ciclo de vida en detalle](#hooks-de-ciclo-de-vida-en-detalle)
    * [Ciclo de vida completo en código](#ciclo-de-vida-completo-en-código)
    * [Ciclo de vida de los beans con scopes](#ciclo-de-vida-de-los-beans-con-scopes)
    * [¿Cuándo utilizarías estos hooks?](#cuándo-utilizarías-estos-hooks)
  * [Conclusión](#conclusión)
<!-- TOC -->

Bean... Es uno de esos términos que los desarrolladores de Java usamos tanto que a veces nos olvidamos de detenernos y apreciar su elegancia. Descubramos qué es realmente un bean de Spring.

## ¿Qué es un Bean?

En el marco de Spring, un bean es simplemente un objeto que administra el contenedor IoC (Inversión de control) de Spring. Es la columna vertebral del mecanismo de inyección de dependencias (DI) de Spring.

Para desglosarlo:

- **Contenedor IoC de Spring:** Responsable de crear, configurar y administrar el ciclo de vida de los beans.
- **Bean:** Cualquier objeto instanciado, configurado y administrado por el contenedor.

## Características clave de un Spring Bean

**1. Definido en el contexto**

- Los beans se definen en la configuración de Spring, ya sea a través de:
  - Anotaciones (por ejemplo, `@Component`, `@Service`, `@Repository`, `@Configuration`).
  - Configuración XML (si sientes nostalgia de principios de los años 2000).
  - Configuración basada en Java (métodos `@Bean` en clases `@Configuration`).

**2. Singleton por defecto**

- De manera predeterminada, un bean de Spring es un singleton (una instancia por contenedor). Esto se puede personalizar con ámbitos como @Scope("prototype").

**3. Inyección de dependencia**

- Los beans se pueden inyectar entre sí mediante @Autowired, inyección de constructor o inyección de setter. Esto promueve el acoplamiento flexible y la capacidad de prueba.

**4. Gestión del ciclo de vida**

- El contenedor controla el ciclo de vida de un bean, desde la instanciación hasta la destrucción. Puedes definir hooks personalizados con anotaciones como @PostConstruct y @PreDestroy.

### Ejemplo
Aquí hay un bean simple:

```java
@Component
public class CoffeeMaker {
    public String brew() {
        return "Brewing a fresh cup of Java!";
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
El contenedor de Spring detecta las anotaciones @Component y @Service, crea beans para estas clases y las conecta.

## Inyección de dependencia para conectar beans

La inyección de dependencias (DI) es un patrón de diseño en el que las dependencias de un objeto las proporciona una fuente externa (el contenedor IoC de Spring) en lugar de que el propio objeto las cree.

Este es el mejor vídeo que existe que explica el tema:

{{< youtube J1f5b4vcxCQ >}}

En Spring, la DI se utiliza para conectar los beans, lo que hace que las aplicaciones estén acopladas de forma flexible y sean más fáciles de testear y mantener.

### Métodos de inyección

**1. Inyección de campo:** Utilice `@Autowired` directamente en un campo.
```java
@Autowired
private MyService myService;
```

**2. Inyección de constructor (preferido):** Las dependencias se proporcionan a través del constructor.
```java
@Service
public class MyService {
    private final MyDependency dependency;

    public MyService(MyDependency dependency) {
        this.dependency = dependency;
    }
}
```
**3. Inyección de setter:** Las dependencias se inyectan a través de un método setter.
```java
private MyDependency dependency;

@Autowired
public void setDependency(MyDependency dependency) {
    this.dependency = dependency;
}
```

### ¿Por qué utilizar la inyección de dependencia?
- Promueve el acoplamiento flexible entre objetos.
- Facilita tests al permitir la inyección de dependencias simuladas.
- Centraliza la gestión de objetos en el contenedor Spring.

Generalmente se prefiere la inyección de constructor porque garantiza que las dependencias sean inmutables y obligatorias para el funcionamiento del objeto.

## ¿Por qué Singleton por defecto?

**1. Eficiencia**

- Crear una única instancia de un bean y compartirla en toda la aplicación minimiza el uso de memoria y la sobrecarga de creación de objetos. Es mucho más económico que crear nuevas instancias repetidamente.
- Los beans singleton funcionan bien para servicios sin estado (que son la mayoría en la mayoría de las aplicaciones backend).

**2. Consistencia**

- El ámbito singleton garantiza que se use la misma instancia en todas partes, lo que promueve un comportamiento predecible y reduce las posibilidades de errores sutiles debido a la creación accidental de múltiples instancias con estado.

**3. Inyección de dependencia**

- Los beans singleton simplifican la inyección de dependencias. Se inyecta la misma instancia en toda la aplicación y todos obtienen una versión compartida y consistente.

**4. Thread-Safety**

- Para los servicios sin estado (el caso más común), un bean singleton es inherentemente seguro para subprocesos porque no mantiene ningún estado interno específico de una solicitud o subproceso.

### ¿Cuándo querrías cambiar el comportamiento de Singleton?

El modelo singleton no siempre es adecuado. A continuación, se indican algunas situaciones en las que tiene sentido modificarlo:

**1. Beans con estado (por ejemplo, con ámbito de solicitud/sesión)**

- Si el bean contiene datos específicos de una sesión de usuario o una solicitud HTTP, el uso de un ámbito singleton provocaría un intercambio incorrecto de datos entre usuarios/solicitudes.
- Utilice `@RequestScope` o `@SessionScope` en tales casos.

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

**2. Ámbito de prototipo para comportamiento por instancia**

- Si necesita una nueva instancia de un bean cada vez que se lo solicita, use `@Scope("prototype")`.
- Esto es común para objetos con estado o de corta duración (por ejemplo, un objeto de utilidad que mantiene un estado temporal).
- Cada inyección o recuperación del contenedor crea una nueva instancia.

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
### ¿Cuándo seguir con los Singleton?

- **Servicios sin estado:** la mayoría de las clases de servicio, como las anotadas con `@Service` o `@Repository`, no tienen estado y deben seguir siendo singletons.
- **Clases de configuración o de utilidad:** las clases que actúan como contenedores de configuración o proporcionan métodos de utilidad (por ejemplo, almacenamiento en caché, registro) se benefician del ámbito singleton.

Spring utiliza singleton de manera predeterminada porque se adapta al caso de uso más común: servicios compartidos sin estado. Debe cambiar el alcance cuando el estado o la duración se vuelven críticos para la función del bean (por ejemplo, comportamiento por solicitud/sesión, datos específicos de la tarea).

Si se pregunta si necesita un no singleton, siempre pregunte:

- _¿Este bean mantiene el estado?_
- _¿El estado es único por usuario/sesión/solicitud/tarea?_

## El ciclo de vida de un Spring Bean

**1. Instanciación**

- El contenedor IoC de Spring crea una instancia del bean, ya sea a través de su constructor o de un método de fábrica.

**2. Inyección de dependencias**

- Después de la instanciación, el contenedor inyecta todas las dependencias (a través de un constructor, un definidor o una inyección de campo).

**3. Hooks posteriores a la inicialización**

- Los beans pasan por hooks posteriores a la inicialización para realizar configuraciones adicionales:
  - Si el bean implementa la interfaz `InitializingBean`, se llama a su método `afterPropertiesSet()`.
  - Si el bean tiene un método anotado con `@PostConstruct`, se ejecuta ese método.

**4. Listo para usar**

- El bean ya está completamente inicializado, se han inyectado las dependencias y está listo para funcionar.

**5. Destrucción**

- Cuando la aplicación se apaga, el bean se destruye. Spring proporciona hooks para la limpieza personalizada:
  - Si el bean implementa `DisposableBean`, se llama al método `destroy()`.
  - Si el bean tiene un método anotado con `@PreDestroy`, se ejecuta ese método.

### Hooks de ciclo de vida en detalle

**1. Hooks de inicialización**

- Se utilizan a menudo para inicializar recursos, iniciar subprocesos en segundo plano o realizar tareas de configuración.
- Opciones:
  - `@PostConstruct`: un enfoque moderno basado en anotaciones.
  - `InitializingBean.afterPropertiesSet()`: enfoque basado en la interfaz.
  - Métodos de inicialización personalizados: se declaran con el atributo `@Bean(initMethod = "methodName")`.

```java
@Component
public class ExampleBean {
    @PostConstruct
    public void initialize() {
        System.out.println("Bean is initialized!");
    }
}
```
**2. Hooks de destrucción**

- Se utilizan para liberar recursos, cerrar conexiones o realizar limpieza.
- Opciones:
  - `@PreDestroy`: el enfoque basado en anotaciones recomendado.
  - `DisposableBean.destroy()`: enfoque basado en interfaz.
  - Métodos de destrucción personalizados: se declaran con el atributo `@Bean(destroyMethod = "methodName")`.

```java
@Component
public class ExampleBean {
    @PreDestroy
    public void cleanup() {
        System.out.println("Bean is being destroyed!");
    }
}
```

### Ciclo de vida completo en código

```java
@Component
public class ExampleBean implements InitializingBean, DisposableBean {
    public ExampleBean() {
        System.out.println("1. Bean is instantiated.");
    }

    @PostConstruct
    public void postConstruct() {
        System.out.println("2. @PostConstruct: Bean is initialized.");
    }

    @Override
    public void afterPropertiesSet() {
        System.out.println("3. afterPropertiesSet(): Custom initialization logic.");
    }

    @PreDestroy
    public void preDestroy() {
        System.out.println("4. @PreDestroy: Cleanup before destruction.");
    }

    @Override
    public void destroy() {
        System.out.println("5. destroy(): Final cleanup.");
    }
}
```

Output:
```log
1. Bean is instantiated.
2. @PostConstruct: Bean is initialized.
3. afterPropertiesSet(): Custom initialization logic.
4. @PreDestroy: Cleanup before destruction.
5. destroy(): Final cleanup.
```
### Ciclo de vida de los beans con scopes

- **Beans Singleton:** El ciclo de vida se produce una sola vez, cuando el contenedor se inicia y se apaga.
- **Beans Prototipo:** El ciclo de vida se produce para cada nueva instancia. Las devoluciones de llamadas de destrucción (como `@PreDestroy`) no se invocan automáticamente porque el contenedor no administra el ciclo de vida completo de los beans prototipo.

### ¿Cuándo utilizarías estos hooks?

**Inicialización**
- Configuración de recursos como conexiones de bases de datos, cachés o grupos de subprocesos.
- Realización de comprobaciones de validación o configuración.

**Destrucción:**
- Cierre de conexiones de bases de datos.
- Cierre de grupos de subprocesos o tareas en segundo plano.
- Limpieza de archivos temporales o liberación de bloqueos.

Spring le brinda un control detallado sobre el ciclo de vida de un bean. Si bien los ganchos como `@PostConstruct` y `@PreDestroy` son los más modernos y ampliamente utilizados, el ciclo de vida es lo suficientemente flexible como para adaptarse a la lógica personalizada según sea necesario.

## Conclusión

- Los beans permiten la inyección de dependencias, lo que genera un código limpio y modular.
- Spring se encarga de las tareas más pesadas, como el ciclo de vida de los objetos y las dependencias, para que usted pueda centrarse en la lógica de negocio.