---
author: "Franco Becvort"
title: "[The perfect software project #01] - Kick off"
date: 2023-07-27
description: "Let's create a base scenario before getting our hands dirty"
categories: ["The perfect software project"]
thumbnail: /uploads/2023-07-27-the-perfect-software-project-001/kickoff.jpg
---

## Main plan

The idea of this series of posts is to do web development following the architectures discussed [here](/en/blog/2023-07-26-the-perfect-software-project).

This is gonna be improvised as I don't know how many posts it will take. The plan is:

1. Create some scenario.
2. Achieve it using monolith.
    - Which monolith framework? idk yet, next post I'll discuss the options.
3. Achieve it using fronend + backend.
    - Which frontend? also idk yet. Probably Next.js (React). But I'm gonna consider Angular (I have a course already bought), or Svelte (seems to be gaining popularity).
    - Which backend? Spring Boot. I'm gonna try using version 3.
4.  Achieve it using microservices.
    - Spring microservices for sure.

I expect this to be a long personal project, that's gonna take much much time, months, hopefully not years, although I wouldn't mind.

For each approach, I'm planning in creating a repo, so everything in the thought process is kept archived. And I'm gonna take advantage that this is a personal project that has no deadline, so I will probably go back on my own steps and change much stuff if that means better code.

## Features expected in your typical software project

I asked ChatGPT "enumerate some features that are expected from a software web project", and it gave me a 20 items long list.

The specific features required can vary depending on the project's nature and purpose, but here is my personal top 5 features that are commonly expected from a software web project:

1. **Responsive Design**: I'm not frontend dev, nor designer. So for me, as long as it looks good on pc and not so broken on phone, is a win for me.

2. **User Authentication and Authorization**: User registration, login, and secure access control to restrict certain parts of the website based on user roles and permissions.

3. **Database Integration**: Storing and retrieving data from a database to manage user information, content, settings, etc.

4. **User Profiles**: Allow users to create and manage their profiles, including profile pictures, personal information, and account settings.

5. **File Upload and Download**: Allowing users to upload and download files, such as documents, images, or videos. This is gonna be tricky, as I might need to set-up some cloud bucket for this.

## Base scenario: a little SIGEM clone

Yes I know, a clone, how basic. But I wanna be basic and unoriginal that coming up with something I don't know might workout in the end.

So, what is [SIGEM](https://sigem.sanluislaciudad.gob.ar/sigem/)? Is the very first project I was part of, which I'm still part of from almost 2 years now. I'm the oldest remaining developer, and SIGEM has a special place in my heart.

SIGEM in an nutshell is a page where San Luis city citizens have to login to make some boring paperwork every once in a while. It does lots of stuff, but it has two faces

- When a citizen logins succesfully, we allow them to see a menu of different operations they can do. And depending the specific operation, the citizen must fill some form, and then wait for a response about the status of the operation (usually a sms notification). Also, they can check the status of the operation in the webpage.

- When a civil servant / public worker logins succesfully, we allow them to see a different menu, according to their permissions. They are responsible for checking, approving, and denying the forms filled by the citizens.

So here are the things that our clone page is expected to do.

### Basic profile admin stuff

- As anybody, I want to be able to see a welcome page when accesing the base url.
- As anybody, I want to be able to request a new account, so I become a registered citizen.
- As a citizen administrator, I want to be able to review, approve or deny the request of an account, so I make sure only real and valid people are registered citizen.
- As a registered citizen, I want to be able to see and update my profile, so my personal info is up to date.

### Commercial permits

- As a registered citizen, I want to request a commercial permit for my business, so I comply with current regulations.
- As a registered citizen, I want to check the current status of my commercial permit request.
- As a commercial administrator lvl 1, I want to review, approve or deny the starting request of a commercial permit, so the permit itself goes to the next stage fo revision.
- As a commercial administrator lvl 2, I want to be able to give the final approval of a request of a commmercial permit, or deny it, so the permit itself becomes valid.

## Conclusion

So yeah, this is gonna be a long ride.