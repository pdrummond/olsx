ProjectView = React.createClass({
    mixins: [ReactMeteorData],

    getMeteorData() {
        //console.trace("ProjectView.getMeteorData");
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
            data.doScrollBottom = FlowRouter.getQueryParam('scrollBottom') && FlowRouter.getQueryParam('scrollBottom') == "true";
            data.doScrollTop = FlowRouter.getQueryParam('scrollTop') && FlowRouter.getQueryParam('scrollTop') == "true";

            data.currentItem = Items.findOne(data.currentItemId);

            data.isLoading = false;
        }
        return data;
    },

    renderCurrentItemKey() {
        return "#" + this.data.currentItem.projectKey + "-" + this.data.currentItem.seq;
    },

    render() {
        if (this.data.currentProjectId == null && Meteor.user() != null) {
            return (
                <div className="view-container">
                    <div className="empty-project-list">
                        <p><b style={{fontSize:'20px'}}>Hello {Meteor.user().username}, welcome to OpenLoops :-) </b></p>
                        <div><img src='/images/loopbot-medium.png'/></div>
                        <p style={{marginTop:'10px'}}>To get started, just click on one of the top-left buttons to create a project or a conversation.</p>
                    </div>
                </div>
            );
        } else {
            return (
                <div className={this.getProjectContainerClassName()}>
                    {this.renderRightSidebar()}
                    <MessageListContainer
                        ref="messageListContainer"
                        messageFilter={this.props.messageFilter}
                        projectId={this.data.currentProject._id}
                        projectType={this.data.currentProject.type}
                        projectKey={this.data.currentProject.key}
                        currentItem={this.data.currentItem}
                        startMessageSeq={this.data.startMessageSeq}
                        messagesCountLimit={this.data.messagesCountLimit}
                        onOtherProjectNewMessage={this.props.onOtherProjectNewMessage}
                        onAddItem={this.props.onAddItem} />
                </div>
            );

        }
    },

    renderRightSidebar() {
        return <RightSidebarComponent
            projectId={this.data.currentProject._id}
            memberList={this.data.memberList}
            currentProject={this.data.currentProject} />;
    },

    getProjectContainerClassName() {
        if(this.data.currentProject.type == Ols.Project.PROJECT_TYPE_STANDARD) {
            return 'view-container project-container';
        } else {
            return 'view-container conversation-container';
        }
    },

    getHeaderClassName() {
        if(this.data.currentProject.type == Ols.Project.PROJECT_TYPE_CONVERSATION) {
            return 'conversation';
        } else if(this.data.currentItem) {
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
            className += ' fa-comment';
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
                            <i className={this.getProjectTitleClassName()}></i> {this.data.currentProject.title} <span
                            className="pull-right dropdown">
                        <button className="btn btn-default dropdown-toggle" type="button" id="dropdownMenu1"
                                data-toggle="dropdown">
                            <span className="caret"></span>
                        </button>
                        {this.renderDropdownMenu()}
                    </span>
                        </h2>
                    </header>
                );
            }
        }
    },

    getProjectTypeLabel() {
        return this.data.currentProject.type == Ols.Project.PROJECT_TYPE_STANDARD ? 'project' : 'conversation';
    },

    renderDropdownMenu() {
        if(this.data.currentProject.type == Ols.Project.PROJECT_TYPE_STANDARD) {
            return (
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
            );
        } else {
            return (
                <ul className="dropdown-menu" aria-labelledby="dropdownMenu1">
                    <li><a onClick={this.onRenameLinkClicked} href="#">Rename Conversation</a></li>
                    <li><a href="#" onClick={this.onDeleteLinkClicked}>Delete Conversation</a></li>
                </ul>
            );
        }
    },

    getProjectTitleClassName() {
        if(this.data.currentProject.type == Ols.Project.PROJECT_TYPE_STANDARD) {
            return "fa fa-bullseye";
        } else {
            return "fa fa-comments";
        }
    },

    componentDidMount: function () {
        //console.trace("ProjectView.componentDidMount");
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
