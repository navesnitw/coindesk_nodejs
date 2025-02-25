const wsclient = require('./websocketclient.js')
const { DateTime } = require('luxon');
const axios = require('axios');
const Decimal = require('decimal.js');

async function fetchHistoricalValue(toTs) {
    const url = `https://min-api.cryptocompare.com/data/v2/histominute?fsym=BTC&tsym=USD&limit=1&toTs=${toTs}&api_key=81eb71ae741816570b63e1696ef13439f195d2bc566e0af04b954f7f20c4740c`;
    try {
        return await axios.get(url);
    } catch (error) {
        console.error('Error fetching historical value:', error);
        throw error;
    }
}

function handleWebSocketEvent(minuteBuckets, obj) {
    if (minuteBuckets[obj.minuteBucket] === undefined) {
        minuteBuckets[obj.minuteBucket] = new Decimal(obj.q);
    } else {
        minuteBuckets[obj.minuteBucket] = minuteBuckets[obj.minuteBucket].plus(new Decimal(obj.q));
    }
}
async function startApplication() {
    wsclient.initialize();
    const minuteBuckets = {};

    setInterval(async () => {
        const nowMinus1Min = DateTime.local({ zone: 'America/New_York' }).minus({ minutes: 1 }).set({ second: 0 }).set({ millisecond: 0 });
        const time = nowMinus1Min.toSeconds();
        const response = await fetchHistoricalValue(time);
        const historicalValue = response.data?.Data?.Data[0]?.volumefrom;

        const date = DateTime.local({ zone: 'America/New_York' });
        const minuteBucket = date.toFormat('yyyy-MM-dd HH:mm');
        
        let diff = new Decimal(0);
        if (minuteBuckets[minuteBucket] != undefined) {
            diff = minuteBuckets[minuteBucket].minus(new Decimal(historicalValue));
        }
        console.log(`${minuteBucket} : Quantity Total from Stream : ${minuteBuckets[minuteBucket]?.toString()} , Quantity from Historical API : ${historicalValue} , Diff : ${diff.toString()}`);
        delete minuteBuckets[minuteBucket];
    }, 60 * 1000);

    wsclient.emitter.on('BTCUSD-Q', (obj) => {
        handleWebSocketEvent(minuteBuckets, obj);        
    });

    setTimeout(() => {
        console.log("Application still running...");
    }, 3600000); // 1 hour
}

if (require.main === module) {
    startApplication();
}
module.exports = handleWebSocketEvent;