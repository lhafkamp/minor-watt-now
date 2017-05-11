<h1 align="center">
  <img width="55%" src="media/example.png" alt="example">
  <br>
  <br>
  Sigma
</h1>
<br>

## Use case
Team-infra is working hard to keep the generators running at festivals. They want to be up-to-date about the status of their generators from anywhere, at any time. With the right information the team knows when they have to turn on a spare generator and when to turn it off. They need this information to manage the use of the generators in order to use the least amount of voltage required.

## The challenge
Create a solution for team-infra that helps them manage the generators and thus saving costs.

## Our solution
Our application contains an algorithm that checks if the voltage peak is rapidly increasing/decreasing or if a generator is low on its 2G budget. Once it makes a prediction it sends a notification to the infra-team, informing them there might be an increase in voltage soon.

The infra-team also gets to see a real-time graph that displays the voltage usage of a generator so they can accurately make a decision based on the notifications and what they actually see.

## Saving costs
When our application can inform the team that they need to turn on an extra generator before the peak happends, they can make sure never to waste any unnecessary resources and thus saving costs.

## The notifications
There are 4 types of notifications:
-  [x] the voltage is gonna peak soon
-  [x] the voltage is gonna fall soon
-  [x] the voltage is gonna peak soon but this is expected because a band is gonna start playing
-  [x] the 2G credit is running low

With this information they can see how they need to handle their generators.

## Features
-  [x] progressive web app
-  [x] algorithm that predicts when a generator is gonna spike or not
-  [x] real-time notifications about different issues concerning the generators
-  [x] real-time D3.js graph that shows how much voltage is used per minute
-  [x] history of old notifications

## How does it work?
The app gets real time data from the generators at the festival. It uses an algorithm to determine if the infra-team members need to get a notification. The notifications are real-time and have a badge when they are not read.

## How does it work?
The app gets real time data from the generators at the festival. It uses an algorithm to determine if the infra-team members need to get a notification. The notifications are real-time and have a badge when they are not read.

## Build
To run the application:
```bash
git clone
```

To use the app you need to run the following commands:
```bash
npm install
```

To install the Node dependencies.

```bash
npm start
```

To start the server.

## Wishlist
-  [ ] multiple working graphs
-  [ ] uploading new timetables to the app
-  [ ] getting real 2G credit data that sends a notification once its low

## Team

![Luuk Hafkamp](https://avatars0.githubusercontent.com/u/14187210?v=3&s=150) | ![Sjoerd Beentjes](https://avatars3.githubusercontent.com/u/11621275?v=3&s=150) | ![Merlijn Vos](https://avatars1.githubusercontent.com/u/9060226?v=3&s=150) |
---|---|---
[Luuk Hafkamp](https://github.com/lhafkamp) | [Sjoerd Beentjes](https://github.com/Sjoerdbeentjes) | [Merlijn Vos](https://github.com/Murderlon) |

## Sources

<a href="https://d3js.org/">d3.js</a>
<a href="https://socket.io/">socket.io</a>
