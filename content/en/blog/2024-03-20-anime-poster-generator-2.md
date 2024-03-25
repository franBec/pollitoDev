---
author: "Franco Becvort"
title: "Anime Poster Generator 2: Jasper old friend"
date: 2024-03-20
description: "Creating a poster generator backend microservice"
categories: ["Anime Poster Generator"]
thumbnail: /uploads/2024-03-20-anime-poster-generator-2/Untitled_Export-DTRj0RWt87.jpeg
---

This is a continuation of [Anime Poster Generator 1: Sketching the idea](/en/blog/2024-03-13-anime-poster-generator)

All the code showed here can be found in the github repo [anime-poster-generator-backend](https://github.com/franBec/anime-poster-generator-backend)

## Objectives

I'm gonna focus in making Anime Poster Generator Backend.

![diagram](/uploads/2024-03-20-anime-poster-generator-2/Untitled-2024-02-21-1828.png)

To accomplish that, I'm gonna use the [Contract-Driven Development practices I&rsquo;ve talked about in my manifest](/en/blog/2024-03-16-pollitos-manifest-on-java-spring-boot-cdd).

The challenge here is "how am I gonna create a pdf with an image and info that recreates a poster?" Let me introduce to yall an old friend.

## JasperReports

JasperReports is an open-source reporting tool developed by Jaspersoft, which is used for creating a wide range of reports from simple to complex in a variety of formats, including PDF, HTML, Excel, and others.

At its core, JasperReports utilizes report templates designed in JRXML (JasperReports XML), which specifies the layout, styling, and data source of the reports.

Right now this tool is responsible for all the PDFs and Excel in San Luis City goverment. Many times I called it "old" and "obsolete", but for this scenario where I really want something done quick and don't really mind if it doesn't look that professional, it is the the right tool in the shed.

How it works? Create a template with iReport, define where and how the values are gonna populate the template, compile, save both the xml like file and the compiled file in the repo, and called the compiled file in the service code.

Here's a screenshot of how it looks:

![jasper editor](/uploads/2024-03-20-anime-poster-generator-2/Screenshot2024-03-20215521.png)

Here are the files in the resources folder. It is a good place to save them.
![jasper files](/uploads/2024-03-20-anime-poster-generator-2/Screenshot2024-03-20215740.png)

And here is the piece of code in JasperServiceImpl where I use the jasper:

```java
@Override
@SneakyThrows
public byte[] makePoster(PosterContent content) {
  if (!isValidBase64Image(content.getImage())) {
    throw new InvalidBase64ImageException();
  }

  ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
  JasperExportManager.exportReportToPdfStream(
      JasperFillManager.fillReport(
          (JasperReport)
              JRLoader.loadObject(
                  resourceLoader.getResource(CLASSPATH_REPORTS_POSTER_JASPER).getInputStream()),
          mapPosterContentToParameters(content),
          new JREmptyDataSource()),
      byteArrayOutputStream);

  return byteArrayOutputStream.toByteArray();
}
```

Now the main mystery is "How is my service dealing with an image? Where's the image?" Maybe that first if statement in the piece of code gives you a hint... [Base64](https://en.wikipedia.org/wiki/Base64#)

## Checking the OAS

This microservice is quite an interesting study case:

- Needs to recieve an image.
- Also expects some info to fill the poster pdf (anime name, year, etc.), so it needs a json body.
- The return is an application/pdf.

Here's the solution I came out with:

```yml
openapi: 3.0.3
info:
  title: Anime Poster Generator - Jasper
  description: Builds pdf following the aesthetic of minimalist posters
  version: 1.0.0
  contact:
    name: Pollito
    url: https://pollitodev.netlify.app/
servers:
  - url: "http://localhost:8080"
paths:
  /poster:
    post:
      tags:
        - Poster
      operationId: makePoster
      summary: Generates a PDF of the poster with the given information
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/PosterContent"
      responses:
        "200":
          description: Poster in PDF file
          content:
            application/pdf:
              schema:
                type: string
                format: binary
        default:
          description: Error
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Error"
components:
  schemas:
    PosterContent:
      type: object
      properties:
        title:
          type: string
        year:
          type: integer
        genres:
          type: array
          items:
            type: string
        director:
          type: string
        producers:
          type: array
          items:
            type: string
        studios:
          type: array
          items:
            type: string
        image:
          type: string
          description: Base64-encoded image string.
      required:
        - title
        - year
        - genres
        - director
        - producers
        - image
    Error:
      type: object
      properties:
        timestamp:
          type: string
          description: The date and time when the error occurred in ISO 8601 format.
          format: date-time
          example: "2024-01-04T15:30:00Z"
        session:
          type: string
          format: uuid
          description: A unique UUID for the session instance where the error happened, useful for tracking and debugging purposes.
        error:
          type: string
          description: A brief error message or identifier.
        message:
          type: string
          description: A detailed error message.
        path:
          type: string
          description: The path that resulted in the error.
```

This implied doing a little bit of work at the controller level, but not much. For me is important to keep the controller as clean as possible.

```java
@RestController
@RequiredArgsConstructor
public class PosterController implements PosterApi {
  private final JasperService jasperService;

  @Override
  public ResponseEntity<Resource> makePoster(PosterContent posterContent) {
    ByteArrayResource resource = new ByteArrayResource(jasperService.makePoster(posterContent));

    String filename = posterContent.getTitle() + ".pdf";

    HttpHeaders headers = new HttpHeaders();
    headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"");
    headers.setContentLength(resource.contentLength());
    headers.setContentType(MediaType.APPLICATION_PDF);

    return ResponseEntity.ok().headers(headers).body(resource);
  }
}
```

## Docker it!

Why? Well, why not... I just felt like doing it. I would need to docker it eventually if planning to deploy it somewhere.

Here's the repo Dockerfile

```dockerfile
FROM eclipse-temurin:21-jdk-alpine
ARG JAR_FILE=target/*jar
COPY ${JAR_FILE} app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
```

Follow these steps to generate the image locally (or skip it all and just pull the image from [dockerhub](https://hub.docker.com/repository/docker/pollitodev/anime-poster-generator-backend/general)):

1. maven clean + maven install
2. docker build

```bash
docker build -t some-tag-you-want .
```

3. docker run

```bash
docker run -p 8080:8080 the-same-tag-u-used-before
```

## Let's give it a try

I will run the image using [Docker Desktop](https://www.docker.com/products/docker-desktop/).

![docker desktop](/uploads/2024-03-20-anime-poster-generator-2/Screenshot2024-03-20224434.png)

Then run this curl with a sample base64 image of [Smol Ame](https://holocure.fandom.com/wiki/Smol_Ame)

```bash
curl --location 'http://localhost:8080/poster' \
--header 'Content-Type: application/json' \
--data '{
    "title": "Smol Ame",
    "year": 2022,
    "director": "Amelia Watson",
    "genres": [
        "SLICE OF LIFE",
        "COMEDY",
        "SCHOOL"
    ],
    "producers": [
        "HOLOLIVE"
    ],
    "studios":[
        "studio 1"
    ],
    "image": "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAoHCBUVFRgVFRYZGBgaGh0aGBgZHBoaHhwcGhkcHBoeGRocIS4lHB4tIxwYJjgmKy8xNTU1GiQ7QDszPy40NTEBDAwMEA8QHhISHzErJCs0NDQ2NDQ0MTQ0NDQxNDQ0NDQ0NDQ0NDQ0NDQ0NDQ0MTQ0NDQ0NDQ0PTQ0NDQ0NDQ0P//AABEIAOEA4QMBIgACEQEDEQH/xAAcAAEAAgIDAQAAAAAAAAAAAAAABgcEBQIDCAH/xABHEAACAAQCBgcFBgQDBgcAAAABAgADBBESIQUGBzFBcRMiUWGBkaEyUnKSsSNCYoLB0RSissIVM1MWNUNz4fAXJERUY5Oz/8QAGQEAAwEBAQAAAAAAAAAAAAAAAAEDAgQF/8QAJREAAwACAQQCAwEBAQAAAAAAAAECAxExEiFBUQQyE2FxIjMF/9oADAMBAAIRAxEAPwC1oQhFzlEIQgAQhCABCEIAEaXXKdNSinvIbC6oWDDeFGbkd+HFaN1HGYgYFWF1IIYHiCLEeUJguSg9Ha718k5T2ce7M+0HrmPAxJKXazOFukpkftKOyehVvrES1p1emUE/Awuhu0p94dAeP4hcAjvHbGNKlI4uBY8QMrRCqcnTMKi0tH7UqVyBNSZK/FYOvmufpEt0Xp2mqR9hPR+0BhiHNTmPKKAbR68CR6xjPQuMxY23EbxyhrKhVhZ6ZhFC6r661FG2Elpsq/WluxJHaUY+ye7d9Yu7RekJdTKSdKbEji47R2gjgQciIqqTJVDkzI4vMCjExCgbySAPMxFdctdZVEMCWmTzuS+SD3nI3DsG892+Ka0rpWoq3LznaYSbhT7K9mBNyiB0kOYdFxaa2hUUjJH6d72wyrEC3a5NvK8RKv2rz2uJNOidjOzOflAUfWIPKoCfaNu4R3pRIMzc84hWVFpwkz1T2gVc2qlyp5R0mPgyQKVLeyQRvF+Bi2o89amyC9fTBeE5Xy4KhLn0WPQsWltohkST7CEIRswIQhAAhCEACEIQAIQhAAhCEACEIQAIQhAAhHCfORFLOyoo3s5Cgcycoi+ldoNBJ3Tembsk2cfPfD6wtoaTZtNZtAy62QZT5H2kcb0fgR3cCOIihtJUE6jnNKmLhdflZeDKeKntif1u1rf0VNyMx7eaqP1iGax61VFdhE4SwEJKBEsRfeMRJNu6/CJ10stCqTrkTg4uPER2Rola2YNjHYah/ePnHM8XfsdCyezNrqcEYgMxv5Rt9WtcJlHTz5KZs5BlscwhIImNY8bYbDdffEa6ZvePnHCKTuVpk6aoyZMlpjF3Ym5uzMSWYneSTvPeY2SS1UWUWjXSa0qLWFu7KMlK9ONxE7VNlYcoyoxK+fYYRvPoI4zdID7ov3mMvVzVyfXzMKAhARjmkdVAe/i1tyj0EEY23tiu0l2Jbsd0TimTalhkg6ND2s2b25DCPzRbMYeiNGS6aSkmULIgsL7yTvZjxJOd4zI7JWkcVPb2IQhGjIhCEACEIQAIQhAAhCEACEIQAIQiK64a6yqEYAOknkXCA2CjgZjcB3bz3b4TehpbN5pbS8imTHPmKi8L72PYijNj3CK01h2oO10o0wL/AKjgFz8Cbl8b8hEOqJtVpCeXbFNmHsyVFPAcEQf93MTDQ+okpAGqD0j7ygyQd3a3pyiVZEjojDshLPVVr3JmT3vxuwH9qekbuj1DqHF3dJfdm58bZesWRJlKihUUKo3KoAA8BHZHO8jfB0TiS5IJT7PVv155I7EUKfNifpG8pdT6NB/l4z2uxb0yHpG/hCdUaUSvBgy9D0y+zIlj8i/tHI6Lkf6Mv5F/aMyEZ2zWkax9AUrG5p5d/hEcv8CprW/h5dvgEbGEG2HSiMVupFK+ah5Z/A2XyuD6WivtO6MNNPeSSWAsVa1rqRcG3mPCLoiA7S6XOTNHENLP9S/3xSKe9MncLW0RFqA71YGNjonWGtospTkJe+BgHQk78uHgRHRRPdB3ZeX/AEtHfC/JUsz+NUid6D2py2IWpldHf76XZeZU9YDxMWFR1kuageU6uh3MhDDzEee51Irdx7RDR2kKmifpJLle22asOx13GLzmTIXh1wei4RC9Utf5VURLmgSpxyAv1HP4Cdx/CfWJpFk9kGmhCEIYhCEIAEIQgAQj4xAzJsO0xENN7RaOnJRC09xkRLthB75h6p8Lwm0hpN8EwhFL6V2m1k02kqkheFh0jn8zCw8BGlWg0jVXYie4Y5l3Kr4B2AtyEYdpFFibLR161zSkl4JLI897gWYMJdt7OBxzyHGKbpE6ed9rNCY2LPMc37yc97GN3J1Dqsr9GncX3fKtoy02ezvvTpY5Bj+0TeRPyWnE14JLozSWj6dAkqdLA3k4rlj2sbZmMpdZqM/+oTxJH1ERRdnr8Z6eCH94Ns8fhPQ80I/WItT7LJ0vBNZOlad/YnS25Ov7xlrMU7iDyIMVpO1AqR7Lym8WHoVjGfUisXNUQ/C6j62g6Z9j6q9FrQipv8J0km5Khfhcn0RzD/EtIy97VC299GI/mUiDo/Yfk/RbMIqpdc61d7qbe8ifoBGZTbQJ49uXLfvGJD9SPSF+Nh+RFkwiKUGvdM9hMDyj2kYl81ubcxElpqpJgxI6uO1WDfSE5aNqk+DujR65UfS0kwW6yDpF5pmf5cQ8Y3kdVSgZHU7irDzBhJ6YNbRTWjH9oeP6RnxqtHZOORjaw8i7k44ECIQiZswqmi4p5ftE91B17YMtNVtdTZZc1t4O4K5O8HcG5XiHxhV9NcYgM+I7YvjytPTI5Maa2j0jCILsx1mNTKNPNN5soCzHe6bgT2sNx8DE6jsT2cTWmIQhDEIQhABSu0XWqZUznppZKypbshUH/McHCS1uANwF8cza3PQ+oRID1LFePRpvHczHdyHnGXrXs7qTPmTqbDMSY7TMGIK6ljiIzyYXJsbxov8AZLSpyMmdbdnMWw/nyiFTTOmKlIsDR2hKeQPs5SqfeN2b5mufWNhFY/7EaTvh6F//ALEt/XGt0voSrpQr1CsmMlVu4JNhc5KxNt3nEnifkss0+C3WmqN7KOZEcWqEGZdPmEVJoTVmprAzSUxKpwlmYKMVr2ud5tbzEbZdm9fe2CWO8uLegjD6J7Nm1bfgnh0vTDIz5Xzp+8Dpim/9xK+dP3iHJsvqyLmZJB7LufXDHJNl9VfOZJHfdz6YIz1Y/YdVeiXppenbdPlH86fvHZ/iMn/Wl/On7xC5my+rHszJLcy6/wBhjguzCsvm8gd+Jz/ZB1Y/YdVeiappSnJsJ0sn40/eMhJqt7LKeRBiEPssqbZTpR7rOPW0YlRs3r0uU6N7bsD2J+YD6wbh+Q6n6LDaUp3qDzAjBq9BU0wHHJlm/ELhPgy2I84r9tVdKJulzuaTP2e8ceg0sn3KsW/DMb9DGlrxQur2jf6Q1AlNcyXZDwV+uvn7X1iNVertbStjRWIH35JJ8wOsPERzOndJS/becLb8cvdzLJHOl18qV3mW/aGWx80Ija3/AEw2n+jJ0NrzNQhagdIm4sAA4+gbxse+J3QaWk1CFpThsrldzDL7ynMRXGk9N01T1ptMyP8A6kpxc/ErKA3nfvjRLMKPiluwt7Li6N6E284fSn+gVtHOi/zB+b6GNrGppZgVsR7DGcKxO30MYyS2zUNaMiEcFmqdxBjnEmtFBCEIQH3VrSJpK6VMF8OMK47UmdVvK9+ax6DjzVpE2YEbwL+Rj0jTtdFJ3lVJ8hHfie5OHMtUdkIQipEQhCABCEIAEUTtB04ayrKp1kl/ZS7ffYt1iO8tYDtCiLQ2g6Z/hqJ2VrTJn2aZ2N29ojkuI+UV5st0J0s81Di6SbYe+YRl8o63isQzWpltlsM7ZZ2rmjBTU0uSN6r1j2u2bnzJjZwhHi1Tb2z0UtIQjqqalJaF3ZURRdmYgADvJis9ZNpRYNLo1K8OmcC9u1E4dxbyjUY6t9jNWlyTzTen6ekXFPmBSR1UGbt8KjPxOUVrpzaVPmArToJCe+Ticjn7KeR5xrNXtUqvSDmZcqhPXnzCxxduDi58h3xbGr2o1HSgEIJswb5kwBjf8AOSjln3x3Rgmee7JO2+Cka2ZVkJUTTPsTZJrlxcgX6jHuzyi6dTNOirpkcsDMUYJo44xlitwDb/ABjbaz6DStp3kNkTmjcVceyeXAjsJimdQdJmkrgkzqK95UwHcrX6pbk62/MYeaFU9vApemXfCAhHmnQLxh6QlyAjPOSXgUFmZ1UgAbySRGZEC2taRwUySQc5r3b4EzP8xTyjeNOqSM09LZm6JOiK1mEqTJZ1GatLCMV7QpAuO8QrdnFC7YlEyX+GWww+TA28IqWXJn04k1KhkDMxlTB70s2Ydx7uIJ74uvVHWJK2TjFlmLZZqdjcCPwnePLhHTlmsf8AqW9E5arsyIVWyk3PR1OX3Q6Z+LK2fO0aip2a1y+z0Tjucj0ZYuWESXysiNvEmef67Vatknr00zmq4x5peNa050OFiynsYWPkY9JR1VFMj5Oiv8ShvrFF8rf2Rj8XpnnVK9hvAPpHcNIjip84u2p1RoH9qmljvVcB80tGrnbN6FvZWYh7VmMbeDXjaz43yg6aXkpytmBzcbrWj0Tq5V9NSyJm/HKQnnhAPqDFSa6akCilidLmM6FwjBwAVxA4TcbxcAbhvic7KtJdLRCWd8lzL5qbOp/mI8I7MNKl/ng5s0vyTSEIR0HOIQhAAhCNTrXpL+GpJ06/WVLJ8bHCnqR5QmwS2U5tE02amscA3SUTLQD8Js7cywPgoi0NR9EGmo5aMLO32j9zPY2PIYR4RVWomhzU1aA5ohEyYTncKbgHvZresXtHmfLybfSj0MMa7iNRrJp6XRSjMmZknCiDezWvbuHaY28U/tW0r0lSsgEYZK5/G4DNfkoTzMc2COutFbrSNLX6TrdJzglmckkpJTJF77Xtlxdu3fnE51V2YKpx12Fz92UjErzdhbF8Iy5xIdm+glpqNHZAJs1cbsRZsLdZFJ3gAWy7bxgTtqVGs5pZSaUVivSgAqbGxIW+IrvztnHppaWkc37ZO5aBQFUBVAsABYADcABuEco6qeoV0V0IZHUMrDiGFwfIx2xk2IrDaBqA813qqUBmbOZK3FjbNk4EniptfeM8os+ENPQmtlG6n68TKU9DUY3kjq2ObyyDuGI3Kj3Tu4dkWbonWSlqThkzlZvcN1f5WAJ8I6dZNQ6WsYzGDSpp3uhHW+NWurc8j3xXWndnNZTMHp7z1GYZOo6kbjhve/epPhEsmCbe+GOaaLiMU/tcqQ1Ui3/y5IJ7AXZj9AsYWj9eq+mbBMJcDfLnqQw/MQHHjeMLE+k69cS26aYoZQb4EAAYA2GQUE3jGHA4rbHVqlotrRmrCTdFyqScLEy1a4sSjt1sS94LH1ippEyp0VWkNk6GzqLhZssnhfgRmDwI7jF+1ukJMkAzZiSwTZS7qgJ7BiIvEQ2lauisphUSbPMlAspU3xy97KCMifvDkRxjp7PszH8JDo6uSfLSbLN0dQyn6g9hBuCO0RlRT2zfWoU7mnnOFkvcozHqo+/edytn48zFuyZquoZGDKRdWUggjtBGREeXmxuK14LxW0dkIQiRQQhCADTa4UHT0VRLtc9GWUfiTrr6qIr/AGO1+CpmyScpksMvZiln64XPyxbBF8juOXnFJajDBpWWoyAmTE8Arj9BHo/CrlHN8hdi9oQhHpHAIQhAAiutsWkcEmVTj/iOXb4Ze4fMyn8sWLFJbVK4za/oxmJSKij8b9dv6lHhGbfY3C3RLtlWjejpTNYWac5I7cCdVfAkMfGJvGFoai6Cnkyd/Ry0QntIUAnzvGbHg5K3bZ6ULSOmrqFlo8xvZRWduSgk/SKI0PKevr0xi5nTcbjgFvjYcgot5RbWv9WJdBPJ3uvRjm5C/Qk+EQ/Y1o/FUTqgjKWglr8Uw3PkE/njs+JOpdEsr20i1dL1Al08174Qkt2v2YUJFo8xDJc+Aj0Vry5Gj6oj/SYeeR9DHnqQmJ1XiWA8yBHUibPSmr9OUppCHespFPMILxsI4otgB2AD0jlCNoQhCEAhCEAGFpHRFPUACfKSYBuxqDbkd4jF0VqzSUzF5EhEcixYYibHeAWJsOUbeBh7DRRW1arL17JfKXLRAOwkY288Q8hE62QMTQEE3AnOFHYCENh4knxitNoD30jVW4OB5IoMWlsmlW0cje9Mmnycr/bDfBhckE2paAl01QjyhhScGYoNyupAJXsBxA27bxPNnaYdH0+/MOc++Y+7uiMbapnXpU/BMbzZB+kS3UVMNBTD8GL5mZv1jm+V9EUx8s35jU6L1jpalnSRNV3TMgBhle11LAYhe2YvvEZWlnwyJzE2Alub9lkJvFTbJFP8aTwFO/hd5cc2PGqh0/BSq00i5YQhECgMU3IIpdN9a2H+IOZAAtOFwR2e2B4RckVLtao2SplVC5Y0w3/HLa4J8GXyjq+JWr0RzLclxQjD0NXiokSpw++it4kZjzvGZHsI80QhCGAih9YctLvizH8Ul+WJDbyyi+IojXhei0rNY7uklzPDCjfoYll+pTF9i7zCIPrprs1JMlpKRHxoJjFibYSThAw9tib8olOg9KJUyEnpkHGanerA2ZTyIMeLeOpXU+D0Vab0Q/a9MIppK33zcxyRv3jM2NS7Uk1uLTj6In7xr9sCEyadgMhMYHmUy+hjZ7HT/wCSf/nN/Qkd/wAf/mSv7E4qqZJiPLdQyOpV1O4qwsRES0bs3opM5Zw6RsDBkR2BUMM1O67WOYueAiZwiotCEIQgEIRo9ca6fIo5s2nXFMULbLFhBYBmw8bKSbd0MGbyEUjTbUa1ZbIwlzHN8M0ixW/ai2VvTxiTbLNKV1Q816h3eTYYXe1sd8whtute4GQyh6F1FkQMIRkZU2vuotTOrGnUyB0mBS3XVSrgWa4a2RAU5X4xP9UdEtSUkqQ5BdFJfDuxOxZgDxALWv3RuoQ2xJaKV2x1ANYie5JF/wAzMfoBFl6vSClLTod6ykB54BFRa5HptLTEOYafLl2/CAiEfWLuAtlHL8t9kjeLlsjW0Kr6OgndrgSx+dgD/LiiK7HqXOpmnsRF/mZv7Iy9r9VaVIlA+27OR3Ith6vG12Y0mCgViM5jvM8L4F9F9Yx9cP8AR82S+EIRyFhES2l6P6WhdgLtKImDuAyf+UnyiTyqpGZkR0Zl9pQwJHMDdGp1znKlDUljYGWyjvZhhUeZEUx7m0YemmafZFpLHSPKO+S9h8L3YeoeJ5FYbF1bDVGxwEygDwxAPiHkV84s+Peng82/sIQhDMiKv2vaDJwViDdaXN5X+zY+JK/mWLQjoraRJyNLmIHRxZlbcRGaW0Oa09nmyoqXmFcbFiqrLW+ZCrki99olOoGtP8JMMqaT0Ew9a/3H3YuXA8rxNqLZjTJUCaXd0VsSyWAtfeoZ97KDw7hcnO+u181AZ2appFu7EmZKBAuT95L8TxXjw743iVT0stORKjf6+aPNTQTAnWZQJqWzxYMyB23XF5xX2zfWxaKY6TiRIm2JYAnC43NYZ2INjyWMLQ2uVZRqZIIYLlgnKSUPEDMMvwn0jE0nVUlQWmKj001hdkUB5LNxK2s6X5ERDFFRuXwWqlXdHoamqUmKHR1dGF1ZSGB5ER3R5s0LrDU0hvTzWQE3KZMjc1YEeIsYsjQG1WWww1aFG9+WCyHmvtKfOKtCTLLhGlota6GbklTKJ90sFPytYxtZVQj5qysO1WB+hhGtnbCFo+2gA08/ViidizUshmJuWMtLk9+WcbWWgUBVAVRkAAAAO4DdHKMSq0jJlZzZsuX8bon9REAGXCNLUa20CC7VcjksxHPkhJjSVO07R6ey8xz2LLcer2EGmLaJrCK2nbXZFjgpppPDEyKPGxNo01ZtZqWFpciUmW9mdz4WwiH0sXUjRUJ6fS4J+9Vu3grs49FEXiYpDZugfSMstvAmOPiwNv8AAsfKJNr5ryAGpqVwSQVmTVPs8Cksj73a3DcM93Lmh3aS9FIpTO2RnXjSD1deUQ4grLIlAbib2J8XY+CiLk0VQiRJlyVzEtFS/bhFifE3PjFBaB0kKaek/AJhS5VScIxEWBuAd17xKZu1CrJOGXJUcBZ2t44s4eXDVJTPCFNJPbLfMaDW/WFKOQxxDpWBEtL5ljliI4KN9+6K2/220nUkS5TAMdwlIMR8TeNhobZ1VVD9JWOyKTdsTY5jd18wvjflCx/Ee90F5kl2I1qXWLKrpMx3wLibG5NhYo18Z4gkiN5rjp99JT0pqRWdA3VGY6R/eIO5ANxPeYw9JahVyT3SXIZ0xnA+JMJQnq3JO+1r5cDFn6mappQy8wrz2HXf+xL7lHrvjqWFOtsg8ulpGdqroNaKmSSDdvadvec2xHlkAO4RuIQjpS0czexCEIYCEI6ayrSUjTJjBEQXZjuAgA7owtJ6Xp6ZcU+akscMTAE9yrvY9wEVBrnr29UejkF5cgHtwu/e1vZX8N+fZGs1V1PqNIFmlsiojBXmOTcGwayqM2NiOwd8YdFFj9kn1t100fPuFpP4hgLCY95VuTAYz6RXcxg72RMN/ZRC7+WIljF0aE2VUkqzT2aew4HqJf4VNz4kxNqHRUiQLSZUuX8Cqv0EYb2VS0eeaDU6vnZpSzLe84EsfzlSfCN//wCHM2RTzamsdVWXLdxLlnEzMB1AXtZRite1/CL0tEQ2pVODRs/tfAg/NMW/oGhDKd1Q1XfSEx5aOqYExlmUsM2sBYEb8/KJLM2TVqn7OdKPfd0/Qxl7D1PS1R4YJYv34ni4oAKPfZtpQbpiHlOcfVYiul6WtpHEue06WxF1u7kMO1WVrHw3R6aiO65auLXU7SicLg4pbe64Btf8JuQefdAB5+lyqib1wXfhiL39Sbxj1NK6HrqQTxOd/HjGbo+c1POZJgK2YpMU/dZThPkR5Rx0xOM2dhTrZiWgHFibZcybRnb3o6nGL8PUn33rRv8AVTUCfXSumV0loWKqWBYthyJAHC9xcneDExpNj8gW6SpmsfvBFRAeWIMRE+0Do1aenlSF3Iiqe826x8SSY2UaOUhEnZho5bXluxHvTHz5gEDyhp7UmlSjqFpqZOlMpgjWLPiw5YWa5B5RN4+EQAeXNHUlQ7lJCTWmEFSqBsVj7Qa3sjtvaLA1Y2YzMLTqtbMqsZdPcHE2E4ekZTa17dUeJ4RcWER9MAHm7UjQsmrqRTz2dMSNgZCgOJRcghlPAN5RPqnY9Lwno6qYG4Y1Rl8kwmIbrGhoNLM65BJyTVt7jkOw8iyx6DQ3FxuOYgAo6u2UVyZo0qbyYofAMLesa/8A2Y0zJuFl1IH/AMcy48le/pHoSEAHnroNNIPZrgOUxvpeOt9Y9K0zKZkyenuichs1t+TrmOUeiLRVG3B8qVe+YfRBD2LSNzq7r7S1CosyYsqcQA6PdVLccDt1SOwXvnEvEUjQbPZ1RSJUyHV2dSTKYYTkxHUe9ictxA5x81O1qn0U8SJ+LosWB5b3vKN7YlvuA4ruIjSsxWPyi74R86Qe96iEb2S0z7FXbYtLMOipVNlI6V++xKoD3XDHmB2RaMU3tgpGFXLmEHA8pVDWyxIz3F+2zA2hVwajk12lNXlptGSZ8xQZ9TMXDc+xKws4sN1yFQk/itFg7F6fDRO/vz2I5KiL9VMVzrRrZ/GSKaV0eAyRYkNdWIRVBUWGHIHLvi39mlN0ejaccWVnP53Zh6ERFHQyVwhCGIRWW2yqIp5EoffmljyRD+rCLNim9t1TefTS75KjuR3swA/oMAEi2N0IShabxmzGN/wp9mB5qx8YsKI1s9p+j0dTLa15eO3xsX/uiSwAI+R9hABUG2HV6WmGtQ4WmOst1tkxwsQ9+BAUg9uUQjUyrkyq6nmVA6ivmeCsQQjN2gMQfC/CLE231I6KmlcWmM/giFfq4irJtCRJSbwJIYd1yAf0hNmox1e2vHc9Rqco5RXuyzWkVEgU0xvtpQstzm8seyw7SvsnkDxiwoZkQhCABCEIAKV21aPw1EqeBlMlmW3xIxI8bP6RZupmkRUUVPMvclArfEnVb1BjQ7XqDpKAzALtKmK45McDf1DyiG7Pde5NFIaRPWYRjLoyKGADAXBBYHeCfGAC7YRo9Baz0lYPsJysw3obq4/K1jbvGUbu8AH2Kf24TPtKVfwTD5sg/SLfikttFTirJacEkg+Lu97/ACiACf6jTETRtMWZVHR3JYgAXJOZMVDr7pCXV17tT9ZWCSww++w6uJe29wo7cIjIlbOK11R1SWyuqsrFwLBlBFwRcb4m+pez4UzrPqWV5q+wi5oh9659puzIAQ1L2J2tG8/w2d2nzH7wiQ5/9n/pH2KaI9YjHrqKXOQpNRXQ71cXH/QxkQjRgpLaZq/JpJ0syEKJMQki7MMamxtiJtkVyvFq7Pq9JtBT4Dfo0WW44qyDCQRw7eREdWt+rqV1OZZOF1OOW/uuBbP8JFwefaIp1BpHRbthEyST7RCh5bW7yCjfUd0Sc9y81tHo6OqfOVBidlVRvLEAeZjz+2t+lak4Umzm4FZKAHxKJi9Y+S9UdKVJxPLmG/3p729HN/SFpmtpFnaV2nUEoEI5nuBkstWsT/zGAW3K8U/rVp56+o6Z0CEqstVUkgAE2zO8ksYm+iNlFxeqnkHLqSbZdt3cG/gIhOiaNZlfLlIOoakKo3nAszieJwLvga0JUnwejdGSMEmWg+6iL8qgfpGXHwR9hGhCEfIAKZ22zL1FOvuynPzOLf0xpqCUGkIjC4KC455x2bW6kvpBl9yWiDmQX/uEdslMKqvYAPIRLI+D1v8Ayo3Vb9EXLTKOoR5bEMjB0PaAdx7jmpHYT2x6P0PpFKmRLnobrMUMO48Qe8G48IoXWKUplhybMp6vffeP18Im+xOrcy6iUc5aOjL3M4bGB8qm3fGpe0cnzMKxZWlwWnCEI2cghCEAGr1joRPpZ8k/flOo5lThPnaKC1J0LKragyJrul5bOjJhviUrkQwNxYnyj0gY89WOj9LWNwsufyvLmfphf0hrkT4MrTOzmsp2xyPtlGYaWcLr34L3v8JPKOjRuvmkqRgjuzgf8OoQ3AHYxs/mTyi84xa7R0qepWdLSYp4Oobyvujbkksj8kP0PtZp3stQjySd7qC6egxAeBivtZp/+IaTYI2JZkxJUtl4J1VuP5m8TE80vsupnu0h3kn3T9onkxxD5ozdT9Q5dG3SzGE2cCcDhSqoCLdVST1t+Z7YypezbtaJhLQKAoFgAAB3AWEcoQipAQhCABCEIAEIQgAXhCEAGDpuqMqmnTBvSW7DmEJEU1sqpA+kZN8+jV38QhUerXi1deqjBQVJ7ZZQc3IT+6Kx2W6TpqaomTqiassdHgS4Y3LMC3sg2sFHnE7LY+C/IRp6TWWimkLLqZLMdyh1vn3XvG3BjBQ+wj5ePsAFTbVtT2YtXSQWyAnpvNlFg68gACPHtiB6H0wFASYch7L9ncf0MekzFU667NgzNPpGRCes0liEUniZbHJSd+E5d4jNSnyWw57w1uSuKua9TORJalizBJa8SWNs+eXIRf2p2riUNOspTic9aa3vOQAbdijcB2CIjqjQaO0Yomz6mSall6xxq2C+9Jarc9xO8xm1+1eiTKWk2b3qoRfNyD6Q0tIxkuslOq5ZYUIpur2wTiT0VMirwLuzHxAAAjUVO1LSL+y0pB+BLnzdmhmC8K6vlSULzXVFG9nYKPMxBtO7VKWVdadWqG7QcCfOQSfARUlS1TVv0k12dvfc5DuXsHcBGVT6GUZu2LuGQjFZJnk3MNm30xtKrqjqoyyFOVpYu3ztn5ARE6xJp680uxb7zksx5ljfziSyqdE9lQOQ/WOrSUjHLYcRmOYiSz7pLRR4dLey3NSNK/xNFJcm7hcD/HL6pPjYHxjfRUux7SuGbNpm3TF6RPiSwYeKkH8hi2o7pe0cFrTEIQhmRCEIAEIQgAQhCABCEIAEIQgAi+0n/d0/8n9axQzcI+widlsfB1T/AGfH9RFr6kb5XKEIwULbWPphCADiYoTa7/nHmfoYQgAhcrf/AN98fVj7CAAntCN/QwhEqKybNf2hCEcdnSuBHFtx5QhCXKG+DG2b/wC8ZH5//wA3i+oQj1o4PKyciEIRsmIQhAAhCEAH/9k="
}'
```

Here's the result:

![Postman](/uploads/2024-03-20-anime-poster-generator-2/Screenshot2024-03-20224957.png)

![pdf](/uploads/2024-03-20-anime-poster-generator-2/Smol-Ame-pdf-2024-03-20-22_51_51.png)

## Next lecture

[Anime Poster Generator 3: I can do frontend](/en/blog/2024-03-21-anime-poster-generator-3)
