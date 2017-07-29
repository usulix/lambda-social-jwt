/**
 * Created by usulix on 7/21/17.
 */
let index;
module.exports = {
    handleTwitter : (event, config, twitterProvider, db) =>{
        return new Promise(function(resolve, reject){
            var authOptions = {
                "eventType": "",
                "twitterKey": config.twitterKey,
                "twitterSecret": config.twitterSecret,
                "callback": config.twitterCallback,
                "token": "",
                "tokenSecret": "",
                "tokenVerifier": "",
                "oauthToken": "",
                "oauthTokenSecret": ""
            }
            switch(event.query.state){
                case "request_token":
                    authOptions.eventType = "request_token";
                    twitterProvider(authOptions)
                        .then(function fulfilled(resp) {
                            index = resp.request_token;
                            let record = {};
                            record[index] = {
                                "request_token_secret": resp.request_token_secret,
                                "updated": Date.now() / 1000 | 0
                            }
                            db.twitterRef.update(record);
                            resolve({"provider":"twitter", "token":index, "location":"https://api.twitter.com/oauth/authenticate?oauth_token="+index});
                        }, function rejected(error) {
                            reject(new Error('Promise was rejected. Result: ' + error));
                        });
                    break;
                case "access_token":
                    db.twitterRef.find(event.query.oauth_token).then(function(res){
                        authOptions.eventType = "access_token";
                        authOptions.token = event.query.oauth_token;
                        authOptions.tokenSecret = res.val().request_token_secret;
                        authOptions.tokenVerifier = event.query.oauth_verifier;
                        twitterProvider(authOptions)
                            .then(function fulfilled(accessresult) {
                                authOptions.eventType = "user_verify";
                                authOptions.oauthToken = accessresult.access_token;
                                authOptions.oauthTokenSecret = accessresult.access_token_secret;
                                twitterProvider(authOptions)
                                    .then(function fulfilled(detailsresult){
                                        detailsresult = JSON.parse(detailsresult);
                                        let additionalrecord = {};
                                        additionalrecord[event.query.oauth_token] = {
                                            "access_token":accessresult.access_token,
                                            "access_token_secret": accessresult.access_token_secret,
                                            "userEmail": detailsresult.email,
                                            "userName": detailsresult.name,
                                            "userLocation": detailsresult.location,
                                            "updated": Date.now() / 1000 | 0
                                        }
                                        db.twitterRef.update(additionalrecord);
                                        resolve({"provider":"twitter", "token":event.query.oauth_token});
                                    })
                            }, function rejected(error) {
                                reject(new Error('Promise was rejected. Result: ' + error));
                            })
                    });
                    break;
                default:
                    reject(new Error('no '+event.query.state));
            }
        });
    }
}