/**
 * Created by usulix on 7/5/17.
 */
import assert from "assert";
import * as fbadmin from "firebase-admin"
import {lambdaPromisifier} from "../lib/lambda-promisifier.js"
import {handle} from "../lambdas/auth.js"
import * as config from "../config.json"

const promisifiedAuth = lambdaPromisifier(handle);

describe("auth lambda", function () {
    it("should handle twitter request_token", function (done) {
        promisifiedAuth({"query":{"provider": "twitter", "state":"request_token"}})
            .then(res => {
                assert.equal(res.provider, "twitter");
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
                var twitterRef = fbadmin.database().ref("social/twitter");
                twitterRef.child(res.token).once('value').then(function (snap) {
                    var now = Date.now() / 1000 | 0;
                    assert.equal(true, snap.val().updated > (now - 10));
                    assert.equal(true, snap.val().updated < (now + 10));
                }, function(err){
                    throw new Error('promise rejected');
                });
            })
            .then(() => done(), () => done());
    });

    xit("should handle twitter access_token", function (done) {
        promisifiedAuth({"query":{"provider": "twitter", "state":"access_token",
            "oauth_token":"fzZ0XQAAAAAA1V6kAAABXWYyQXg", "oauth_verifier":"fuJXQR7W8YoQI6NJ7gaN1iPB7AkEaWEB"}})
            .then(res => {
                assert.equal(res.provider, "twitter");
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
                var twitterRef = fbadmin.database().ref("social/twitter");
                twitterRef.child(res.token).once('value').then(function (snap) {
                    var now = Date.now() / 1000 | 0;
                    assert.equal(true, snap.val().updated > (now - 10));
                    assert.equal(true, snap.val().updated < (now + 10));
                });
            }, err=>{console.log(err);})
            .then(() => done(), () => done());
    });

    it("should exchange facebook code for access token", function(done){
        promisifiedAuth({"query":{"provider": "facebook", "state":"access_token",
            "oauth_token":"AQCaDUJNaQ_CskOLM-VssnBR7Hj7ervx7OKObyCTX-OKETWW-Dq4bdP7kO-hdwCbXB0l4kGeP7Z8f5rTw0NQi2Ug_aynIlAzjAnfbhyl3oVeIk6pOjWcWZRJf_ABC5RFPzrLqf8VUjfaHFGF9JiMGoMXBsQ2QHmjqtI-c2-oQ9c792PsCGWK8idc0IgAaNyWmEfgX-_PqkQZ1dBSycuT1v9VwvyTAVQFqwOGETS1i4QuX-meo2ObfSv9ZhdQuL7_gHWjnKY1d2e6sbvi3NfCWvY6erV5DRUzeJ1fxKcww4WDhvtR3tKfpOMSCfT-hw0nQ8Q_obt4HAPlewg4z-pTKMqQ#_=_"}})
            .then(res => {
                assert.equal(res.provider, "facebook");
            }, err=>{console.log(err); throw new Error('facebook connection error')})
            .then(() => done(), () => done());
    });

    it("should fail if no provider in options", function (done) {
        promisifiedAuth({})
            .then(function fulfilled(result) {
                throw new Error('Promise was unexpectedly fulfilled. Result: ' + result);
            }, function rejected(error) {
                assert.equal('No provider specified in event object', error.message);
            })
            .then(() => done(), () => done());
    });
});
