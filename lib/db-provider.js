import * as config from "../config.json"
import * as fbadmin from "firebase-admin"

export function dbProvider(){
    var db = {};
    if (!config.databaseProvider) throw new Error('No databaseProvider in config');
    switch(config.databaseProvider){
        case 'firebase':
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
            db.twitterRef = fbadmin.database().ref('social/twitter');
            db.twitterRef.find = function(index: string){
                return new Promise((resolve, reject)=>{
                    db.twitterRef.child(index).once('value').then(function (snap) {
                        resolve(snap);
                    }, function(err){
                        reject(err);
                    });
                });
            }
            return db;
        default:
            throw new Error('could not find a supported databaseProvider');
    }
}