import {Meteor} from 'meteor/meteor';
let token = process.env.SLACK_API_TOKEN || '';
import moment from 'moment-timezone';


var RtmClient = require('@slack/client').RtmClient;
var MemoryDataStore = require('@slack/client').MemoryDataStore;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var WebClient = require('@slack/client').WebClient;
var dataStore;
var rtm;

Meteor.startup(() => {
    console.log("token is: " + token);
    rtm = new RtmClient(token, {
        logLevel: 'info',
        dataStore: new MemoryDataStore()
    });
    rtm.start();

    rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, Meteor.bindEnvironment(function (rtmStartData) {
        console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to a channel`);
        // console.log(RTM_EVENTS)

        // console.log(rtm.dataStore);
        // Messages.insert({
        //     datastore:rtm.dataStore
        // })
        let channels = rtm.dataStore.channels;
        let users = rtm.dataStore.users;
        // console.log("werking ",typeof (channels))
        for(channel in channels){
            IDMapping.insert({
                source:"channel",
                slack_id: channels[channel].id,
                name: channels[channel].name,
            })

        }
        for(user in users){
            IDMapping.insert({
                source:"user",
                slack_id: users[user].id,
                name: users[user].name,
            })
        }

    }));

    var web = new WebClient(token);

    rtm.on(RTM_EVENTS.MESSAGE, Meteor.bindEnvironment(function (message) {
        // Listens to all `message` events from the team
        console.log(message);
        message_handler(message);
    }));

    rtm.on(RTM_EVENTS.CHANNEL_CREATED, function (message) {
        // Listens to all `channel_created` events from the team
    });
});

//stretch goal, handle Reactions and Stars with RTM_EVENTS.REACTION_ADDED and RTM_EVENTS.STAR_REMOVED
let message_handler = (message) => {
  if (!message.subtype) {
      let insert_text = message.text;
      if(message.attachments){
          if(message.attachments[0].image_url){
              insert_text += ("\n" + message.attachments[0].image_url)
          }
      }

      Messages.insert({
          emittedJson: message,
          Date: moment(),
          Day: moment().tz("America/Los_Angeles").format("YYYY-MM-DD"), //this gives us a consistent way to get the date summary
          text: insert_text,
          channel: message.channel,
          user: message.user,
          prev_msgs: [],
          ts: message.ts,
          // Time: moment.unix(1470938599).format('MMMM Do YYYY, h:mm:ss a')
      })
  } else if (message.subtype === "message_changed") {
      console.log(message.previous_message)
      let updated_message = Messages.findOne({ts:message.previous_message.ts})
      // let update_msg_array = updated_message.fetch()
      let prev_msgs_update = updated_message.prev_msgs.push(updated_message);
      Messages.update({
          _id: updated_message._id
      }, {
          $set: {
              emittedJson: message,
              text: message.message.text,
              prev_msgs: prev_msgs_update,
          }
      });

  } else if (message.subtype === "message_deleted") {
      let updated_message = Messages.findOne({ts:message.previous_message.ts})
      Messages.remove({
          _id: updated_message._id
      });
  } else if (message.subtype === "file_share") {
      let updated_message = Messages.findOne({ts:message.previous_message.ts})
      // let update_msg_array = updated_message.fetch()
      let prev_msgs_update = updated_message.prev_msgs.push(updated_message);
      Messages.update({
          _id: updated_message._id
      }, {
          $set: {
              emittedJson: message,
              text: message.message.text + " " + message.file.url_private,
              prev_msgs: prev_msgs_update,
          }
      });
  } else if (message.subtype === "bot_message") {
      let insert_text = message.text;
      if (insert_text === "") {
          if (message.attachments) {
              insert_text = message.attachments.fallback;
          }
      }
      Messages.insert({
          emittedJson: message,
          Date: moment(),
          Day: moment().tz("America/Los_Angeles").format("YYYY-MM-DD"), //this gives us a consistent way to get the date summary
          text: insert_text,
          channel: message.channel,
          user: message.user,
          prev_msgs: [],
          ts: message.ts,
          // Time: moment.unix(1470938599).format('MMMM Do YYYY, h:mm:ss a')
      });
  } else if (message.subtype === "me_message") {
      let insert_text = "_" + message.text + "_";
      Messages.insert({
          emittedJson: message,
          Date: moment(),
          Day: moment().tz("America/Los_Angeles").format("YYYY-MM-DD"), //this gives us a consistent way to get the date summary
          text: insert_text,
          channel: message.channel,
          user: message.user,
          prev_msgs: [],
          ts: message.ts,
          // Time: moment.unix(1470938599).format('MMMM Do YYYY, h:mm:ss a')
      });
  }
}

Meteor.methods({
    getUserFromId: function(id){
        return rtm.dataStore.getUserById(id)
    }
})

export {rtm}
