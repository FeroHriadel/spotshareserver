const User = require('../models/userModel');
var admin = require("firebase-admin");
var serviceAccount = require("../config/adminSdk.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});



//firebase auth check middleware
exports.authCheck = async (req, res, next = (f) => f) => { //you need to say that next is a function or graphql will complain
    try {
        const currentUser = await admin.auth().verifyIdToken(req.headers.authtoken);
        return currentUser;

    } catch (error) {
        console.log(error);
        throw new Error('Invalid or expired token');
    }
}



//rest auth check middleware
exports.authCheckMiddleware = (req, res, next) => {
    if(req.headers.authtoken) {
        admin.auth().verifyIdToken(req.headers.authtoken)
            .then(result => {
                next();
            })
            .catch(error => {
                console.log(error);
                res.status(500).json({error: `Could not verify token`})
            });
    } else {
        res.json({error: 'Unauthorized'});
    }
}



//admin check
exports.adminCheck = async (req, res, next = (f) => f) => {
    try {
        const currentUser = await admin.auth().verifyIdToken(req.headers.authtoken);
        const user = await User.findOne({email: currentUser.email});
        if (!user || user.role !== 'admin') {
            user.error = 'Unauthorized'
        }
        return user;
        
    } catch (error) {
        console.log(error);
        throw new Error('Unauthorized');
    }
}