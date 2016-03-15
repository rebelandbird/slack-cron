'use strict';

var CronJob = require('cron').CronJob;
var deasync = require('deasync');

var timezone = process.env.TIMEZONE;

var Job = function (bot, id, pattern, text, channel) {
    this.bot = bot;
    this.id = id;
    this.pattern = pattern;
    this.text = text;
    this.channel = channel;
};

Job.prototype = {
    start: function () {
        var that = this;
        this.cronJob = new CronJob(this.pattern, function () {
            that.bot.say({
                text: that.text,
                channel: that.channel
            });
        }, null, false, timezone);

        this.cronJob.start();
    },

    stop: function () {
        this.cronJob.stop();
    },

    serialize: function () {
        return {
            pattern: this.pattern,
            text: this.text,
            channel: this.channel
        };
    },

    print: function () {
        var ln = '';
        var done = false;
        var that = this;
        that.bot.api.channels.info({ channel: that.channel }, function (err, res) {
            var channelName = res.channel.name;
            ln = '[' + that.id + '] #' + channelName + ' ' + that.pattern + ' ' + that.text;
            done = true;
        });
        deasync.loopWhile(function () { return !done; });

        return ln;
    }
};

module.exports = Job;
