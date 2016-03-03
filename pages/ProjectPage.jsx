const { AppBar, IconButton, FontIcon, IconMenu, LeftNav, Snackbar, Divider, RaisedButton, FlatButton, Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle, DropDownMenu } = mui;
const { MenuItem } = mui.Menus;
const { ContentAdd, ActionReorder, NavigationMoreVert, NavigationExpandMore } = mui.SvgIcons;
const Styles = mui.Styles;
const Colors = Styles.Colors;

ProjectPage = React.createClass({
    mixins: [ReactMeteorData],

    getInitialState() {
        return {
            incomingMessages: [],
            snackBarMessage: '',
            showSnackBar: false,
            leftSideBarOpen: false
        };
    },

    componentWillUpdate: function () {
        console.trace("ProjectPage.componentWillUpdate");
    },

    componentDidMount: function () {
        console.trace("ProjectPage.componentDidMount");
    },

    componentDidUpdate: function () {
        console.trace("ProjectPage.componentDidUpdate");
    },

    getMeteorData() {
        console.trace("ProjectPage.getMeteorData");
        var data = {};
        data.projectList = [];
        data.currentProjectId = FlowRouter.getParam('projectId');
        var projectsHandle = Meteor.subscribe('projects');
        var usersHandle = Meteor.subscribe('allUsernames');
        var userStatusHandle = Meteor.subscribe('userStatus');
        var currentProjectHandleReady = false;
        if(data.currentProjectId) {
            var currentProjectHandle = Meteor.subscribe('currentProject', data.currentProjectId);
            currentProjectHandleReady = currentProjectHandle.ready();
        } else {
            currentProjectHandleReady = true;
        }
        data.currentItemId = FlowRouter.getQueryParam('itemId');
        if(data.currentItemId) {
            var currentItemHandle = Meteor.subscribe('currentItem', data.currentItemId);
            data.currentItemHandleIsReady = currentItemHandle.ready();
        } else {
            data.currentItemHandleIsReady = true;
        }
        if(projectsHandle.ready() && currentProjectHandleReady && usersHandle.ready() && userStatusHandle.ready() && data.currentItemHandleIsReady) {
            data.currentProject = Projects.findOne(data.currentProjectId);
            data.projectList = Projects.find({}, {sort: {updatedAt: -1}}).fetch();
            data.currentItem = Items.findOne(data.currentItemId);
            console.log("ProjectPage.getMeteorData: projects: " + data.projectList.length);
        }
        console.trace("ProjectPage.getMeteorData: " + JSON.stringify(_.keys(data)));
        return data;
    },

    render() {
        console.log("ProjectPage.render: projects: " + this.data.projectList.length);
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
                    {/*}<AppBar
                            title={this.data.currentProject ? this.data.currentProject.title : "OpenLoops"}
                            onLeftIconButtonTouchTap={this.handleToggle}

                            iconElementRight={
                                this.renderAppBarIconMenu()
                            }
                            />*/}
                    <Toolbar className={this.data.currentProject ? 'theme-' + this.data.currentProject.theme : "theme-blue"}>
                        <ToolbarGroup firstChild={true} float="left">
                            <IconButton touch={true} onClick={this.handleToggle} style={{color:'white', position:'relative', top:'5px'}}>
                                <ActionReorder/>
                            </IconButton>
                        </ToolbarGroup>
                        <ToolbarGroup>
                        <ToolbarTitle text={this.getProjectOrItemTitle()} style={{color:'white'}}></ToolbarTitle>
                        </ToolbarGroup>
                        <ToolbarGroup float="right">
                            {this.renderAppBarIconMenu()}
                            <ToolbarSeparator />
                            <RaisedButton label="Create" icon={<ContentAdd />}/>
                            <DropDownMenu value={1} onChange={this.handleChange} style={{color:'white'}}>
                                <MenuItem value={1} primaryText="Project Summary" />
                                <MenuItem value={2} primaryText="All Items" />
                                <MenuItem value={3} primaryText="Backlog" />
                                <MenuItem value={4} primaryText="Work Items" />
                                <MenuItem value={5} primaryText="Tasks" />
                                <MenuItem value={6} primaryText="Bugs" />
                                <MenuItem value={7} primaryText="Discussions" />
                            </DropDownMenu>
                        </ToolbarGroup>
                    </Toolbar>

                        <LeftNav
                            width={350}
                            docked={false}
                            open={this.state.leftSideBarOpen}
                            onRequestChange={this.handleToggle}
                            >
                            <ProjectListContainer
                                incomingMessages={this.state.incomingMessages}
                                onProjectClicked={this.onProjectClicked}
                                projectList={this.data.projectList}/>
                        </LeftNav>
                    <ProjectSelectorComponent
                        ref="projectSelectorComponent"
                        projectList={this.data.projectList}
                        onProjectSelected={this.onProjectSelected}/>
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

    getProjectOrItemTitle() {
        if(this.data.currentItem) {
            return this.data.currentItem.description;
        } else if(this.data.currentProject ) {
            return this.data.currentProject.title;
        } else {
            return '';
        }
    },

    onProjectChanged() {
        this.setState({title: project.title, theme: project.theme});
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
        this.handleToggle();
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
    },

    onLeftSidebarRequestChange(open) {
        this.setState({leftSideBarOpen: open});
    },

    handleToggle() {
        this.setState({leftSideBarOpen: !this.state.leftSideBarOpen});
    },

    getProjectTypeLabel() {
        return this.data.currentProject.type == Ols.Project.PROJECT_TYPE_STANDARD ? 'project' : 'conversation';
    },

    onRenameLinkClicked: function(e) {
        e.preventDefault();
        var self = this;
        bootbox.prompt({title: "Enter new " + this.getProjectTypeLabel() + " title:", value: this.data.currentProject.title, callback: function(title) {
            if (title !== null) {
                Projects.methods.setTitle.call({
                    projectId: self.data.currentProject._id,
                    title: title
                }, (err) => {
                    if(err) {
                        toastr.error("Error renaming project: " + err.reason);
                    }
                });
            }
        }});
    },

    onDeleteLinkClicked: function(e) {
        var self = this;
        e.preventDefault();
        bootbox.confirm("Are you sure you want to permanently delete this " + this.getProjectTypeLabel() + "?  Consider archiving it instead, if you just want to hide it from view without destroying it forever.", function(result) {
            if (result == true) {
                Projects.methods.removeProject.call({projectId: self.data.currentProject._id}, function (err) {
                    if (err) {
                        toastr.error("Unable to delete project", err.reason);
                    }
                });
                FlowRouter.go('homePage');
            }
        });
    },

    renderAppBarIconMenu() {
        var showIfProject = this.data.currentProject && this.data.currentProject.type == Ols.Project.PROJECT_TYPE_STANDARD ? 'block':'none';
        return (
            <IconMenu
                iconButtonElement={
                    <IconButton>
                        <NavigationMoreVert />
                    </IconButton>
                }>
                <MenuItem primaryText="Rename Project" onClick={this.onRenameLinkClicked} />
                <MenuItem primaryText="Delete Project" onClick={this.onDeleteLinkClicked} />
                <Divider />
                <MenuItem style={{display: showIfProject}} primaryText="Set Blue Theme" onClick={this.onBlueThemeLinkClicked} />
                <MenuItem style={{display: showIfProject}} primaryText="Set Red Theme" onClick={this.onRedThemeLinkClicked} />
                <MenuItem style={{display: showIfProject}} primaryText="Set Green Theme" onClick={this.onGreenThemeLinkClicked} />
                <MenuItem style={{display: showIfProject}} primaryText="Set Purple Theme" onClick={this.onPurpleThemeLinkClicked} />
                <Divider />
                <MenuItem primaryText="Help"/>
                <MenuItem primaryText="Sign out"/>
            </IconMenu>
        );
    },

    onBlueThemeLinkClicked() {
        this.updateProjectTheme("blue");
    },

    onRedThemeLinkClicked() {
        this.updateProjectTheme("red");
    },

    onGreenThemeLinkClicked() {
        this.updateProjectTheme("green");
    },

    onPurpleThemeLinkClicked() {
        this.updateProjectTheme("purple");
    },

    updateProjectTheme: function(theme) {
        Projects.methods.setTheme.call({
            projectId: this.data.currentProject._id,
            theme,
        }, (err) => {
            if(err) {
                toastr.error("Error changing theme for project: " + err.reason);
            }
        });
    }
});
