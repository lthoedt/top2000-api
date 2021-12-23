const express = require('express');
const router = express.Router();

const axios = require('axios').default;

const {
    sendStatus,
    getSongs,
    currentSong,
    upcomingSongs
} = require('./restFunctions');

const URIs = require('./URIs');

// get songs
router.get('/', async (req, res) => {
    const reqLimit = req.query.limit;
    const limit = (reqLimit !== undefined && reqLimit.match(/^\d+$/)) ? reqLimit : undefined;

    const reqSearch = req.query.search;
    const search = (reqSearch === undefined || reqSearch.length === 0) ? undefined : String(reqSearch);

    try {
        let songs = await getSongs();

        if (search !== undefined) {
            songs = songs.filter((song) => {
                return (song.title.toLowerCase()).includes(search) || (song.artist.toLowerCase()).includes(search) || song.pos == search;
            })
        }

        res.json({ success: true, queryCount: songs.length, songs: (limit) ? songs.splice(0, limit) : songs });
    } catch (err) {
        console.log(err);
        sendStatus(res, 500, err);
    }
})

router.get('/playing', async (req, res) => {
    try {
        const playing = await currentSong();

        if (playing.cover_url === undefined) playing.image = "https://zwaremetalen.com/wp-content/uploads/2018/12/46479585_10155986290592215_2147690592409223168_n.png";

        playing.title = playing.name;
        delete playing.name;

        res.status(200).json({
            success: true,
            song: playing
        })
    } catch (err) {
        sendStatus(res, 500, err);
    }
})

router.get('/playing/stream', async (req, res) => {
    try {
        const streamInfo = {
            stream: {
                src: URIs.playingStream,
            },
            metadata: {}
        }

        res.status(200).json({
            success: true,
            stream: streamInfo.stream,
            metadata: streamInfo.metadata
        })
    } catch (err) {
        sendStatus(res, 500, err);
    }
})

router.get('/upcoming', async (req, res) => {
    try {
        const upcoming = await upcomingSongs();

        if (upcoming.length === 0) return sendStatus(res, 404, "De top2000 is nog niet begonnen.");

        res.status(200).json(upcoming);
    } catch (err) {
        sendStatus(res, 500, err);
    }

})

module.exports = router;