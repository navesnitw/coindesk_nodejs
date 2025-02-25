const assert = require('assert');
const handleWebSocketEvent = require('../src/main.js');

describe('Minute Bucket Tests', () => {

    describe('Test WebSocket Events', () => {
        it('should update existing minute bucket', () => {
            const minuteBuckets = {};

            const obj1 = { minuteBucket: '2023-03-15 12:00', q: 10 };
            const obj2 = { minuteBucket: '2023-03-15 12:00', q: 5 };

            handleWebSocketEvent(minuteBuckets, obj1);
            handleWebSocketEvent(minuteBuckets, obj2);

            assert.strictEqual(minuteBuckets['2023-03-15 12:00'].toString(), '15');            
        });
    });
});