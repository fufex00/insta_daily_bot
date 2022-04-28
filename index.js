const express = require('express');
const app = express();
const Instagram = require('instagram-web-api')
const FileCookieStore = require('tough-cookie-filestore2')
const WordPOS = require('wordpos');
const wordpos = new WordPOS();
const cron = require('node-cron');
require('dotenv').config();

app.use(express.json());
const port = process.env.PORT || 4000;

const cookieStore = new FileCookieStore('./cookies.json')
const client = new Instagram({
    username: process.env.INSTAGRAM_USERNAME,
    password: process.env.INSTAGRAM_PASSWORD,
    cookieStore
});

//creates a schedule for the bot to run every day at 18:00
cron.schedule('00 18 * * *', () => {
    ; (async () => {
        console.log("cron task started");
        await client.login()
        console.log('Logged in!');

        wordpos.randAdjective({ count: 1 }, async (result) => {
            const adjective = result[0].replace("_", " ");
            const newDescription =
                adjective.slice(result[0].length - 3) === "ing"
                    ? adjective
                    : " feeling " + adjective;
            const newCaption = `El Gato UCR is ${newDescription} today! \nAre you ${newDescription}? \nPost a comment to see if you are!`;
            console.log(newCaption);
            await client.uploadPhoto({
                photo: "./ucr_cat.jpg",
                caption: newCaption,
                post: 'feed'
            }).then(async (result) => {
                console.log(`https://www.instagram.com/p/${result.media.code}/`)
                await client.addComment({
                    mediaId: result.media.id,
                    text: "#elgato #nodejs #ucr #multimedios",
                }).catch(err => {
                    console.log(err);
                });
            });
        });
    })()
})


app.get('/post-picture', (req, res) => {
    console.log("posting pic");
    // res.send({message: "success"});
    ; (async () => {
        await client.login()
        console.log('Logged in!');

        // creates a random adjective and adds it to the caption
        wordpos.randAdjective({ count: 1 }, async (result) => {
            const adjective = result[0].replace("_", " ");
            const newDescription =
                adjective.slice(result[0].length - 3) === "ing"
                    ? adjective
                    : " feeling " + adjective;
            const newCaption = `El Gato UCR is ${newDescription} today! \nAre you ${newDescription}? \nPost a comment to see if you are!`;
            console.log(newCaption);
            await client.uploadPhoto({
                photo: "./ucr_cat.jpg",
                caption: newCaption,
                post: 'feed'
            }).then(async (result) => {
                console.log(`https://www.instagram.com/p/${result.media.code}/`)
                res.send({ message: "success", post: `https://www.instagram.com/p/${result.media.code}/` });
                await client.addComment({
                    mediaId: result.media.id,
                    text: "#elgato #nodejs #ucr #multimedios",
                }).catch(err => {
                    console.log(err);
                });
            });
        });


    })()
});

app.get('/post-status', (req, res) => {
    ; (async () => {

        await client.login()

        await client.uploadPhoto({ photo: "./status.jpg", post: 'status' });
        console.log("done");
    })()
});






app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});