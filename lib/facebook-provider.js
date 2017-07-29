/**
 * Created by usulix on 7/5/17.
 */
/* @flow */

import * as https from 'https'
import type {fbAuthOptions} from "./flowTypes.js";

function getAccessToken(options: fbAuthOptions){
    return new Promise((resolve, reject)=>{
        console.log(options);
        https.get("https://graph.facebook.com/v2.10/oauth/access_token?scope=email&client_id="+
            options.facebookAppIdKey+"&redirect_uri="+options.redirectUri+
            "&client_secret="+options.facebookAppSecret+"&code="+options.code, (resp)=>{
            resp.setEncoding('utf8');
            resp.on('data', (d)=>{console.log(d)});
            if(resp.statusCode===200){
                resp.on('data', (s)=>{
                    let d = JSON.parse(s);
                    if(d.access_token) {
                        resolve(d);
                    }else{
                        console.log(d);
                        reject('no token');
                    }
                })
            }else{
                reject('facebook returned a '+resp.statusCode);
            }
        }).on('error', (e)=>{
            reject(e);
        });
    });
}

function validateAccessToken(options: fbAuthOptions, token){
    return new Promise((resolve, reject)=>{
        console.log(options);
        console.log(token);
        let fburl = "https://graph.facebook.com/debug_token?input_token="+token+"&access_token="+
            options.facebookAppAccessToken;
        console.log(fburl);
        https.get(fburl, (resp)=>{
            resp.setEncoding('utf8');
            resp.on('data', (d)=>{console.log(d)});
            if(resp.statusCode===200){
                resp.on('data', (s)=>{
                    let d = JSON.parse(s);
                    resolve(d);
                })
            }else{
                reject('facebook returned a '+resp.statusCode);
            }
        }).on('error', (e)=>{
            reject(e);
        });
    });
}

function getUserDetails(token){
    return new Promise((resolve, reject)=>{
        https.get("https://graph.facebook.com/me?fields=id,name, email&access_token="+token, (resp)=>{
            resp.setEncoding('utf8');
            resp.on('data', (d)=>{console.log(d)});
            if(resp.statusCode===200){
                resp.on('data', (s)=>{
                    let d = JSON.parse(s);
                    if(d.name) {
                        resolve(d);
                    }else{
                        console.log(d);
                        reject('no name');
                    }
                })
            }else{
                reject('facebook returned a '+resp.statusCode);
            }
        }).on('error', (e)=>{
            reject(e);
        });
    });
}

export function facebookProvider(options: fbAuthOptions): Promise<*> {
    if (options.eventType === 'access_token') {
        return new Promise((resolve, reject) => {
            getAccessToken(options).then(
                (accessresp)=>{
                    validateAccessToken(options, accessresp.access_token).then(
                        (validateresp)=>{
                            if(!validateresp.data.is_valid||validateresp.data.app_id!==options.facebookAppIdKey){
                                reject('Invalid access token');
                            }else{
                                getUserDetails(accessresp.access_token).then(
                                    (resp)=>{resolve(resp)},
                                    (err)=>{reject(err)}
                                );
                            }
                        },
                        (err)=>{reject(err)}
                    )},
                (err)=>{reject(err)});
        });
    } else {
        return new Promise((resolve, reject) => {
            reject(new Error('eventType not recognized ( request_token, access_token, or user_verify )'))
        })
    }
}