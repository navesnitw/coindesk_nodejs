const WebSocket = require('ws');
const EventEmitter = require('events');
const { DateTime } = require('luxon');

const emitter = new EventEmitter();
function initialize() {
	const ws = new WebSocket('wss://streamer.cryptocompare.com/v2?api_key=81eb71ae741816570b63e1696ef13439f195d2bc566e0af04b954f7f20c4740c');
	ws.on('open', () => {
		console.log("Connected to Crypto compare!");

		const subJson = {
			action: "SubAdd",
			subs: ["0~Coinbase~BTC~USD"]
		}
		const jsonString = JSON.stringify(subJson, null, 2);
		console.log(`Sending Subscription message ${jsonString}`);
		ws.send(jsonString);
	});

	ws.on('close', () => {
		console.log("Disconnected from Crypto compare!");
	});

	ws.on('error', (error) => {
		console.error("Error!", error);
	});

	ws.on('message', (message) => {
		const messageObj = JSON.parse(message);
		if (messageObj.TYPE == "0") {
			const time = messageObj.RTS;
			const date = DateTime.fromSeconds(time, { zone: 'EST' });

			const minuteBucket = date.toFormat('yyyy-MM-dd HH:mm');
			const value = {
				minuteBucket: minuteBucket,
				q: messageObj.Q
			}			
			emitter.emit('BTCUSD-Q', value);
		}
	});
}
module.exports = { initialize, emitter }