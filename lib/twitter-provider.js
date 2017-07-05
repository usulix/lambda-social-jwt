/**
 * Created by usulix on 7/5/17.
 */
/* @flow */

var OAuth= require("oauth").OAuth,
    url = require("url");

type AuthOptions = {
    eventType:string,
    twitterKey:string,
    twitterSecret:string,
    callback:string
}

export function twitterProviderGetRequestToken(options:AuthOptions) :Promise<*>{
    var twitterOAuth = new OAuth("https://api.twitter.com/oauth/request_token",
        "https://api.twitter.com/oauth/access_token",
        options.twitterKey, options.twitterSecret,
        "1.0A", options.callback || null, "HMAC-SHA1");
    if(options.eventType == 'request_token') {
        return new Promise((resolve, reject) => {
            twitterOAuth.getOAuthRequestToken((err, token, token_secret, parsedQueryString) => {
                if (err) {
                    reject(new Error('Could not get request token'));
                }
                if (!parsedQueryString.oauth_callback_confirmed) {
                    reject(new Error('Callback URL rejected by Twitter'));
                }
                resolve({
                    access_token: token,
                    access_token_secret: token_secret
                });
            });
        });
    } else if(options.eventType == 'auth_token'){
        return new Promise((resolve, reject)=>{

        });
    } else {
        return new Promise((resolve, reject)=>{
            reject(new Error('eventType not recognized ( request_token or auth_token )'))
        })
    }
}