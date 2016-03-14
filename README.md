# slack-cron

cron style message scheduling for slack

## Getting started

### 1. Create Bot and Slash Command on Slack

This app needs both of Bot and Slash Command.

Create them from here:  
https://{your-team}.slack.com/apps/manage/custom-integrations

### 2. Deploy to your heroku

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

Following 2 envvars are required.

* `SLACK_BOT_TOKEN`
* `SLACK_SLASH_COMMAND_TOKEN`

### 3. Add job for Heroku Scheduler

slack-cron automatically installs [Heroku Scheduler](https://elements.heroku.com/addons/scheduler) on the first deploying to your heroku.

To keep Heroku awake, you should add a job like following for `Every 10 minutes`.

```
curl -s -d "" {your-app-name}.herokuapp.com >/dev/null 2>&1
```

![image](https://cloud.githubusercontent.com/assets/4360663/13732886/6219f800-e9ce-11e5-9a19-e5b9827add9f.png)

### 4. Invite your Bot to the channel

![image](https://cloud.githubusercontent.com/assets/4360663/13660452/71503658-e6cd-11e5-8073-d449b17f560a.png)  
![image](https://cloud.githubusercontent.com/assets/4360663/13660409/0cbad36a-e6cd-11e5-9918-639c9117f514.png)  

## Usage

![image](https://cloud.githubusercontent.com/assets/4360663/13660573/ab0ac768-e6ce-11e5-8385-fec483fe12b4.png)  
![image](https://cloud.githubusercontent.com/assets/4360663/13660587/cc1fe55a-e6ce-11e5-9bab-5229406c2523.png)  
![image](https://cloud.githubusercontent.com/assets/4360663/13660618/0d907d10-e6cf-11e5-9594-b9b73f5b2722.png)  
![image](https://cloud.githubusercontent.com/assets/4360663/13660693/b7a3bea2-e6cf-11e5-9389-6a3458c9bc79.png)  
![image](https://cloud.githubusercontent.com/assets/4360663/13660707/d87e1a6e-e6cf-11e5-8626-015ce4fcc31f.png)  
![image](https://cloud.githubusercontent.com/assets/4360663/13660742/1b11ca56-e6d0-11e5-9f89-d879ee149643.png)  

### In detail

* `add` can be aliased `new`.
* `list` can be aliased `ls` or `show`.
* `remove` can be aliased `rm`, `delete` or `del`.
* See the documentation of [Message Formatting](https://api.slack.com/docs/formatting) to learn about that.
