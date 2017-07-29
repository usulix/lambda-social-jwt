/* @flow */
import type {Event} from "../lib/flowTypes.js";
import type {Db} from "../lib/flowTypes.js";
import {handleTwitter} from "../lib/twitter-handler"
import {twitterProvider} from "../lib/twitter-provider"
import {dbProvider} from "../lib/db-provider"
import * as config from "../config.json"
import {handleFacebook} from "../lib/facebook-handler"
import {facebookProvider} from "../lib/facebook-provider"

let db: Db;

function errorResponse() {
    return {
        "isBase64Encoded": false,
        "statusCode": 500,
        "headers": { },
        "body": "There was an error"
    }
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
            handleTwitter(event, config, twitterProvider, db).then(function fulfilled(result){
                context.succeed(result);
            }, function rejected(error){
                context.fail(error);
            });
            break;
        case "facebook":
            handleFacebook(event, config, facebookProvider, db).then(function fulfilled(result){
                context.succeed(result);
            }, function rejected(error){
                context.fail(error);
            });
            break;
        default:
            context.fail(errorResponse());
    }
}