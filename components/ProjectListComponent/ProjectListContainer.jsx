ProjectListContainer = React.createClass({
    mixins: [ReactMeteorData],

    propTypes: {
        projectList: React.PropTypes.array,
        incomingMessages: React.PropTypes.array,

        onProjectClicked: React.PropTypes.func
    },

   getMeteorData() {
        return {
            currentProjectId: FlowRouter.getParam('projectId'),
        }
    },

    render() {
        return (
            <div className="project-list-container">
                <div className="btn-group btn-group-justified" role="group" style={{padding:'5px'}}>
                    <div className="btn-group" role="group">
                        <button type="button" className="btn btn-default" onClick={this.onNewConversationClicked}>New Conversation</button>
                    </div>
                    <div className="btn-group" role="group">
                        <button type="button" className="btn btn-default" onClick={this.onNewProjectClicked}>New Project</button>
                    </div>
                </div>


                <ProjectList
                    currentProjectId={this.data.currentProjectId}
                    projectList={this.props.projectList}
                    onProjectClicked={this.props.onProjectClicked}
                    incomingMessages={this.props.incomingMessages} />
            </div>
        )
    },

    onNewConversationClicked(event) {
        var self = this;
        event.preventDefault();

        bootbox.prompt({
            title: "Enter conversation subject:",
            callback: function (title) {
                if(title != null) {
                    title = title.trim();
                    if (title.length > 0) {
                        Projects.methods.addProject.call({type:Ols.Project.PROJECT_TYPE_CONVERSATION, title}, (err) => {
                            if (err) {
                                toastr.error('Error creating conversation: ' + err.reason);
                                console.error('Error creating conversation: ' + err);
                            }
                        });
                    }
                }
            }
        });
    },

    onNewProjectClicked(event) {
        var self = this;
        event.preventDefault();

        bootbox.prompt({
            title: "Enter project title",
            callback: function (title) {
                if(title != null) {
                    title = title.trim();
                    if (title.length > 0) {
                        bootbox.prompt({
                            title: "What is the unique key for this project?",
                            value: title.substring(0, 3).toUpperCase(),
                            callback: function (key) {
                                if(key != null) {
                                    key = key.trim();
                                    if (key.length > 0) {
                                        Projects.methods.addProject.call({type:Ols.Project.PROJECT_TYPE_STANDARD, title, key}, (err) => {
                                            if (err) {
                                                toastr.error('Error creating project: ' + err.reason);
                                                console.error('Error creating project: ' + err);
                                            }
                                        });
                                    }
                                }
                            }
                        });
                    }
                }
            }})
        }
});
