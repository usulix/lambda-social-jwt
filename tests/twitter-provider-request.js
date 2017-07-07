/**
 * Created by usulix on 7/5/17.
 */
import assert from "assert";
import {twitterProvider} from "../lib/twitter-provider.js";
import * as fbadmin from "firebase-admin";
import * as config from "../config.json"

var fs = require('fs');
var db, socialRef, twitterRef, index;

describe('twitterProviderGetRequestToken', function () {
    before(function (done) {
        if (!config.firebaseKey) throw new Error('No firebaseKey in config');
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
        done();
    });

    it('should reject an incorrect eventType', function (done) {
        var authOptions = {
            "eventType": "bad_type",
            "twitterKey": "string",
            "twitterSecret": "string",
            "callback": "string"
        }
        twitterProvider(authOptions)
            .then(function fulfilled(result) {
                throw new Error('Promise was unexpectedly fulfilled. Result: ' + result);
            }, function rejected(error) {
                assert.equal('eventType not recognized ( request_token, access_token, or user_verify )', error.message);
            })
            .then(() => done(), done);
    });

    it('should fail with bad secret', function (done) {
        var authOptions = {
            "eventType": "request_token",
            "twitterKey": config.twitterKey,
            "twitterSecret": "string",
            "callback": config.twitterCallback
        }
        twitterProvider(authOptions)
            .then(function fulfilled(result) {
                throw new Error('Promise was unexpectedly fulfilled. Result: ' + result);
            }, function rejected(error) {
                assert.equal('Could not get request token', error.message);
            })
            .then(() => done(), done);
    });

    it('should get request token', function (done) {
        var authOptions = {
            "eventType": "request_token",
            "twitterKey": config.twitterKey,
            "twitterSecret": config.twitterSecret,
            "callback": config.twitterCallback
        }
        twitterProvider(authOptions)
            .then(function fulfilled(result) {
                assert.equal(true, result.hasOwnProperty('request_token'));
                assert.equal(true, result.hasOwnProperty('request_token_secret'));
                index = result.request_token;
                var record = {};
                record[index] = {
                    "request_token_secret": result.request_token_secret,
                    "updated": Date.now() / 1000 | 0
                }
                twitterRef.update(record);
            }, function rejected(error) {
                throw new Error('Promise was rejected. Result: ' + error);
            })
            .then(() => done(), done);
    });
});
