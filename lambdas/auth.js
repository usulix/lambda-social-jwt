
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

function handleTwitter(state) {
    return new Promise(function(resolve, reject){
        switch(state){
            case "request_token":
                var authOptions = {
                    "eventType": "request_token",
                    "twitterKey": config.twitterKey,
                    "twitterSecret": config.twitterSecret,
                    "callback": config.twitterCallback,
                    token: '',
                    tokenSecret: '',
                    tokenVerifier: '',
                    oauthToken: '',
                    oauthTokenSecret: ''
                }
                twitterProvider(authOptions)
                    .then(function fulfilled(resp) {
                        index = resp.request_token;
                        var record = {};
                        record[index] = {
                            "request_token_secret": resp.request_token_secret,
                            "updated": Date.now() / 1000 | 0
                        }
                        twitterRef.set(record);
                        resolve({"provider":"twitter", "token":index});
                    }, function rejected(error) {
                        reject(new Error('Promise was rejected. Result: ' + error));
                    });
                break;
            default:
                reject(new Error('no '+state));
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
            handleTwitter(event.query.state).then(function fulfilled(result){
                context.succeed(result);
            }, function rejected(error){
                context.fail(error);
            });
            break;
        default:
            context.fail(errorResponse());
    }
}