/* @flow */
export type Db = {
    twitterRef: {
        update: (any)=>void,
        find: Promise<any>
    }
};

export type Event = {
    query: {
        provider: string,
        state: string,
        oauth_token: string
    }
};

export type fbAuthOptions = {
    eventType: string,
    facebookAppIdKey: string,
    redirectUri: string,
    facebookAppSecret: string,
    facebookAppAccessToken: string,
    code: string
}


export type twAuthOptions = {
    eventType: string,
    twitterKey: string,
    twitterSecret: string,
    callback: string,
    token: string,
    tokenSecret: string,
    tokenVerifier: string,
    oauthToken: string,
    oauthTokenSecret: string
}
