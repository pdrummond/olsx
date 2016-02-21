
const GITHUB = 'Github';

if(Meteor.isServer) {

    JsonRoutes.add("post", "/ols/webhook/github/project/:projectId", function (req, res, next) {
        console.log("GITHUB WEBHOOK EVENT");
        //console.log("req.body: " + JSON.stringify(req.body));
        //console.log('req.headers' + JSON.stringify(req.headers));
        var eventType = req.headers['x-github-event'];

        var project = Projects.findOne(req.params.projectId);

        if(project == null) {
            JsonRoutes.sendResult(res, 404, "{'ok': false, 'error': 'project doesn't exist}");
        } else {
           console.log("project is valid: " + JSON.stringify(project));

            Meteor.call('saveMessage', {
                projectId: project._id,
                messageType: Ols.MESSAGE_TYPE_CUSTOM,
                customMessageType: 'github',
                isIntegration: true,
                data: {
                    eventType: eventType,
                    event: req.body
                },
                createdBy: GITHUB,
                updatedBy: GITHUB,
                createdByName: GITHUB,
                updatedByName: GITHUB
            }, function (err, msg) {
                if (err != null) {
                    JsonRoutes.sendResult(res, 404, "{'ok':false, 'error': 'saveMessage failed: " + err.reason + "'}");
                    console.error("-- error saving github custom message " + JSON.stringify(err));
                    throw new Meteor.Error('Github.saveMessage.failed', "Failed to save Github Message: " + JSON.stringify(err));
                } else {
                    JsonRoutes.sendResult(res, 200);
                }
            });
        }

        /*var project = Ols.Project.get(req.params.projectId);
        var board = Ols.Board.get(req.params.boardId);

        if(project == null) {
            JsonRoutes.sendResult(res, 404, "{'ok': false, 'error': 'project doesn't exist}");
        } else if(project == null) {
            JsonRoutes.sendResult(res, 404, "{'ok': false, 'error': 'board doesn't exist}");
        } else {
            console.log("sending webhookEvent");
            Ols.Activity.insertWebHookActivityMessage({
                type: Ols.MSG_TYPE_ACTIVITY,
                activityType: Ols.ACTIVITY_TYPE_WEBHOOK_EVENT,
                webHookType: Ols.GitHub.GITHUB_WEBHOOK_EVENT,
                eventType: eventType,
                event: req.body,
                projectId: project._id,
                boardId: board._id,
                createdAt: new Date().getTime(),
                createdBy: 'github',
                activityImageUrl: 'https://assets-cdn.github.com/images/modules/logos_page/GitHub-Mark.png'
                //activityImageUrl: 'packages/ols_github/images/GitHub-Mark-32px.png'
            });
            console.log("SENDING NOW...");
            JsonRoutes.sendResult(res, 200);
            console.log("RESPONSE SENT");
        }*/
    });
}

Ols.Command.defineComponent('github', function(ctx) {
    return <GithubMessage key={ctx._id} message={ctx}/>;
});


