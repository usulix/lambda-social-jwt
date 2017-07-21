# lambda-social-jwt
> One Ring to rule them all, One Ring to find them,<br /> One Ring to bring them all and in the darkness bind them 
### Handle social logins through aws lambda and return json web tokens for microservice architectures.

Ok, so why the LOTR quote ?

I have a lofty goal for this repo and I thought the One Ring quote was an appropriate - if slightly nefarious - 
description of those goals.

Twitter currently uses OAuth 1.0 whereas Facebook uses 2.0 and Google Sign In uses what seems to be a Google version of 
something in between. Specifically, with regard to Google, my current research indicates that I must initiate the sign
in from my web app and then pass the results to a server-side implementation for validation and processing. Grrr.

Adding more complication to this process is my desire to break my web app into microservices and the problems with 
maintaining user state in those scenarios. So, instead of simply storing {"loggedInUser":"bob@example.com"} in the 
session, I need the user to receive a json web token into which I can populate various identifiers and roles to be
carried by the user during his/her journey through my various microservice subdomains.

Furthermore, my login microservice is only involved in interacting with OAuth requests, accessing a data store, and 
creating json web tokens... I don't want a full server installation for that. I can use a PWA on Cloudfront and hit
a Lambda function to do that work.

The goal of this repo is to provide that Lambda function

### Current development specifications
+ a web component should be able to trigger OAuth sign in with a POST to the Lambda function containing a payload
specifying the social provider and get back a jason web token built from the app's users and roles tables in 
<s>Dynamo DB</s> Firebase.
+ OAuth login flow initially for Twitter, Facebook, Google, and LinkedIn with more providers to be added

### Notes
+ Originally my intention was to use Dynamo DB for storing user information, but as firebase provides a user friendly
web interface and the node_module worked easily, I went with the simpler solution.

### Future good intentions
+ <s>Move the database interactions into a provider to allow easily switching storage services.</s>

### Changelog
+ 2017-07-15 moved database interactions into provider to prepare for extending providers 
 
### Credits
+ project basic structure borrows heavily from <https://github.com/rricard/lambda-es6-example> 