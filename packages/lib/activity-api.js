
ActivityApi = function() {
};

/*
    Adds an activity message to the message history and an activity item to the activity
    collection.

    Arguments:
        - projectId
        - type: optional - defaults to ACTIVITY_TYPE_ITEM
        - itemId: optional - the UID for the item that this activity is based on
        - longDescription - the description that will be displayed in the main message history
        - shortDescription - the description that will be displayed in detail mode for this item
 */
ActivityApi.prototype.addActivity = function(opts) {
    var type = opts && opts.type ? opts.type : Ols.ActivityType.ACTIVITY_TYPE_ITEM;
    var sysMsg = Meteor.call('systemSuccessMessage', opts.projectId, opts.longDescription, opts.itemId, {
        shortDescription: opts.shortDescription
    });
    Meteor.call('addActivityMessage', opts.shortDescription, type, opts.projectId, sysMsg._id, sysMsg.seq, opts.itemId);
    return sysMsg;
};

Ols.Activity = new ActivityApi();