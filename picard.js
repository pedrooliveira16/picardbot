var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
var req = require('request');
var Twitter = require('twitter');
var Oauth = require('oauth');
var OAuth2 = Oauth.OAuth2;
var tw_bearer_token = null

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

// Initialize Discord Bot
var bot = new Discord.Client({
   token: auth.token,
   autorun: true
});

var twitterAuth = function(callback){
    var oauth2 = new OAuth2(auth.consumer_key, auth.consumer_secret, 'https://api.twitter.com/', null, 'oauth2/token', null);
    oauth2.getOAuthAccessToken('',{'grant_type':'client_credentials'},function(err, access_token, refresh_token, results){
        tw_bearer_token = access_token
        callback()
    })
}

bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
    twitterAuth(function(){
        logger.info("Authenticated with Twitter")
    })
    bot.setPresence({ status: 'online', game: { name: "Shut up, Wesley." } });
});

bot.on('message', function (user, userID, channelID, message, evt){
    tokens = message.split(' ');

    if (tokens.length > 1 && tokens[0]=="!picardpresence") {
        presence = tokens.slice(1,tokens.length).join(' ')
        logger.info("Switching presence to: "+presence);
        bot.setPresence({ status: 'online', game: { name: presence } });
    }

    else{
        if(tokens.length > 0 && tokens[0]=="!picardtip"){
            var client = new Twitter({
                consumer_key: auth.consumer_key,
                consumer_secret: auth.consumer_secret,
                bearer_token: tw_bearer_token
            })
            client.get('statuses/user_timeline', {screen_name: 'PicardTips', count: 200, include_rts: false}, function(error, tweet, response){
                tweetChoice = Math.floor((Math.random() * 200)+1)
                bot.sendMessage({
                    to: channelID,
                    message: 'https://twitter.com/PicardTips/status/'+tweet[tweetChoice].id_str
                })
            })
            

            
            
        }
    }
});