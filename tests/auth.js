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
                });
            })
            .then(() => done(), done);
    });

    xit("should handle twitter access_token", function (done) {
        promisifiedAuth({"query":{"provider": "twitter", "state":"access_token",
            "oauth_token":"grabATokenFromFirebase", "oauth_verifier":"visitTwitterLoginandPasteVerifier"}})
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
            })
            .then(() => done(), done);
    });

    it("should fail if no provider in options", function (done) {
        promisifiedAuth({})
            .then(function fulfilled(result) {
                throw new Error('Promise was unexpectedly fulfilled. Result: ' + result);
            }, function rejected(error) {
                assert.equal('No provider specified in event object', error.message);
            })
            .then(() => done(), done);
    });
});
