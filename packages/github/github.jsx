
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
           var data = {
               eventType: eventType,
               event: req.body
           };

          var message = Meteor.call('saveMessage', {
                projectId: project._id,
                messageType: Ols.MESSAGE_TYPE_CUSTOM,
                customMessageType: 'github',
                isIntegration: true,
                data: data,
                createdBy: GITHUB,
                updatedBy: GITHUB,
                createdByName: GITHUB,
                updatedByName: GITHUB
            }, function (err, msg) {
                if (err != null) {
                    console.error("-- error saving github custom message " + JSON.stringify(err));
                    JsonRoutes.sendResult(res, 404, "{'ok':false, 'error': 'saveMessage failed: " + err.reason + "'}");
                    throw new Meteor.Error('Github.saveMessage.failed', "Failed to save Github Message: " + JSON.stringify(err));
                } else {
                    console.log("-- github custom message " + msg.seq + " saved successfully. Checking for refs..");
                    findItemRefs(project._id, msg, data);
                    console.log("-- github refs check complete - sending 200 back to github");
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

function findItemRefs(projectId, message, data) {
  console.log("-- finding item refs for project " + projectId + ", message:" + JSON.stringify(message));
  switch(data.eventType) {
    case 'push':
    console.log('-- github event type is push - checking commit messages for refs');
    data.event.commits.forEach(function(commit) {
      if(commit.message) {
          console.log("-- checking for refs in commit " + commit.id);
          var projectKey = Projects.findOne(projectId).key;
          console.log("-- project key for commit " + commit.id + " is " + projectKey);
          var re = new RegExp('#' + projectKey + '-([\\d]+)', 'g');
          var matches;
          do {
              matches = re.exec(commit.message);
              if (matches) {
                  var seq = parseInt(matches[1]);
                  console.log("-- ref to item " + seq + " found in commit " + commit.id);
                  if (seq != null) {
                      var item = Items.findOne({projectId: projectId, seq});
                      if (item != null) {
                          console.log("-- item found with seq " + seq + ".  Adding ref for message " + message._id + " to item " + item._id);
                          Refs.methods.addRef.call({
                              messageId: message._id,
                              projectId: projectId,
                              messageSeq: message.seq,
                              itemId: item._id,
                              itemSeq: seq
                          }, (err, ref) => {
                              console.log("-- Add ref done: " + JSON.stringify(err));
                              if (err) {
                                  if (err.message) {
                                      console.error("Error adding ref: " + err.message);
                                  } else {
                                      console.error("- Error adding ref: " + err.reason);
                                  }
                              } else {
                                  console.log("-- ref " + ref._id + " successfully created for item " + seq);
                              }
                          });
                      } else {
                        console.log("-- Cannot find item for seq " + seq + ". Ignoring ref");
                      }
                  } else {
                      console.log("-- Seq " + seq + " not found. Ignoring ref.");
                  }
              } else {
                  console.log("-- no more refs found");
              }
          } while (matches);
      } else {
          console.log("-- Ignoring ref detection in commit " + commit.id + " as it has no message field");
      }
    });
    break;
    default:
      console.log('-- github event type is ' + data.eventType + ' - not looking for refs');
      break;
  }
}

Ols.Command.defineComponent('github', function(ctx) {
    return <GithubMessage key={ctx._id} message={ctx}/>;
});
