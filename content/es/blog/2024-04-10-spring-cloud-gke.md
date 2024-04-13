---
author: "Franco Becvort"
title: "Spring Cloud: Deployment en GKE"
date: 2024-04-10
description: "Desplegando microservicios Spring Cloud en GKE"
categories: ["Spring Cloud"]
thumbnail: /uploads/2024-04-10-spring-cloud-gke/DALL·E2024-04-1112.07.29.jpg
---

Esta es una continuación de [Spring Cloud: api-gateway y naming-server](/es/blog/2024-04-09-spring-cloud).

## ¡Chequea el código!

Puede verificar el código en los siguientes repositorios (en todos ellos, siga la rama feature/gke. Puede encontrar otras ramas, soy yo experimentando otras soluciones).

- [microservice-a](https://github.com/franBec/spring-cloud-v2-microservice-a/tree/feature/gke)
- [microservice-b](https://github.com/franBec/spring-cloud-v2-microservice-b/tree/feature/gke)
- [api-gateway](https://github.com/franBec/spring-cloud-v2-api-gateway/tree/feature/gke)
- [naming-server](https://github.com/franBec/spring-cloud-v2-naming-server/tree/feature/gke)

## Recuerde siempre eliminar tu clúster cuando salga

**¡ELIMINAR EL CLUSTER!** _¡ELIMINAR EL CLUSTER!_ No olvides eliminar tu cluster cuando salgas. Los clusters queman dinero simplemente existiendo. No es tan caro, pero es desperdicio.

Al escribir este blog decidí irme a dormir y continuar al día siguiente, dejando un cluster funcionando durante casi 10 horas.
![spending](/uploads/2024-04-10-spring-cloud-gke/Screenshot2024-04-11094419.png)

- Por suerte, el cluster estaba vacío, por lo que la pérdida es insignificante (sólo £0,016). Podría haber sido peor.
- Puedes ver que el 4 de abril gasté casi £1. Ese día, dejé un clúster con 4 microservicios ejecutándose durante aproximadamente 5 horas.
- El 8 de abril hice lo mismo pero con Cloud Run, otra solución de computación en la nube de Google, que se ocupa de imágenes de Docker pero está menos orientada a operaciones. Como los gastos son de pago por uso, es mucho más asequible. Probablemente haga un blog sobre Cloud Run pronto.
- Mi Cloud Console está en español y mis gastos están en libras esterlinas (£) aunque vivo en Portugal. Que mezcla es todo.

## Crear un clúster de GKE

Asumo que tienes todo en tu Google Console listo para empezar. Si no, Google es tu mejor amigo aquí.

Un clúster se puede crear de varias maneras. Decidí ir a ChatGPT, expliqué lo que quería implementar para mantenerlo económico y obtuve este comando glocud cli:

```bash
gcloud beta container --project "fujiwara-383901" clusters create "pollito-demo-cluster" --no-enable-basic-auth --cluster-version "1.27.8-gke.1067004" --release-channel "regular" --machine-type "e2-medium" --image-type "COS_CONTAINERD" --disk-type "pd-ssd" --disk-size "50" --metadata disable-legacy-endpoints=true --scopes "https://www.googleapis.com/auth/devstorage.read_only","https://www.googleapis.com/auth/logging.write","https://www.googleapis.com/auth/monitoring","https://www.googleapis.com/auth/servicecontrol","https://www.googleapis.com/auth/service.management.readonly","https://www.googleapis.com/auth/trace.append" --num-nodes "3" --logging=SYSTEM,WORKLOAD --monitoring=SYSTEM --enable-ip-alias --network "projects/fujiwara-383901/global/networks/default" --subnetwork "projects/fujiwara-383901/regions/europe-southwest1/subnetworks/default" --no-enable-intra-node-visibility --default-max-pods-per-node "110" --security-posture=standard --workload-vulnerability-scanning=disabled --no-enable-master-authorized-networks --addons HorizontalPodAutoscaling,HttpLoadBalancing,GcePersistentDiskCsiDriver --enable-autoupgrade --enable-autorepair --max-surge-upgrade 1 --max-unavailable-upgrade 0 --enable-autoprovisioning --min-cpu 1 --max-cpu 2 --min-memory 2 --max-memory 6 --enable-autoprovisioning-autorepair --enable-autoprovisioning-autoupgrade --autoprovisioning-max-surge-upgrade 1 --autoprovisioning-max-unavailable-upgrade 0 --autoscaling-profile optimize-utilization --enable-vertical-pod-autoscaling --enable-shielded-nodes --zone "europe-southwest1-a"
```

Adáptese a su proyecto y región preferida.

## Implementar cosas en el clúster

El orden en el que se implementan los microservicios realmente no importa, pero para evitar errores innecesarios en los registros, sigo este orden:

- naming-server
- api-gateway
- microservice-b
- microservice-a

0. Obtenga [gcloud CLI](https://cloud.google.com/sdk/docs/install) y [kubectl](https://kubernetes.io/docs/reference/kubectl/) en tu máquina.

1. Haga clic en "Establecer conexión". Eso nos dará un comando de gcloud.

![establish connection](/uploads/2024-04-10-spring-cloud-gke/Screenshot2024-04-13000442.png)

2. Pegue el comando en su herramienta cmd favorita.

![paste](/uploads/2024-04-10-spring-cloud-gke/Screenshot2024-04-11123029.png)

3. Navegue hasta donde está despliegue.yaml. Decidí poner el archivo en implementación/kubernetes/prod.

4. Ejecute

```bash
kubectl apply -f deployment.yaml
```

Deberías obtener algo como esto:

```bash
E0411 12:36:32.181316   19120 memcache.go:287] couldn't get resource list for metrics.k8s.io/v1beta1: the server is currently unable to handle the request
E0411 12:36:32.280107   19120 memcache.go:121] couldn't get resource list for metrics.k8s.io/v1beta1: the server is currently unable to handle the request
Warning: autopilot-default-resources-mutator:Autopilot updated Deployment default/naming-server: adjusted resources to meet requirements for containers [spring-cloud-v2-naming-server] (see http://g.co/gke/autopilot-resources)
deployment.apps/naming-server created
service/naming-server created
```

Ahora, repitamos el proceso de implementación para el resto de microservicios.

Después de unos minutos, ejecute:

```bash
kubectl get pods
```

para comprobar que todo funciona correctamente.

```bash
NAME                              READY   STATUS    RESTARTS   AGE
api-gateway-85cd954d8-57kp2       1/1     Running   0          10m
microservice-a-6978854d7b-24j45   1/1     Running   0          58m
microservice-b-6f6c5944b4-tgcvb   1/1     Running   0          17m
naming-server-f4795fd84-q9l8x     1/1     Running   0          14m
```

## Probémoslo

Para obtener la URL, ejecute:

```bash
kubectl get svc
```

```bash
NAME             TYPE           CLUSTER-IP       EXTERNAL-IP    PORT(S)          AGE
api-gateway      LoadBalancer   10.111.196.131   34.175.79.29   8765:30836/TCP   114m
kubernetes       ClusterIP      10.111.192.1     <none>         443/TCP          126m
microservice-a   ClusterIP      10.111.196.50    <none>         8081/TCP         63m
microservice-b   ClusterIP      10.111.194.149   <none>         8080/TCP         110m
naming-server    ClusterIP      10.111.193.218   <none>         8761/TCP         116m
```

Verás que solo uno tiene una EXTERNAL-IP, api-gateway. Tome esa URL, agregue el puerto al final, agregue /microservice-a y deberíamos obtener un resultado.

```bash
curl --location '34.175.79.29:8765/microservice-a'
```

![postman](/uploads/2024-04-10-spring-cloud-gke/Screenshot2024-04-13153428.png)

Felicitaciones, ahora implementaste tus cosas en GKE.

## No olvides eliminar el clúster cuando hayas terminado.

Recordatorio :D

## Próximos pasos

Implementarlo en Cloud Run, ¿por qué no?
