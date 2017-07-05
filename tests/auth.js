/**
 * Created by usulix on 7/5/17.
 */
import assert from "assert";

import {lambdaPromisifier} from "../lib/lambda-promisifier.js"
import {auth} from "../lambdas/auth.js"

const promisifiedAuth = lambdaPromisifier(auth);

describe("auth lambda", function () {
    it("should set provider from options", function (done) {
        promisifiedAuth({"provider": "twitter"})
            .then(res => {
                var r = JSON.parse(res)
                assert.equal(r.provider, "twitter")
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
