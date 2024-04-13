---
author: "Franco Becvort"
title: "Spring Cloud: Deployment in GKE"
date: 2024-04-10
description: "Deploying some Spring Cloud microservices in GKE"
categories: ["Spring Cloud"]
thumbnail: /uploads/2024-04-10-spring-cloud-gke/DALL·E2024-04-1112.07.29.jpg
---

This is a continuation of [Spring Cloud: api-gateway and naming-server concepts](/en/blog/2024-04-09-spring-cloud).

## Check the code!

You can check the code in the following repos (in all of them, stick to the branch feature/gke. You may find other branches, that's me experimenting other solutions).

- [microservice-a](https://github.com/franBec/spring-cloud-v2-microservice-a/tree/feature/gke)
- [microservice-b](https://github.com/franBec/spring-cloud-v2-microservice-b/tree/feature/gke)
- [api-gateway](https://github.com/franBec/spring-cloud-v2-api-gateway/tree/feature/gke)
- [naming-server](https://github.com/franBec/spring-cloud-v2-naming-server/tree/feature/gke)

## Always remember to delete your cluster when going away

**DELETE THE CLUSTER!** _DELETE THE CLUSTER!_ Don't forget of deleting your cluster when going away. Clusters burn money for just existing. Is not that expensive, but, is money going to waste.

When writing this blog, I decided to go to sleep and continue the following day, leaving a cluster running for almost 10 hours.

![spending](/uploads/2024-04-10-spring-cloud-gke/Screenshot2024-04-11094419.png)

- Lucky me, cluster was empty, so the loss is negible (only £0.016). Could've been worse.
- You can see on April 4th I spent almost a whole £1. On that day, I left a cluster with 4 microservices running for about 5 hours.
- On April 8th I did the same but with Cloud Run, another Google Cloud computing solution, that deals with docker images but is less ops oriented. Because the spendings there are pay-per-use, you can see is much more afforable. Will probably do a Cloud Run blog next.
- My Cloud Console is in Spanish, and my spendings are in British Pound (£) even though I'm living in Portugal. What a mess is everything lol.

## Create a GKE Cluster

I asume you have everything in your Google Console ready to go. If not, Google is your best friend here.

A cluster can be created in various ways. I decided to go to ChatGPT, explained what I wanted to deploy, to keep it cheap, and came out with this glocud cli command:

```bash
gcloud beta container --project "fujiwara-383901" clusters create "pollito-demo-cluster" --no-enable-basic-auth --cluster-version "1.27.8-gke.1067004" --release-channel "regular" --machine-type "e2-medium" --image-type "COS_CONTAINERD" --disk-type "pd-ssd" --disk-size "50" --metadata disable-legacy-endpoints=true --scopes "https://www.googleapis.com/auth/devstorage.read_only","https://www.googleapis.com/auth/logging.write","https://www.googleapis.com/auth/monitoring","https://www.googleapis.com/auth/servicecontrol","https://www.googleapis.com/auth/service.management.readonly","https://www.googleapis.com/auth/trace.append" --num-nodes "3" --logging=SYSTEM,WORKLOAD --monitoring=SYSTEM --enable-ip-alias --network "projects/fujiwara-383901/global/networks/default" --subnetwork "projects/fujiwara-383901/regions/europe-southwest1/subnetworks/default" --no-enable-intra-node-visibility --default-max-pods-per-node "110" --security-posture=standard --workload-vulnerability-scanning=disabled --no-enable-master-authorized-networks --addons HorizontalPodAutoscaling,HttpLoadBalancing,GcePersistentDiskCsiDriver --enable-autoupgrade --enable-autorepair --max-surge-upgrade 1 --max-unavailable-upgrade 0 --enable-autoprovisioning --min-cpu 1 --max-cpu 2 --min-memory 2 --max-memory 6 --enable-autoprovisioning-autorepair --enable-autoprovisioning-autoupgrade --autoprovisioning-max-surge-upgrade 1 --autoprovisioning-max-unavailable-upgrade 0 --autoscaling-profile optimize-utilization --enable-vertical-pod-autoscaling --enable-shielded-nodes --zone "europe-southwest1-a"
```

Adapt to your project and preferred region.

## Deploy stuff in the cluster

The order in which the microservices are deployed doesn't really matter, but to prevent unnecessary errors in the logs, I follow this order:

- naming-server
- api-gateway
- microservice-b
- microservice-a

0. Get [gcloud CLI](https://cloud.google.com/sdk/docs/install) and [kubectl](https://kubernetes.io/docs/reference/kubectl/) in your machine.

1. Click on "Establish Connection". That will give us a gcloud command.

![establish connection](/uploads/2024-04-10-spring-cloud-gke/Screenshot2024-04-13000442.png)

2. Paste the command in your fav cmd tool.

![paste](/uploads/2024-04-10-spring-cloud-gke/Screenshot2024-04-11123029.png)

3. Navigate to where deployment.yaml is. I decided to put the file in deployment/kubernetes/prod

4. Run

```bash
kubectl apply -f deployment.yaml
```

You should get something like this:

```bash
E0411 12:36:32.181316   19120 memcache.go:287] couldn't get resource list for metrics.k8s.io/v1beta1: the server is currently unable to handle the request
E0411 12:36:32.280107   19120 memcache.go:121] couldn't get resource list for metrics.k8s.io/v1beta1: the server is currently unable to handle the request
Warning: autopilot-default-resources-mutator:Autopilot updated Deployment default/naming-server: adjusted resources to meet requirements for containers [spring-cloud-v2-naming-server] (see http://g.co/gke/autopilot-resources)
deployment.apps/naming-server created
service/naming-server created
```

Now, let's repeat the deployment process for the rest of the microservices.

After some minutes, run:

```bash
kubectl get pods
```

to check that everything is running smoothly.

```bash
NAME                              READY   STATUS    RESTARTS   AGE
api-gateway-85cd954d8-57kp2       1/1     Running   0          10m
microservice-a-6978854d7b-24j45   1/1     Running   0          58m
microservice-b-6f6c5944b4-tgcvb   1/1     Running   0          17m
naming-server-f4795fd84-q9l8x     1/1     Running   0          14m
```

## Let's test it

To get the url, run:

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

You'll see only one has an EXTERNAL-IP, the api-gateway. Grab that url, add the port at the end, add /microservice-a, and we should get a result back.

```bash
curl --location '34.175.79.29:8765/microservice-a'
```

![postman](/uploads/2024-04-10-spring-cloud-gke/Screenshot2024-04-13153428.png)

Congrats, you now deployed your stuff in GKE.

## Don't forget to delete the cluster when you are done

Reminder :D

## Next step

Deploy it in Cloud Run, cause why not.
