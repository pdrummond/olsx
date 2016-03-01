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
                <ProjectSelectorComponent/>
                <div className="btn-toolbar" role="toolbar" style={{marginTop:'20px', padding:'5px'}}>
                    <div className="btn-group" role="group" style={{marginLeft:'15px'}}>
                        <button type="button" className="btn btn-default" onClick={this.onNewConversationClicked}><i style={{color:'gray'}} className="fa fa-comments-o"></i> New Conversation</button>
                    </div>
                    <div className="btn-group" role="group" style={{marginLeft:'20px'}}>
                        <button type="button" className="btn btn-default dropdown-toggle" data-toggle="dropdown">
                            <i style={{color:'gray'}} className="fa fa-bullseye"></i> New Project <span className="caret"></span>
                        </button>
                        <ul className="dropdown-menu">
                            <li><a href="#" onClick={this.onNewProjectBasicTemplateClicked}>Basic Template</a></li>
                            <li><a href="#" onClick={this.onNewProjectSoftwareTemplateClicked}>Software Development Template</a></li>
                        </ul>
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

    onNewProjectBasicTemplateClicked(event) {
        event.preventDefault();
        this.addProject(Ols.Project.PROJECT_TEMPLATE_BASIC);
    },

    onNewProjectSoftwareTemplateClicked(event) {
        event.preventDefault();
        this.addProject(Ols.Project.PROJECT_TEMPLATE_SOFTWARE);
    },

    addProject(template) {
        var self = this;
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
                                        Projects.methods.addProject.call({type:Ols.Project.PROJECT_TYPE_STANDARD, title, key, template}, (err) => {
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
