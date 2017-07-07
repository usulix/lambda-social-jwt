
import * as fbadmin from "firebase-admin"
import {twitterProvider} from "../lib/twitter-provider"
import * as config from "../config.json"

var index, db, socialRef, twitterRef;

type Event = {
    query: {
        provider: string,
        state: string
    }
};

function errorResponse() {
    return {
        "isBase64Encoded": false,
        "statusCode": 500,
        "headers": { },
        "body": "There was an error"
    }
}

function handleTwitter(event) {
    return new Promise(function(resolve, reject){
        var authOptions = {
            "eventType": "",
            "twitterKey": config.twitterKey,
            "twitterSecret": config.twitterSecret,
            "callback": config.twitterCallback,
            "token": "",
            "tokenSecret": "",
            "tokenVerifier": "",
            "oauthToken": "",
            "oauthTokenSecret": ""
        }
        switch(event.query.state){
            case "request_token":
                authOptions.eventType = "request_token";
                twitterProvider(authOptions)
                    .then(function fulfilled(resp) {
                        index = resp.request_token;
                        var record = {};
                        record[index] = {
                            "request_token_secret": resp.request_token_secret,
                            "updated": Date.now() / 1000 | 0
                        }
                        twitterRef.update(record);
                        resolve({"provider":"twitter", "token":index, "location":"https://api.twitter.com/oauth/authenticate?oauth_token="+index});
                    }, function rejected(error) {
                        reject(new Error('Promise was rejected. Result: ' + error));
                    });
                break;
            case "access_token":
                twitterRef.child(event.query.oauth_token).once('value').then(function (snap) {
                    authOptions.eventType = "access_token";
                    authOptions.token = event.query.oauth_token;
                    authOptions.tokenSecret = snap.val().request_token_secret;
                    authOptions.tokenVerifier = event.query.oauth_verifier;
                    twitterProvider(authOptions)
                        .then(function fulfilled(accessresult) {
                            authOptions.eventType = "user_verify";
                            authOptions.oauthToken = accessresult.access_token;
                            authOptions.oauthTokenSecret = accessresult.access_token_secret;
                            twitterProvider(authOptions)
                                .then(function fulfilled(detailsresult){
                                    detailsresult = JSON.parse(detailsresult);
                                    var additionalrecord = {};
                                    additionalrecord[event.query.oauth_token] = {
                                        "access_token":accessresult.access_token,
                                        "access_token_secret": accessresult.access_token_secret,
                                        "userEmail": detailsresult.email,
                                        "userName": detailsresult.name,
                                        "userLocation": detailsresult.location,
                                        "updated": Date.now() / 1000 | 0
                                    }
                                    twitterRef.update(additionalrecord);
                                    resolve({"provider":"twitter", "token":event.query.oauth_token});
                                })
                        }, function rejected(error) {
                            reject(new Error('Promise was rejected. Result: ' + error));
                        })
                });
                break;
            default:
                reject(new Error('no '+event.query.state));
        }
    });
}

export function handle(event: Event, context: any): void {
    if (!config.firebaseKey) return context.fail(new Error('No firebaseKey in config'));
    if (!event.hasOwnProperty('query') || !event.query.hasOwnProperty('provider') || !event.query.provider){
        return context.fail(new Error('No provider specified in event object'));
    }
    var fbConfig = {
        credential: fbadmin.credential.cert({
            projectId: config.firebaseProject,
            clientEmail: config.firebaseEmail,
            privateKey: config.firebaseKey
        }),
        databaseURL: config.firebaseUrl
    };
    if (fbadmin.apps.length === 0) {
        fbadmin.initializeApp(fbConfig);
    }
    db = fbadmin.database();
    socialRef = db.ref("social/");
    twitterRef = socialRef.child('twitter');

    switch(event.query.provider){
        case "twitter":
            handleTwitter(event).then(function fulfilled(result){
                context.succeed(result);
            }, function rejected(error){
                context.fail(error);
            });
            break;
        default:
            context.fail(errorResponse());
    }
}