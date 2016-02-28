ProjectView = React.createClass({
    mixins: [ReactMeteorData],

    getMeteorData() {
        var data = {};
        data.currentProject = {};
        data.currentProjectId = FlowRouter.getParam('projectId');
        data.currentItemId = FlowRouter.getQueryParam('itemId');
        var currentProjectHandle = Meteor.subscribe('currentProject', data.currentProjectId);
        var membersHandle = Meteor.subscribe('currentProjectMembers', data.currentProjectId);
        if(data.currentItemId) {
            var currentItemHandle = Meteor.subscribe('currentItem', data.currentItemId);
            data.currentItemHandleIsReady = currentItemHandle.ready();
        } else {
            data.currentItemHandleIsReady = true;
        }

        data.isLoading = true;
        if(membersHandle.ready() && currentProjectHandle.ready() && data.currentItemHandleIsReady) {
            data.authInProcess = Meteor.loggingIn();
            data.canShow = Meteor.user() != null && Members.findOne({userId: Meteor.userId()}) != null;

            data.currentProject = Projects.findOne(data.currentProjectId);
            data.memberList = Members.find({projectId: data.currentProjectId}, {sort: {createdAt: 1}}).fetch();

            data.startMessageSeq = parseInt(FlowRouter.getParam('startMessageSeq')) || 0;
            data.messagesCountLimit = parseInt(FlowRouter.getParam('messagesCountLimit')) || Ols.DEFAULT_PAGE_SIZE;
            data.doScrollBottom = FlowRouter.getQueryParam('scrollBottom') != null;
            data.doScrollTop = FlowRouter.getQueryParam('scrollTop') != null;

            data.currentItem = Items.findOne(data.currentItemId);

            data.isLoading = false;
        }
        return data;
    },

    renderCurrentItemKey() {
        return "#" + this.data.currentItem.projectKey + "-" + this.data.currentItem.seq;
    },

    render() {
        if (this.data.currentProjectId == null) {
            return (
                <div className="view-container">
                    <div className="empty-project-list">
                        <p><b>Welcome to OpenLoops!</b></p>
                        <div><i className="fa fa-smile-o" style={{'fontSize':'20em', 'color': '#FF7503'}}></i></div>
                        <p>To get started, either create a new project or select an existing one.</p>
                    </div>
                </div>
            );
        } else if(this.data.canShow == false) {
            return (
                <div className="view-container">
                    <div className="empty-project-list">
                        <p><b>Computer says no!</b></p>
                        <div><i className="fa fa-frown-o" style={{'fontSize':'20em', 'color': '#703470'}}></i></div>
                        <p>Sorry, you aren't a member of this project</p>
                    </div>
                </div>
            );
        } else {
            return (
                <div className="view-container">
                    <RightSidebarComponent
                        projectId={this.data.currentProject._id}
                        memberList={this.data.memberList}
                    />
                    {this.renderHeader()}
                    <MessageListContainer
                        ref="messageListContainer"
                        projectId={this.data.currentProject._id}
                        currentItem={this.data.currentItem}
                        startMessageSeq={this.data.startMessageSeq}
                        messagesCountLimit={this.data.messagesCountLimit}
                        onOtherProjectNewMessage={this.props.onOtherProjectNewMessage} />
                </div>
            );
        }
    },

    getHeaderClassName() {
        if(this.data.currentItem) {
            return 'black';
        } else {
            return this.data.currentProject.theme || 'blue';
        }
    },

    getCurrentItemClassName() {
        var className = 'fa';
        if(this.data.currentItem.subType == Ols.Item.ISSUE_SUBTYPE_BUG) {
            className += ' fa-bug';
        } else if(this.data.currentItem.subType == Ols.Item.ACTION_SUBTYPE_TASK) {
            className += ' fa-exclamation-circle';
        } else if(this.data.currentItem.subType == Ols.Item.INFO_SUBTYPE_QUESTION) {
           className += ' fa-question';
        } else if(this.data.currentItem.subType == Ols.Item.INFO_SUBTYPE_DISCUSSION) {
            className += ' fa-comments-o';
        }
        return className;
    },

    renderHeader() {
        if(this.isLoading) {
            return (
                <header className={this.getHeaderClassName()}>
                    <h2>
                        <i className="fa fa-spin fa-2x fa-spinner" style={{color:'#01588A', position:'relative', top:'-10px'}}></i>
                    </h2>
                </header>
            );
        } else {
            if(this.data.currentItem) {
                return (
                    <header className={this.getHeaderClassName()}>
                        <h2>
                            <i className={this.getCurrentItemClassName()}></i> {this.data.currentItem.description} <span style={{color:'lightgray', fontSize:'16px'}}>{this.renderCurrentItemKey()}</span>
                        </h2>
                    </header>
                );
            } else {
                return (
                    <header className={this.getHeaderClassName()}>
                        <h2>
                            <i className="fa fa-bullseye"></i> {this.data.currentProject.title} <span
                            className="pull-right dropdown">
                        <button className="btn btn-default dropdown-toggle" type="button" id="dropdownMenu1"
                                data-toggle="dropdown">
                            <span className="caret"></span>
                        </button>
                        <ul className="dropdown-menu" aria-labelledby="dropdownMenu1">
                            <li><a onClick={this.onRenameLinkClicked} href="#">Rename Project</a></li>
                            <li role="separator" className="divider"></li>
                            <li><a onClick={this.onBlueThemeLinkClicked} href="#">Set Blue Theme</a></li>
                            <li><a onClick={this.onRedThemeLinkClicked} href="#">Set Red Theme</a></li>
                            <li><a onClick={this.onGreenThemeLinkClicked} href="#">Set Green Theme</a></li>
                            <li><a onClick={this.onPurpleThemeLinkClicked} href="#">Set Purple Theme</a></li>
                            <li role="separator" className="divider"></li>
                            <li><a href="#" onClick={this.onDeleteLinkClicked}>Delete Project</a></li>
                        </ul>
                    </span>
                        </h2>
                    </header>
                );
            }
        }
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
    },

    onRenameLinkClicked: function(e) {
        e.preventDefault();
        var self = this;
        bootbox.prompt({title: "Enter new project title:", value: this.data.currentProject.title, callback: function(title) {
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
        bootbox.confirm("Are you sure you want to permanently delete this project?  Consider archiving it instead, if you just want to hide it from view without destroying it forever.", function(result) {
            if (result == true) {
                self.props.onDeleteLinkClicked(self.data.currentProjectId);
            }
        });
    },

    componentDidMount: function () {
        // console.trace("ProjectPage.componentDidMount");
    },

    componentDidUpdate: function () {
        //console.trace("ProjectView.componentDidUpdate");
        if (this.data.canShow) {
            var self = this;
            if (this.data.currentProject) {
                this.refs.messageListContainer.loadMessages(function () {
                    if (self.data.doScrollBottom) {
                        self.refs.messageListContainer.scrollBottom();
                    } else if(self.data.doScrollTop) {
                        self.refs.messageListContainer.scrollTop();
                    }
                });
            }
        }
    }
})
