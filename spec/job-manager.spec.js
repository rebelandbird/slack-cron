'use strict';

var mock = require('mock-require');

var mockRedisStorage = {
    1: JSON.stringify({
        pattern: '1 * * * *',
        text: 'text1',
        channel: 'channel1'
    }),
    2: JSON.stringify({
        pattern: '2 * * * *',
        text: 'text2',
        channel: 'channel2'
    })
};
var mockRedisClient = {
    hgetall: function (key, cb) {
        cb(null, mockRedisStorage);
    },
    hset: function (key, id, jobString) {
    },
    hdel: function (key, id) {
    }
};

mock('redis', {
    createClient: function () {
        return mockRedisClient;
    }
});

var JobManager = require('../src/job-manager.js');
var jm;

describe('constructor', function() {
    beforeEach(function () {
        jm = new JobManager({});
    });

    it('should restore jobs from redis and start all jobs', function() {
        expect(jm.jobs['1'].id).toBe('1');
        expect(jm.jobs['1'].pattern).toBe('1 * * * *');

        expect(jm.jobs['2'].text).toBe('text2');
        expect(jm.jobs['2'].channel).toBe('channel2');

        expect(jm.jobs['1'].cronJob.running).toBe(true);
        expect(jm.jobs['2'].cronJob.running).toBe(true);
    });
});

describe('get()', function () {
    beforeEach(function () {
        jm = new JobManager({});
    });

    it('should get correct job', function () {
        expect(jm.get(2).pattern).toBe('2 * * * *');
    });
});

describe('add()', function () {
    beforeEach(function () {
        jm = new JobManager({});
    });

    it('should create correct job', function () {
        var newJob = jm.add('3 * * * *', 'text3', 'channel3');

        expect(newJob.pattern).toBe('3 * * * *');
        expect(newJob.text).toBe('text3');
        expect(newJob.channel).toBe('channel3');
    });

    it('should start new job', function () {
        var newJob = jm.add('3 * * * *', 'text3', 'channel3');

        expect(newJob.cronJob.running).toBe(true);
    });

    it('should save job to redis', function () {
        spyOn(mockRedisClient, 'hset');

        jm.add('3 * * * *', 'text3', 'channel3');

        expect(mockRedisClient.hset).toHaveBeenCalledWith('jobs', jasmine.any(Number), jasmine.any(String));
    });
});

describe('remove()', function () {
    beforeEach(function () {
        jm = new JobManager({});
    });

    it('should throw error when no job for specified id', function () {
        expect(function () { jm.remove(999); }).toThrowError();
    });

    it('should stop specified job', function () {
        var spyJob = jasmine.createSpyObj('job', ['stop']);

        jm.jobs['999'] = spyJob;
        jm.remove('999');

        expect(spyJob.stop).toHaveBeenCalled();
    });

    it('should delete specified job from list', function () {
        jm.remove('1');

        expect(jm.jobs['1']).toBeUndefined();
        expect(jm.jobs['2']).not.toBeUndefined();
    });

    it('should delete specified job from redis', function () {
        spyOn(mockRedisClient, 'hdel');

        jm.remove('2');

        expect(mockRedisClient.hdel).toHaveBeenCalledWith('jobs', '2');
    });
});

describe('list()', function () {
    beforeEach(function () {
        jm = new JobManager({});
    });

    it('should return correctly printed job list', function () {
        var job1 = jasmine.createSpyObj('job1', ['print']);
        var job2 = jasmine.createSpyObj('job2', ['print']);
        var job3 = jasmine.createSpyObj('job3', ['print']);
        jm.jobs = [job1, job2, job3];

        var list = jm.list();

        expect(job1.print).toHaveBeenCalled();
        expect(job2.print).toHaveBeenCalled();
        expect(job3.print).toHaveBeenCalled();

        expect(list.length).toBe(3);
    });
});
