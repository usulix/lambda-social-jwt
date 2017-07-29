/**
 * Created by usulix on 7/5/17.
 */
/* @flow */
import type {twAuthOptions} from "./flowTypes.js";

var OAuth = require("oauth").OAuth,
    url = require("url");

export function twitterProvider(options: twAuthOptions): Promise<*> {
    var twitterOAuth = new OAuth("https://api.twitter.com/oauth/request_token",
        "https://api.twitter.com/oauth/access_token",
        options.twitterKey, options.twitterSecret,
        "1.0A", options.callback || null, "HMAC-SHA1");
    if (options.eventType == 'request_token') {
        return new Promise((resolve, reject) => {
            twitterOAuth.getOAuthRequestToken((err, token, token_secret, parsedQueryString) => {
                if (err) {
                    reject(new Error('Could not get request token'));
                    return;
                }
                if (!parsedQueryString.oauth_callback_confirmed) {
                    reject(new Error('Callback URL rejected by Twitter'));
                    return;
                }
                resolve({
                    request_token: token,
                    request_token_secret: token_secret
                });
                return;
            });
        });
    } else if (options.eventType == 'access_token') {
        return new Promise((resolve, reject) => {
            twitterOAuth.getOAuthAccessToken(options.token, options.tokenSecret, options.tokenVerifier,
                (err, token, token_secret, parsedQueryString) => {
                    if (err) {
                        console.log('rejecting promise '+JSON.stringify(err));
                        reject(new Error('Could not get access token'));
                        return;
                    }
                    resolve({
                        access_token: token,
                        access_token_secret: token_secret
                    });
                    return;
                });
        });
    } else if (options.eventType === 'user_verify') {
        return new Promise((resolve, reject) => {
            twitterOAuth.get("https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true&skip_status=true",
                options.oauthToken, options.oauthTokenSecret,
                function(err, data) {
                    resolve(data);
                });
        });
    } else {
        return new Promise((resolve, reject) => {
            reject(new Error('eventType not recognized ( request_token, access_token, or user_verify )'))
        })
    }
}