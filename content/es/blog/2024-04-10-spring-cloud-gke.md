---
author: "Franco Becvort"
title: "Spring Cloud: Deployment en GKE"
date: 2024-04-10
description: "Desplegando algunos microservicios de Spring Cloud en GKE"
categories: ["Spring Cloud"]
thumbnail: /uploads/2024-04-10-spring-cloud-gke/DALL·E2024-04-1112.07.29.jpg
---

Este es una continuación de [Spring Cloud: api-gateway and naming-server concepts](/es/blog/2024-04-09-spring-cloud).

<!-- TOC -->
  * [¡Mirá el código!](#mirá-el-código)
  * [Acordate siempre de borrar tu clúster cuando te vayas](#acordate-siempre-de-borrar-tu-clúster-cuando-te-vayas)
  * [Creá un clúster GKE](#creá-un-clúster-gke)
  * [Desplegá lo que necesites en el clúster](#desplegá-lo-que-necesites-en-el-clúster)
  * [Probémoslo](#probémoslo)
  * [Recordá borrar el clúster cuando termines](#recordá-borrar-el-clúster-cuando-termines)
<!-- TOC -->

## ¡Mirá el código!

Podés chequear el código en los siguientes repositorios (en todos, quedate en la rama `feature/gke`. Puede que veás otras ramas; eso soy yo experimentando con otras soluciones):

- [microservice-a](https://github.com/franBec/spring-cloud-v2-microservice-a/tree/feature/gke).
- [microservice-b](https://github.com/franBec/spring-cloud-v2-microservice-b/tree/feature/gke).
- [api-gateway](https://github.com/franBec/spring-cloud-v2-api-gateway/tree/feature/gke).
- [naming-server](https://github.com/franBec/spring-cloud-v2-naming-server/tree/feature/gke).

## Acordate siempre de borrar tu clúster cuando te vayas

¡BORRÁ EL CLÚSTER! ¡BORRÁ EL CLÚSTER! Acordate de borrar tu clúster cuando no lo estés usando. Los clústeres gastan dinero solo por existir. No son tan caros, pero es plata tirada a la basura.

Al escribir este blog, me fui a dormir y continué al día siguiente, dejando un clúster corriendo durante casi 10 horas.

![spending](/uploads/2024-04-10-spring-cloud-gke/Screenshot2024-04-11094419.png)

- Por suerte, el clúster estaba vacío, así que la pérdida es insignificante (solo £0.016). Podría haber sido peor.
- Se nota que el 4 de abril gasté casi £1. Ese día dejé un clúster con cuatro microservicios corriendo por unas 5 horas.
- El 8 de abril hice lo mismo, pero con Cloud Run, otra solución de Google Cloud que trabaja con imágenes Docker, pero es menos orientada a operaciones. Como el gasto es de pago por uso, se nota que es mucho más económico. Probablemente, escriba un blog de Cloud Run después.

## Creá un clúster GKE

Asumo que ya tenés todo listo en tu Google Console. Si no, Google es tu mejor amigo acá.

Un clúster se puede crear de varias maneras. Yo decidí preguntarle a ChatGPT, le expliqué lo que quería desplegar para que fuera barato, y me tiró este comando de gcloud cli:

```bash
gcloud beta container --project "fujiwara-383901" clusters create "pollito-demo-cluster" --no-enable-basic-auth --cluster-version "1.27.8-gke.1067004" --release-channel "regular" --machine-type "e2-medium" --image-type "COS_CONTAINERD" --disk-type "pd-ssd" --disk-size "50" --metadata disable-legacy-endpoints=true --scopes "https://www.googleapis.com/auth/devstorage.read_only","https://www.googleapis.com/auth/logging.write","https://www.googleapis.com/auth/monitoring","https://www.googleapis.com/auth/servicecontrol","https://www.googleapis.com/auth/service.management.readonly","https://www.googleapis.com/auth/trace.append" --num-nodes "3" --logging=SYSTEM,WORKLOAD --monitoring=SYSTEM --enable-ip-alias --network "projects/fujiwara-383901/global/networks/default" --subnetwork "projects/fujiwara-383901/regions/europe-southwest1/subnetworks/default" --no-enable-intra-node-visibility --default-max-pods-per-node "110" --security-posture=standard --workload-vulnerability-scanning=disabled --no-enable-master-authorized-networks --addons HorizontalPodAutoscaling,HttpLoadBalancing,GcePersistentDiskCsiDriver --enable-autoupgrade --enable-autorepair --max-surge-upgrade 1 --max-unavailable-upgrade 0 --enable-autoprovisioning --min-cpu 1 --max-cpu 2 --min-memory 2 --max-memory 6 --enable-autoprovisioning-autorepair --enable-autoprovisioning-autoupgrade --autoprovisioning-max-surge-upgrade 1 --autoprovisioning-max-unavailable-upgrade 0 --autoscaling-profile optimize-utilization --enable-vertical-pod-autoscaling --enable-shielded-nodes --zone "europe-southwest1-a"
```

Adaptá el comando a tu proyecto y a la región que prefieras.

## Desplegá lo que necesites en el clúster

El orden en que se despliegan los microservicios no importa mucho, pero para prevenir errores innecesarios en los logs, yo sigo este orden:

- `naming-server`.
- `api-gateway`.
- `microservice-b`.
- `microservice-a`.

1. Instalá [gcloud CLI](https://cloud.google.com/sdk/docs/install) y [kubectl](https://kubernetes.io/docs/reference/kubectl/) en tu máquina.

2. Hacé clic en "Establish Connection". Eso te va a dar un comando de gcloud.

   ![establish connection](/uploads/2024-04-10-spring-cloud-gke/Screenshot2024-04-13000442.png)

3. Pegá el comando en tu terminal favorita.

   ![paste](/uploads/2024-04-10-spring-cloud-gke/Screenshot2024-04-11123029.png)

4. Navegá hasta donde esté el archivo deployment.yaml. Yo decidí ponerlo en deployment/kubernetes/prod.

5. Ejecutá:

    ```bash
    kubectl apply -f deployment.yaml
    ```

Deberías ver algo similar a esto:

```bash
E0411 12:36:32.181316   19120 memcache.go:287] couldn't get resource list for metrics.k8s.io/v1beta1: the server is currently unable to handle the request
E0411 12:36:32.280107   19120 memcache.go:121] couldn't get resource list for metrics.k8s.io/v1beta1: the server is currently unable to handle the request
Warning: autopilot-default-resources-mutator:Autopilot updated Deployment default/naming-server: adjusted resources to meet requirements for containers [spring-cloud-v2-naming-server] (see http://g.co/gke/autopilot-resources)
deployment.apps/naming-server created
service/naming-server created
```

Ahora, repetí el proceso de despliegue para el resto de los microservicios.

Después de unos minutos, ejecutá:

```bash
kubectl get pods
```

Para verificar que todo esté corriendo sin problemas.

```bash
NAME                              READY   STATUS    RESTARTS   AGE
api-gateway-85cd954d8-57kp2       1/1     Running   0          10m
microservice-a-6978854d7b-24j45   1/1     Running   0          58m
microservice-b-6f6c5944b4-tgcvb   1/1     Running   0          17m
naming-server-f4795fd84-q9l8x     1/1     Running   0          14m
```

## Probémoslo

Para obtener la URL, ejecutá:

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

Vas a notar que solo el api-gateway tiene EXTERNAL-IP. Tomá esa URL, agregale el puerto al final, sumale /microservice-a, y deberías obtener una respuesta.

```bash
curl --location '34.175.79.29:8765/microservice-a'
```

![postman](/uploads/2024-04-10-spring-cloud-gke/Screenshot2024-04-13153428.png)

¡Felicitaciones, ahora desplegaste tus servicios en GKE!

## Recordá borrar el clúster cuando termines

Un recordatorio :D