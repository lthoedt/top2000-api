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
    const reqMin = Number(req.query.min);
    const reqMax = Number(req.query.max);

    const min = (isNaN(reqMin)) ? undefined : reqMin;
    const max = (isNaN(reqMax)) ? undefined : reqMax;

    const reqSearch = req.query.search;
    const search = (reqSearch === undefined || reqSearch.length === 0) ? undefined : String(reqSearch);

    try {
        let songs = await getSongs(search, min, max);

        res.json({ success: true, queryCount: songs.length, songs: songs });
    } catch (err) {
        console.log(err);
        sendStatus(res, 500, err);
    }
})

router.get('/playing', async (req, res) => {
    try {
        const playing = await currentSong();

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