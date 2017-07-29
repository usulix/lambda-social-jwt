/**
 * Created by usulix on 7/21/17.
 */

module.exports = {
    handleFacebook : (event, config, facebookProvider) =>{
        return new Promise(function(resolve, reject){
            var authOptions = {
                "eventType": "",
                "facebookAppIdKey": config.facebookAppId,
                "redirectUri": config.facebookTestingRedirectUri,
                "facebookAppSecret":config.facebookAppSecret,
                "facebookAppAccessToken":config.facebookAppAccessToken,
                "code":event.query.oauth_token
            }
            switch(event.query.state){
                case "access_token":
                    authOptions.eventType = 'access_token';
                    facebookProvider(authOptions).then(
                        (resp) => {resolve(resp)},
                        (err) => {reject(err)}
                    );
                    break;
                default:
                    reject(new Error('no '+event.query.state));
            }
        });
    }
}