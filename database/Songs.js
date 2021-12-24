const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const songs_schema = new Schema({
	id: {
		type: String,
		unique: true,
		required: true,
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
    year: {
        type: String,
        required: true
    },

})

const songs = mongoose.model('Songs', songs_schema);

module.exports = songs;