const { Snackbar } = mui;

ProjectPage = React.createClass({
    mixins: [ReactMeteorData],

    getInitialState() {
        return {
            incomingMessages: [],
            snackBarMessage: '',
            showSnackBar: false
        };
    },

    componentDidMount: function () {
        //console.trace("ProjectPage.componentDidMount");
    },

    componentDidUpdate: function () {
        //console.trace("ProjectPage.componentDidUpdate");
    },

    getMeteorData() {
        //console.trace("ProjectPage.getMeteorData");
        var data = {};
        data.projectList = [];
        var projectsHandle = Meteor.subscribe('projects');
        var usersHandle = Meteor.subscribe('allUsernames');
        var userStatusHandle = Meteor.subscribe('userStatus');

        if(projectsHandle.ready() && usersHandle.ready() && userStatusHandle.ready()) {
            data.projectList = Projects.find({}, {sort: {updatedAt: -1}}).fetch();
            data.authInProcess = Meteor.loggingIn();
        }
        return data;
    },

    render() {
            this.renderTabTitle();
        /*if(this.data.authInProcess) {
            return (
                <p>Loading...</p>
            );
        } else */if(Meteor.userId() == null) {
           return (
               <div className="main-container">
                   <div className="empty-project-list">
                       <p><b style={{fontSize:'20px'}}>Welcome to OpenLoops</b></p>
                       <div><i className="fa fa-adjust" style={{'fontSize':'20em', 'color': '#703470'}}></i></div>
                       <p>Please login or sign-up to continue</p>
                       <p>To do so, click on the sign-in link at top-right of this page</p>
                       <p><i>Not exactly intuitive I know -  I'm working on it - but there is soooo much to do! ;-)</i></p>
                   </div>
               </div>
           );
        } else {
            return (
                <div className="view-container">
                    <ProjectSelectorComponent
                        ref="projectSelectorComponent"
                        projectList={this.data.projectList}
                        onProjectSelected={this.onProjectSelected}/>
                    <ProjectListContainer
                        incomingMessages={this.state.incomingMessages}
                        onProjectClicked={this.onProjectClicked}
                        projectList={this.data.projectList}/>
                    <ProjectView
                        onAddItem={this.onAddItem}
                        onDeleteLinkClicked={this.onDeleteLinkClicked}
                        onOtherProjectNewMessage={this.onOtherProjectNewMessage}/>
                    <Snackbar
                        open={this.state.showSnackBar}
                        message={this.state.snackBarMessage}
                        autoHideDuration={4000}
                        onRequestClose={this.onSnackBarClose}
                        />
                </div>
            );
        }
    },

    renderTabTitle() {
        if(this.state.incomingMessages.length > 0) {
            document.title = "(" + this.state.incomingMessages.length + ") OpenLoops";
        } else {
            document.title = "OpenLoops";
        }
    },

    onOtherProjectNewMessage: function(msg) {
        this.setState({'incomingMessages': this.state.incomingMessages.concat([msg])});
    },

    onProjectClicked(project) {
        Projects.methods.markAsSeen.call({projectId: project._id, userId: Meteor.userId()}, (err) => {
            if(err) {
                console.error("Error marking project as seen: " + err);
            }
        });
        Meteor.call('updateUserSetCurrentProject', Meteor.userId(), project._id);
        //When a project is selected, reset its incoming messages to zero
        this.setState({'incomingMessages': this.state.incomingMessages.filter(function(msg) {
            return msg.projectId != project._id;
        })});
        FlowRouter.go('projectPageLatest', {projectId: project._id}, {scrollBottom:true});
    },

    onDeleteLinkClicked(projectId) {
        Projects.methods.removeProject.call({projectId: projectId}, function (err) {
            if (err) {
                toastr.error("Unable to delete project", err.reason);
            }
        });
        FlowRouter.go('homePage');
    },

    onProjectSelected(projectId, message, type, subType) {
        this.doAddItem(projectId, message, type, subType);
    },

    onAddItem(message, type, subType) {
        var self = this;
        if(this.props.projectType == Ols.Project.PROJECT_TYPE_STANDARD) {
            this.doAddItem(message.projectId, message, type, subType);
        } else {
            this.refs.projectSelectorComponent.setState({open:true, title: 'Create ' + subType + ' in which project?', message, type, subType})
        }
    },

    doAddItem(projectId, message, type, subType) {
        var self = this;
        Items.methods.addItem.call({
            description: message.content,
            projectId: projectId,
            type: type,
            subType: subType,
            status: Ols.Status.OPEN,
            createdFromMessageId: message._id
        }, (err, item) => {
            if (err) {
                if (err.reason) {
                    toastr.error("Error adding item from message: " + err.reason);
                } else {
                    console.error("Error adding item from message: " + JSON.stringify(err));
                }
            } else {
                self.showSnackBarMessage("The " + subType + " was successfully created in your chosen project");
            }
        });
    },

    showSnackBarMessage(msg) {
        this.setState({'showSnackBar': true, 'snackBarMessage': msg});
    },

    onSnackBarClose() {
        this.setState({'showSnackBar': false, 'snackBarMessage': ''});
    }
});
