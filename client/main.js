import {Template} from 'meteor/templating';
import {ReactiveVar} from 'meteor/reactive-var';
import './main.html';
import moment from 'moment-timezone';

Template.allChannels.helpers({
    channels: function(){
        let messages = Messages.find({Day:moment().format("YYYY-MM-DD")}).fetch()
        let channels = [];
        for (let i = 0;i < messages.length; i ++){
            let channel = messages[i].channel
            if(!channels.includes(channel)){
                channels.push(channel);
            }
        }
        return channels
    },
    channelName: function() {
        // console.log(this.user)
        return IDMapping.findOne({slack_id:this.toString()}).name
    },
});



Template.channel_messages.helpers({
    messages: function () {
        return Messages.find({channel:this.toString()})
    },
});

Template.message.helpers({
    username: function() {
        return IDMapping.findOne({slack_id:this.user}).name
    },

    timestamp: function() {
        return moment.unix(this.ts.split(".")[0]).format('MMMM Do YYYY, h:mm:ss a')
    }
});

Template.allChannels.events({
    'click .email':function(){
        var html=Blaze.toHTMLWithData(Template.allChannels);
        var options={
            from:"peet2d2@gmail.com",
            to:"lordduckx@gmail.com",
            subject:"Summary",
            html:html
        }
        Meteor.call("sendShareEmail",options, (error, response) => {
            if (error) {
                console.log(error.reason);
            } else {
            }
        });
    }
})

Meteor.startup(() => {
    Meteor.subscribe('messages');
    Meteor.subscribe('idmapping')
});
