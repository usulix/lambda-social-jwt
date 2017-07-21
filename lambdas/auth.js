
import {twitterProvider} from "../lib/twitter-provider"
import {dbProvider} from "../lib/db-provider"
import * as config from "../config.json"

type Db = {
    twitterRef:{
        update:(any)=>void,
        find: Promise<any>
    }
};

type Event = {
    query: {
        provider: string,
        state: string,
        oauth_token: string
    }
};

var index, db: Db;

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
                        db.twitterRef.update(record);
                        resolve({"provider":"twitter", "token":index, "location":"https://api.twitter.com/oauth/authenticate?oauth_token="+index});
                    }, function rejected(error) {
                        reject(new Error('Promise was rejected. Result: ' + error));
                    });
                break;
            case "access_token":
                db.twitterRef.find(event.query.oauth_token).then(function(res){
                    authOptions.eventType = "access_token";
                    authOptions.token = event.query.oauth_token;
                    authOptions.tokenSecret = res.val().request_token_secret;
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
                                    db.twitterRef.update(additionalrecord);
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
    try{
       db = dbProvider();
    } catch(err){
        context.fail(new Error("Could not access database : "+err));
    }
    if (!event.hasOwnProperty('query') || !event.query.hasOwnProperty('provider') || !event.query.provider){
        return context.fail(new Error('No provider specified in event object'));
    }

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