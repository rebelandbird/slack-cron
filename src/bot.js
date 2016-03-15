'use strict';

var Botkit = require('botkit');

var slackBotToken = process.env.SLACK_BOT_TOKEN;
var slackSlashCommandToken = process.env.SLACK_SLASH_COMMAND_TOKEN;
var redisUrl = process.env.REDIS_URL;
var port = process.env.PORT || 80;

var redisConfig = { url: redisUrl };
var redisStorage = require('botkit-storage-redis')(redisConfig);

var controller = Botkit.slackbot({
    debug: false,
    storage: redisStorage
});

var authedBot = controller.spawn({
    token: slackBotToken
}).startRTM();

// workaround for https://github.com/howdyai/botkit/issues/108
authedBot.api.team.info({}, function (err, res) {
    controller.storage.teams.save({ id: res.team.id });
});

controller.setupWebserver(port, function (err, webserver) {
    controller.createWebhookEndpoints(controller.webserver);
});

var JobManager = require('./job-manager.js');
var jm = new JobManager(authedBot);

controller.on('slash_command', function (bot, message) {
    if (message.token != slackSlashCommandToken) {
        bot.replyPublic(message, 'Invalid token for slash command');
        return;
    }

    if (message.command == '/cron') {
        var response = '';
        var subCommand = message.text.match(/^[^\s]+/i)[0] || '';
        var args = message.text.replace(subCommand, '').trim();

        switch (subCommand) {
            case 'add':
            case 'new':
                var pattern = args.match(/^[^\s]+\s+[^\s]+\s+[^\s]+\s+[^\s]+\s+[^\s]+/i)[0] || '';
                var text = args.replace(pattern, '').trim();

                if (!pattern || !text) {
                    response = 'Invalid command';
                    break;
                }

                var channel = message.channel;
                var job = jm.add(pattern, text, channel);

                response = 'added ' + job.print();
                break;

            case 'remove':
            case 'rm':
            case 'delete':
            case 'del':
                var id = args.match(/^[^\s]+$/i) || '';

                if (!id) {
                    response = 'Invalid id';
                    break;
                }

                try {
                    jm.remove(id);
                    response = 'removed [' + id + ']';
                    break;
                } catch (e) {
                    response = e.message;
                    break;
                }

            case 'list':
            case 'ls':
            case 'show':
                if (!jm.list().length) {
                    response = 'No job here';
                } else {
                    response = jm.list().join("\n");
                }
                break;

            case 'help':
            case 'h':
                // fixme
                response = 'Under construction';
                break;

            default:
                response = 'Invalid command';
                break;
        }

        bot.replyPrivate(message, response);
    }
});
