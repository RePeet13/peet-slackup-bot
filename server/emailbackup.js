let SMTP_URL = process.env.SMTP_URL

import {Template} from 'meteor/templating';

if (Meteor.isServer) {
    SyncedCron.add({
        name: 'email backup',
        schedule: function (parser) {
            // parser is a later.parse object
            return parser.text('at 11:30 pm');
        },
        job: Meteor.bindEnvironment(function () {
            //DO SOME COOL STUFF HERE
            send_summary()
        })
    });

    SyncedCron.start();
}

let send_summary = () => {
    let html = Blaze.toHTMLWithData(Template.allChannels)
    Email.send({
        from: "peet2d2@gmail.com",
        to: "lordduckx@gmail.com",
        subject: "this is a test",
        html: html
    })
}

Meteor.methods({
    summary_email: function () {
        send_summary();
    },
    sendShareEmail:function(options){
        // console.log(options)
        Email.send(options);
    }

})

Meteor.startup(function () {
    if (Meteor.isServer) {
        process.env.MAIL_URL = "SMTP_URL";
    }
});
