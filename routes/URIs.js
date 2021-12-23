module.exports = {
	songs: ( year = new Date().getFullYear() ) => {
		return `https://www.nporadio2.nl/api/chart/positions?editionSlug=top-2000-van-${year}-12-25`;
	},
	playing: "https://www.nporadio2.nl/api/miniplayer/info?channel=npo-radio-2",
    playingStream: "https://nl-ams-p1-am3.cdn.streamgate.nl/eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2NDAzODU1MzEsInVyaSI6IlwvbGl2ZVwvbnBvXC91XC9ucG9cL25vZHJtXC9kYXNoX3VuZW5jcnlwdGVkXC9ucG8tdnNyLTJcLzBcLzBcLzBcL25wby12c3ItMi5pc21sIiwiY2xpZW50X2lwIjoiMjE3LjEwMy45NS41MyIsInZpZXdlciI6ImVjMTU5YzM0ZWQ0YjI2ODA5NTdkYmZlODQ2MWMyNGNlMWE5YjBjYjciLCJyaWQiOiJkNDIwNGViIn0.0yMVrZUIoaeFhxpkfUY1PmEIpTJiZEQX_KpJtuwkl6I/live/npo/u/npo/nodrm/dash_unencrypted/npo-vsr-2/0/0/0/npo-vsr-2.isml/stream.mpd",
    lastPlayed: "https://www.nporadio2.nl/_next/data/wazL8Ew0ak18HsRjpzoqO/gedraaid.json?channel=npo-radio-2"
}