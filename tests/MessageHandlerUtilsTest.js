const assert = require('assert');
const SensorState = require('../src/util/SensorState');
const MessageHandlerUtils = require('../src/core/MessageHandlerUtils');

describe('Message handlers', function () {
    let state;

    beforeEach(function () {
        state = new SensorState(); // clear state for each run
    });

    it('0xC0 handler: Returns correct values for message', function () {
        const input = Buffer.from([0xAA, 0xC0, 0x4B, 0x00, 0x51, 0x00, 0xE9, 0x77, 0xFC, 0xAB]);

        MessageHandlerUtils.handleReading(input, state);

        assert.equal(state.pm2p5, 7.5);
        assert.equal(state.pm10, 8.1);
    });

    it('0xC0 handler: Handles using generic handler', function () {
        const input = Buffer.from([0xAA, 0xC0, 0x4B, 0x00, 0x51, 0x00, 0xE9, 0x77, 0xFC, 0xAB]);

        MessageHandlerUtils.handle(input, state);

        assert.equal(state.pm2p5, 7.5);
        assert.equal(state.pm10, 8.1);
    });


    it('0xC5 handler: Handles response to get/set mode command - query', function () {
        const input = Buffer.from([0xAA, 0xC5, 0x02, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0xAB]);

        MessageHandlerUtils.handleConfig(input, state);

        assert.equal(state.mode, 'query');
    });

    it('0xC5 handler: Handles using generic handler', function () {
        const input = Buffer.from([0xAA, 0xC5, 0x02, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0xAB]);

        MessageHandlerUtils.handleConfig(input, state);

        assert.equal(state.mode, 'query');
    });

    it('0xC5 handler: Handles response to get/set mode command - active', function () {
        const input = Buffer.from([0xAA, 0xC5, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xAB]);

        MessageHandlerUtils.handleConfig(input, state);

        assert.equal(state.mode, 'active');
    });

    it('0xC5 handler: Handles response to get/set sleep mode command - sensor is sleeping', function () {
        const input = Buffer.from([0xAA, 0xC5, 0x06, 0x00, 0x00, 0x00, 0x0, 0x00, 0x00, 0xAB]);

        MessageHandlerUtils.handleConfig(input, state);

        assert.equal(state.isSleeping, true);
    });

    it('0xC5 handler: Handles response to get/set sleep mode command - sensor is not sleeping', function () {
        const input = Buffer.from([0xAA, 0xC5, 0x06, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0xAB]);

        MessageHandlerUtils.handleConfig(input, state);

        assert.equal(state.isSleeping, false);
    });

    it('0xC5 handler: Reads firmware version', function () {
        const input = Buffer.from([0xAA, 0xC5, 0x07, 0x10, 0x0B, 0x15, 0xE9, 0x77, 0x97, 0xAB]);

        MessageHandlerUtils.handleConfig(input, state);

        assert.equal(state.firmware, '16-11-21');
    });

    it('0xC5 handler: Reads working period set to 0', function () {
        const input = Buffer.from([0xAA, 0xC5, 0x08, 0x10, 0x00, 0x00, 0x00, 0x00, 0x00, 0xAB]);

        MessageHandlerUtils.handleConfig(input, state);

        assert.equal(state.workingPeriod, 0);
    });

    it('0xC5 handler: Reads working period set to 30', function () {
        const input = Buffer.from([0xAA, 0xC5, 0x08, 0x10, 0x1E, 0x00, 0x00, 0x00, 0x00, 0xAB]);

        MessageHandlerUtils.handleConfig(input, state);

        assert.equal(state.workingPeriod, 30);
    });

    it('0xC5 handler: Throws exception on unknown code', function () {
        const input = Buffer.from([0xAA, 0xC5, 0x30, 0xFF, 0x00, 0x00, 0x00, 0x00, 0x00, 0xAB]);

        function shouldFail() {
            MessageHandlerUtils.handleConfig(input, state);
        }

        assert.throws(shouldFail, Error);
    });

    it('Generic handler throws on unknown code', function () {
        const input = Buffer.from([0xAA, 0xF0, 0x30, 0xFF, 0x00, 0x00, 0x00, 0x00, 0x00, 0xAB]);

        function shouldFail() {
            MessageHandlerUtils.handle(input, state);
        }

        assert.throws(shouldFail, Error);
    });
});