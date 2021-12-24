const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const songs_schema = new Schema({
	id: {
		type: String,
		unique: true,
		required: false,
	},
	artist: {
		type: String,
		required: true
	},
    artist_normalized: {
		type: String,
		required: true
	},
	title: {
		type: String,
		required: true
	},
    title_normalized: {
		type: String,
		required: true
	},
	position: {
        type: Number,
        required: true
    },
    lastPosition: {
        type: Number,
        required: true
    },
    isLive: {
        type: String,
    },
    isPreviewing: {
        type: String,
    },
    positionVisualType: {
        type: String
    },
    imageUrl: {
        type: String
    },
    trackHistoryUrl: {
        type: String
    },
    trackPreviewUrl: {
        type: String
    },
}, {_id: false})

const songs = mongoose.model(String(new Date().getFullYear()), songs_schema);

module.exports = songs;