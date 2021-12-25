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

const getUsers = async () => {
    return await Users.find({}, {
        _id: 0,
        username: 1,
        email: 1,
        reminders: 1
    }).lean().exec();
}

const getSongs = async (search = "", min = 0, max = 2000) => {
    cacheSongs();

    if (search == "") return await Songs.find({
        $and: [
            { position: { $gte: min } },
            { position: { $lte: max } }
        ]
    }).lean().exec();

    let searchNumber = Number(search);

    let query = [];

    if (isNaN(searchNumber)) {
        if (search.startsWith(">")) {
            search = search.replace(">", "");
            const number = Number(search);
            if (!isNaN(number)) {
                query.push({
                    position: {
                        $gte: number
                    }
                });
            }
        }
        query.push({ title: { $regex: `.*${search}.*`, $options: 'i' } },
            { artist: { $regex: `.*${search}.*`, $options: 'i' } });
    } else {
        query.push({ position: Number(search) });
    }

    return await Songs.find({ $or: query }).lean().exec();
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
    const playing = (await axios.get(URIs.playing)).data.data.radio_track_plays.data[0].radio_tracks;

    playing.imageUrl = playing.cover_url;
    delete playing.cover_url;

    if (playing.imageUrl === undefined) playing.imageUrl = "https://zwaremetalen.com/wp-content/uploads/2018/12/46479585_10155986290592215_2147690592409223168_n.png";

    playing.title = playing.name;
    delete playing.name;

    const song = await Songs.findOne({ title: playing.title, artist: playing.artist }).lean().exec();

    return (song === null) ? playing : song;
}

const upcomingSongs = async () => {
    const songs = await getSongs();
    const playing = await currentSong();

    if (playing.id === undefined) return [];

    let upcoming = [];

    let currentIndex = playing.position - 1;

    // currentIndex = 9;

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
    const user = await userGet(username);

    const newReminders = user.reminders.map(rem => {
        for (const toChange of reminders) {
            if (rem.id === toChange.id) {
                rem.reminded = true;
                break;
            }
        }
        return rem;
    });

    await Users.updateOne({ username: username }, {
        reminders: newReminders
    });
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