'use strict';

var _ = require('lodash');
var redis = require('redis').createClient(process.env.REDIS_URL);
var deasync = require('deasync');

var Job = require('./job.js');

var JobManager = function (bot) {
    this.bot = bot;
    this.jobs = {};

    var done = false;
    var that = this;
    redis.hgetall('jobs', function (err, res) {
        _.forEach(res, function (jobString, id) {
            var job = JSON.parse(jobString);
            job = new Job(that.bot, id, job.pattern, job.text, job.channel);

            job.start(that.bot);
            that.jobs[id] = job;
        });
        done = true;
    });
    deasync.loopWhile(function () { return !done });
};

JobManager.prototype = {
    get: function (id) {
        return this.jobs[id];
    },

    add: function (pattern, text, channel) {
        var id;
        while (!id || this.jobs[id]) {
            id = Math.floor(Math.random() * 1000000);
        }

        var job = new Job(this.bot, id, pattern, text, channel);

        job.start(this.bot);
        this.jobs[id] = job;
        redis.hset('jobs', id, JSON.stringify(job.serialize()));

        return job;
    },

    remove: function (id) {
        if (!this.jobs[id]) {
            throw new Error('Job not found');
        }
        this.jobs[id].stop();
        delete this.jobs[id];
        redis.hdel('jobs', id);
    },

    list: function () {
        var result = [];
        _.forEach(this.jobs, function (job) {
            result.push(job.print());
        });

        return result;
    }
};

module.exports = JobManager;
