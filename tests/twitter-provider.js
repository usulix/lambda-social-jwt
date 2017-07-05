/**
 * Created by usulix on 7/5/17.
 */
import assert from "assert";
import {twitterProviderGetRequestToken} from "../lib/twitter-provider.js"

var fs = require('fs');

describe('twitterProviderGetRequestToken', function (done) {
    beforeEach(function (done) {
        var configJSON;
        var config;

        configJSON = fs.readFileSync('config.json', {encoding: 'utf-8'});
        config = JSON.parse(configJSON);
        done();
    });

    it('should reject an incorrect eventType', function (done) {
        var authOptions = {
            "eventType": "bad_type",
            "twitterKey": "string",
            "twitterSecret": "string",
            "callback": "string"
        }
        twitterProviderGetRequestToken(authOptions)
            .then(function fulfilled(result) {
                throw new Error('Promise was unexpectedly fulfilled. Result: ' + result);
            }, function rejected(error) {
                assert.equal('eventType not recognized ( request_token or auth_token )', error.message);
            })
            .then(() => done(), done);
    });
});