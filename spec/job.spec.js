'use strict';

var Job = require('../src/job.js');

describe('constructor', function() {
    it('should be passed all params', function() {
        var job = new Job('bot', 'id', 'pattern', 'text', 'channel');
        expect(job.bot).toBe('bot');
        expect(job.id).toBe('id');
        expect(job.pattern).toBe('pattern');
        expect(job.text).toBe('text');
        expect(job.channel).toBe('channel');
    });
});

describe('start()', function () {
    it('should create new cronJob and start it', function () {
        var job = new Job({}, 1, '* * * * *', 'text', 'channel');
        job.start();

        expect(job.cronJob.running).toBe(true);
    });
});

describe('stop()', function () {
    it('should stop inner cronJob', function () {
        var job = new Job();
        job.cronJob = jasmine.createSpyObj('cronJob', ['stop']);
        job.stop();

        expect(job.cronJob.stop).toHaveBeenCalled();
    });
});

describe('serialize()', function () {
    it('should return correctly serialized object', function () {
        var job = new Job('bot', 'id', 'pattern', 'text', 'channel');

        expect(job.serialize()).toEqual({
            pattern: 'pattern',
            text: 'text',
            channel: 'channel'
        });
    });
});

describe('print()', function () {
    it('should return correctly formatted text', function () {
        var bot = {
            api: {
                channels: {
                    info: function (params, cb) {
                        return cb(null, {
                            channel: {
                                name: 'channel-name'
                            }
                        });
                    }
                }
            }
        };

        var job = new Job(bot, 1, 'pattern', 'text', 'channel');

        expect(job.print()).toBe('[1] #channel-name pattern text');
    });
});
