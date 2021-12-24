const express = require('express');
const router = express.Router();

const axios = require('axios').default;

const nodemailer = require('nodemailer');

const fs = require('fs');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);

const path = require('path');

const {
    sendStatus,
    getUsers,
    upcomingSongs,
    remindersPatch
} = require('./restFunctions');

const URIs = require('./URIs');

router.get('/', async (req, res) => {
    try {
        let emails = await getUsers();

        res.status(200).json({
            success: true,
            data: emails
        })

    } catch (err) {
        sendStatus(res, 500, err);
    }
})

router.get('/send', async (req, res) => {
    try {
        let users = await getUsers();

        const upcoming = await upcomingSongs();

        const toSend = [];

        users.forEach(user => {
            for (const reminder of user.reminders) {
                for (const upc of upcoming) {
                    if (reminder.id == upc.id) {
                        // already reminded so break;
                        if (reminder.reminded === true) break;
                        // new song gets created in toSend
                        if (toSend[upc.id] === undefined) toSend[upc.id] = { song: null, users: [] };
                        toSend[upc.id].song = upc;
                        // push the current user into the toSend array
                        toSend[upc.id].users.push(user);
                        break;
                    }
                }
            }
        })

        let totalMailsSend = 0;

        if (toSend.length !== 0) {
            toSend.forEach(async song => {
                for (const user of song.users) {
                    await remindersPatch(user.username, upcoming);
                }
                sendEmail(song.users, song.song);
                totalMailsSend++;
            })
        }

        res.status(200).json({
            success: true,
            message: `Send ${totalMailsSend} emails`
        })

    } catch (err) {
        sendStatus(res, 500, err);
    }
})

router.get('/test', async (req, res) => {
    try {
        sendEmail([{email: "lthoedt@gmail.com"}], {title: "test", artist: "test", imageUrl: "https://static.vecteezy.com/packs/media/components/global/search-explore-nav/img/vectors/term-bg-1-666de2d941529c25aa511dc18d727160.jpg"});

        res.status(200).json({
            success: true,
        })

    } catch (err) {
        sendStatus(res, 500, err);
    }
})

const sendEmail = async (to, song) => {
    let transporter = nodemailer.createTransport({
        name: 'reminder@top2000.nl',
        host: "mail.dutchta.com",
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD,
        },
    });

    let htmlEmail = await readFile(path.join('./mail.html'), 'utf8');

    const songTitle = song.title;
    const songArtist = song.artist;
    const songCover = song.imageUrl;

    htmlEmail = htmlEmail.replace(/SONG_TITLE/gi, songTitle)
    htmlEmail = htmlEmail.replace(/SONG_ARTIST/gi, songArtist)
    htmlEmail = htmlEmail.replace(/SONG_COVER/gi, songCover)

    await transporter.sendMail({
        from: 'reminder@top2000.nl', // sender address
        to: to.map(user => user.email), // list of receivers
        subject: `${songTitle} - ${songArtist} gaat zo beginnen!`, // Subject line
        text: `${songTitle} - ${songArtist} gaat zo beginnen!`, // plain text body
        html: htmlEmail, // html body
    });
}

module.exports = router;