const express = require('express');
const app = express();
const Instagram = require('instagram-web-api');
const FileCookieStore = require('tough-cookie-filestore2');
const cron = require('node-cron');
const loremPicsum = require("lorem-picsum");
const Quote = require('inspirational-quotes');
const cors = require('cors');
require('dotenv').config();


app.use(express.json());

const port = process.env.PORT || 4000;

app.use(cors({
    origin: 'https://annon-toughts.netlify.app',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));


const cookieStore = new FileCookieStore('./cookies.json')
const client = new Instagram({
    username: process.env.INSTAGRAM_USERNAME,
    password: process.env.INSTAGRAM_PASSWORD,
    cookieStore
});

app.get('/', (req, res) => {
    res.send('App is running!');
});

//creates a schedule for the bot to run every day at 18:00
cron.schedule('00 18 * * *', () => {
    console.log("posting pic and thoughts");
    ; (async () => {
        await client.login()
        console.log('Logged in!');

        await client.uploadPhoto({
            photo: loremPicsum({
                width: 1080
            }),
            caption: getRandQuote(),
            post: 'feed'
        }).then(async (result) => {
            console.log(`https://www.instagram.com/p/${result.media.code}/`)
            res.send({ message: "success", post: `https://www.instagram.com/p/${result.media.code}/` });
            await client.addComment({
                mediaId: result.media.id,
                text: "#nodejs #ucr #multimedios",
            }).catch(err => {
                console.log(err);
            });
        });


    })()
})

const getRandQuote = () => {
    const quote = Quote.getRandomQuote();
    return quote;
}

app.post('/post-thought', (req, res) => {
    console.log("posting personalized post");

    const phrase = req.body.phrase;

    ; (async () => {
        await client.login()
        console.log('Logged in!');
        console.log(phrase);

        await client.uploadPhoto({
            photo: loremPicsum({
                width: 1080
            }),
            caption: phrase,
            post: 'feed'
        }).then(async (result) => {
            console.log(`https://www.instagram.com/p/${result.media.code}/`)
            res.send({ message: "done", post: `https://www.instagram.com/p/${result.media.code}/` });
            await client.addComment({
                mediaId: result.media.id,
                text: "#nodejs #ucr #multimedios",
            }).catch(err => {
                console.log(err);
            });
        });


    })()
});


app.get('/post-status', (req, res) => {
    ; (async () => {

        await client.login()

        await client.uploadPhoto({
            photo: loremPicsum({
                width: 1080,
                height: 1920,
                blur: true
            }), post: 'status'
        });
        console.log("done");
        res.send({ message: "status updated" });
    })()
});


app.listen(port, () => {
    console.log(`Listening on port ${port}`);

});
