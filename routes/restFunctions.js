const axios = require('axios').default;
const URIs = require('./URIs');

const {
    Users,
    Songs
} = require('../database/db');

const sendStatus = (res, status, message) => {
    const response = {
        success: false
    }
    switch (status) {
        case 404:
            response.message = (message) ? message : "Not found.";
            break;
        case 500:
            response.message = (message) ? message : "Server error occurred";
            break;
        case 412:
            response.message = (message) ? message : "Missing expected content";
            break;
        case 409:
            response.message = (message) ? message : "Already exists"
            break;
        case 400:
            response.message = (message) ? message : "Given resource is wrong"
        case 200:
            response.message = (message) ? message : "Succes!";
            response.success = true;
            break;
    }

    return res.status(status).json(response);
}

const getUsers = () => {
    return Users.find({}, {
        _id: 0,
        username: 1,
        email: 1,
        reminders: 1
    });
}

const getSongs = async (search = "", min=0, max=2000) => {
    cacheSongs();

    if (search == "") return await Songs.find({
        $and: [
            { position: { $gte: min } },
            { position: { $lte: max } }
        ]
    });

    let searchNumber = Number(search);

    let query = [];

    if (isNaN(searchNumber)) {
        query.push({ title: { $regex: `.*${search}.*`, $options: 'i' } },
            { artist: { $regex: `.*${search}.*`, $options: 'i' } });
    } else {
        query.push({ position: Number(search) });
    }

    let songs = await Songs.find({ $or: query });

    return songs;
}

const cacheSongs = async () => {
    let songsCached = await Songs.countDocuments();

    // songs arent in database
    if (songsCached === 0) {
        let songs = (await axios.get(URIs.songs())).data.positions;

        // Could be sorted on position first for safety.
        await Songs.insertMany(songs);
    }
}

const userGet = async (username) => {
    return (await Users.findOne({
        username: username
    }, {
        _id: 0,
        __v: 0,
        password: 0
    }));
}

const accountExists = async (username) => {
    return (await Users.countDocuments({
        username: username
    })) > 0;
}

const emailIsValid = (email) => {
    return email.match(/^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/) !== null;
}

const usernameIsValid = (username) => {
    return username.match(/^[a-zA-Z0-9-_]*$/) !== null;
}

const currentSong = async () => {
    return (await axios.get(URIs.playing)).data.data.radio_track_plays.data[0].radio_tracks
}

const upcomingSongs = async () => {
    const songs = await getSongs();
    const playing = await currentSong();

    let upcoming = [];

    //search for the current song index in the 2000list
    let currentIndex;
    for (const [index, song] of songs.entries()) {
        if (playing.id === song.id) {
            currentIndex = index;
            break;
        }
    }

    // currentIndex = 9;

    // return empty array if the currentsong isnt in the 2000list
    if (currentIndex === undefined) return upcoming;

    // push the current song in at [0]
    // then add 4 songs that are after it at [1] [2]
    for (let i = 0; i < 5; i++) {
        const nextSong = songs[currentIndex - i]
        if (nextSong) upcoming.push(nextSong)
        else break;
    }

    return upcoming;
}

const remindersPatch = async (username, reminders) => {
    reminders = reminders.map(song => {
        return song.id;
    })

    const user = await userGet(username);

    const newReminders = user.reminders.map(rem => {
        for (const toChange of reminders) {
            if (rem.id === toChange.id) {
                rem.reminded = true;
                break;
            }
        }
        return rem;
    })

    const result = (await Users.updateOne({ username: username }, {
        reminders: newReminders
    }))
}

module.exports = {
    sendStatus,
    getUsers,
    getSongs,
    userGet,
    accountExists,
    emailIsValid,
    usernameIsValid,
    currentSong,
    upcomingSongs,
    remindersPatch
}