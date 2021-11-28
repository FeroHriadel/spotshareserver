const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const http = require('http');
require('dotenv').config();
const path = require('path');
// const { makeExecutableSchema } = require("graphql-tools");
const { mergeTypeDefs, mergeResolvers } = require("@graphql-tools/merge");
const { loadFilesSync } = require("@graphql-tools/load-files");
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary');
const { authCheckMiddleware } = require('./middleware/authMiddleware');



//db
const db = async () => {
    try {
        const success = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        });
        console.log('DB Connected...');
    } catch (error) {
        console.log('DB Connection Error', error);
    }
};
db();




// express server
const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));



// typeDefs
const typeDefs = mergeTypeDefs(loadFilesSync(path.join(__dirname, "./typeDefs")));



// resolvers
const resolvers = mergeResolvers(loadFilesSync(path.join(__dirname, "./resolvers")));



// graphql server
let apolloServer = null;
async function startServer() {
    apolloServer = new ApolloServer({
        typeDefs,
        resolvers,
        context: ({req, res}) => ({req, res}) //enables access to req and res
    });
    await apolloServer.start();
    apolloServer.applyMiddleware({ app });
}
startServer();



// server
const httpserver = http.createServer(app);



//rest - image upload
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

app.post('/uploadimage', authCheckMiddleware, (req, res) => {
    try {
        cloudinary.uploader.upload(
            req.body.image, 
            (result) => {
                res.send({
                    url: result.secure_url,
                    public_id: result.public_id
                })
            }, 
            {
                public_id: `${Date.now()}`,
                resource_type: 'auto'
            }
        )

    } catch(err) {
        console.log(error);
        res.status(500).json({error: `Could not upload image`})
    }
});

app.post('/removeimage', authCheckMiddleware, (req, res) => {
    let image_id = req.body.public_id;
    cloudinary.uploader.destroy(
        image_id,
        (error, result) => {
            // reports error but deletes the img anyway. Screw him.
            // if (error) return res.status(400).json({error})
            res.send('image deleted');
        }
    )
})

const User = require('./models/userModel');
app.get('/getRole/:role', async (req, res) => {
    const user = await User.findOne({email: req.params.role});
    if (!user) {
        return res.status(404).json({error: 'No user found'});
    }

    res.json({role: user.role});
})



// listen on port
app.listen(process.env.PORT, function() {
    console.log(`server is ready at http://localhost:${process.env.PORT}...`);
    // console.log(`graphql server is ready at http://localhost:${process.env.PORT}${apolloServer.graphqlPath}`);
});
