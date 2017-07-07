/**
 * Created by usulix on 7/5/17.
 */
import assert from "assert";
import {twitterProvider} from "../lib/twitter-provider.js";
import * as fbadmin from "firebase-admin";

var fs = require('fs');
var config, db, socialRef, twitterRef, index;
describe('twitterProviderGetAccessToken', function(){
    before(function (done) {
        var configJSON;
        configJSON = fs.readFileSync('config.json', {encoding: 'utf-8'});
        config = JSON.parse(configJSON);
        if (!config.firebaseKey) throw new Error('No firebaseKey in config');
        var fbConfig = {
            credential: fbadmin.credential.cert({
                projectId: config.firebaseProject,
                clientEmail: config.firebaseEmail,
                privateKey: config.firebaseKey
            }),
            databaseURL: config.firebaseUrl
        };
        fbadmin.initializeApp(fbConfig);
        db = fbadmin.database();
        socialRef = db.ref("social/");
        twitterRef = socialRef.child('twitter');
        done();
    });
    it('should get access token', function (done) {
        index = "T9wCqQAAAAAA1V6kAAABXRnuMpc";
        twitterRef.child(index).once('value').then(function (snap) {
            var authOptions = {
                "eventType": "access_token",
                "token": index,
                "tokenSecret": snap.val().request_token_secret,
                "tokenVerifier": config.testAccessTokenVerifyer
            };
            twitterProvider(authOptions)
                .then(function fulfilled(result) {
                    assert.equal(true, result.hasOwnProperty('access_token'));
                    assert.equal(true, result.hasOwnProperty('access_token_secret'));
                    var record = {};
                    record[index] = {
                        "accessToken":result.access_token,
                        "access_token_secret": result.access_token_secret,
                        "updated": Date.now() / 1000 | 0
                    }
                    twitterRef.update(record);
                }, function rejected(error) {
                    throw new Error('Promise was rejected. Result: ' + error);
                })
                .then(() => done(), done);
        });
    });
});