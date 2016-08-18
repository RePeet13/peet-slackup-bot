Meteor.publish('messages', function () {
    return Messages.find({})
});

Meteor.publish('idmapping', function () {
    return IDMapping.find({})
});
