RightSidebarComponent = React.createClass({
    mixins: [ReactMeteorData],

    propTypes: {
        projectId: React.PropTypes.string.isRequired
    },

    getMeteorData() {
        console.log("RightSidebarComponent.projectId: " + this.props.projectId);
        return {
            rightView: FlowRouter.getQueryParam('rightView') || (this.props.currentProject.template == Ols.Project.PROJECT_TEMPLATE_BASIC? 'ACTIONS':'PROJECT_SUMMARY')
        };
    },

    render() {
        if(this.props.currentProject.type == Ols.Project.PROJECT_TYPE_CONVERSATION) {
            return (
                <div className="right-sidebar-container">
                    <div className="dropdown">
                        <button className="btn btn-default dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                            Members <span className="caret"></span>
                        </button>
                        <ul className="dropdown-menu" aria-labelledby="dropdownMenu1">
                            <li className="dropdown-header">Only Member View is available for conversations</li>
                        </ul>
                    </div>
                    {this.renderMembersComponent()}
                </div>
                );
        } else {
            if(this.isBasicProject()) {
                return (
                    <div className="right-sidebar-container">
                        <div className="dropdown">
                            <button className="btn btn-default dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                                {this.renderSelectedComponentLabel()} <span className="caret"></span>
                            </button>
                            <ul className="dropdown-menu" aria-labelledby="dropdownMenu1">
                                <li><a onClick={this.onActionsClicked} href="">Open Tasks</a></li>
                                <li><a onClick={this.onArchivedClicked} href="">Archived Task</a></li>
                                <li role="separator" className="divider"></li>
                                <li><a onClick={this.onMyItemsClicked} href="">My Tasks</a></li>
                                <li><a onClick={this.onItemsInProgressClicked} href="">Tasks In Progress</a></li>
                                <li><a onClick={this.onBlockedItemsClicked} href="">Blocked Tasks</a></li>
                                <li><a onClick={this.onClosedItemsClicked} href="">Closed Tasks</a></li>
                                <li role="separator" className="divider"></li>
                                <li><a onClick={this.onMembersClicked} href="">Members</a></li>
                            </ul>
                        </div>
                        {this.renderSelectedComponent()}
                    </div>
                );
            } else {
                return (
                    <div className="right-sidebar-container">
                        <div className="dropdown">
                            <button className="btn btn-default dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                                {this.renderSelectedComponentLabel()} <span className="caret"></span>
                            </button>
                            <ul className="dropdown-menu" aria-labelledby="dropdownMenu1">
                                <li><a onClick={this.onProjectSummaryClicked} href="">Project Summary</a></li>
                                <li role="separator" className="divider"></li>
                                <li><a onClick={this.onDiscussionsClicked} href="">Discussions</a></li>
                                <li><a onClick={this.onActionsClicked} href="">Tasks</a></li>
                                <li><a onClick={this.onIssuesClicked} href="">Bugs</a></li>
                                <li><a onClick={this.onQuestionsClicked} href="">Questions</a></li>
                                <li role="separator" className="divider"></li>
                                <li><a onClick={this.onReleasesClicked} href="">Releases</a></li>
                                <li><a onClick={this.onMilestonesClicked} href="">Milestones</a></li>
                                <li><a onClick={this.onBacklogClicked} href="">Backlog</a></li>
                                <li role="separator" className="divider"></li>
                                <li><a onClick={this.onWorkItemsClicked} href="">Work Items</a></li>
                                <li><a onClick={this.onAllItemsClicked} href="">All Items</a></li>
                                <li><a onClick={this.onMembersClicked} href="">Members</a></li>
                                <li><a onClick={this.onArchivedClicked} href="">Archived</a></li>
                                <li role="separator" className="divider"></li>
                                <li><a onClick={this.onMyItemsClicked} href="">Items Assigned to Me</a></li>
                                <li><a onClick={this.onItemsInProgressClicked} href="">Items In Progress</a></li>
                                <li><a onClick={this.onBlockedItemsClicked} href="">Blocked Items</a></li>
                                <li><a onClick={this.onItemsInTestClicked} href="">Items In Test</a></li>
                                <li><a onClick={this.onClosedItemsClicked} href="">Closed Items</a></li>
                            </ul>
                        </div>
                        {this.renderSelectedComponent()}
                    </div>
                );
            }
        }
    },

    onProjectSummaryClicked() {
        FlowRouter.go('projectPageLatest', {projectId: this.props.projectId}, {'rightView': 'PROJECT_SUMMARY'});
    },

    onReleasesClicked() {
        FlowRouter.go('projectPageLatest', {projectId: this.props.projectId}, {'rightView': 'RELEASES'});
    },

    onMilestonesClicked() {
        FlowRouter.go('projectPageLatest', {projectId: this.props.projectId}, {'rightView': 'MILESTONES'});
    },

    onMembersClicked() {
        FlowRouter.go('projectPageLatest', {projectId: this.props.projectId}, {'rightView': 'MEMBERS'});
    },

    onDiscussionsClicked() {
        FlowRouter.go('projectPageLatest', {projectId: this.props.projectId}, {'rightView': 'DISCUSSIONS'});
    },

    onActionsClicked() {
        FlowRouter.go('projectPageLatest', {projectId: this.props.projectId}, {'rightView': 'ACTIONS'});
    },

    onIssuesClicked() {
        FlowRouter.go('projectPageLatest', {projectId: this.props.projectId}, {'rightView': 'ISSUES'});
    },

    onQuestionsClicked() {
        FlowRouter.go('projectPageLatest', {projectId: this.props.projectId}, {'rightView': 'QUESTIONS'});
    },

    onBacklogClicked() {
        FlowRouter.go('projectPageLatest', {projectId: this.props.projectId}, {'rightView': 'BACKLOG'});
    },

    onArchivedClicked() {
        FlowRouter.go('projectPageLatest', {projectId: this.props.projectId}, {'rightView': 'ARCHIVED'});
    },

    onMyItemsClicked() {
        FlowRouter.go('projectPageLatest', {projectId: this.props.projectId}, {'rightView': 'MY_ITEMS'});
    },

    onWorkItemsClicked() {
        FlowRouter.go('projectPageLatest', {projectId: this.props.projectId}, {'rightView': 'WORK_ITEMS'});
    },

    onAllItemsClicked() {
        FlowRouter.go('projectPageLatest', {projectId: this.props.projectId}, {'rightView': 'ALL_ITEMS'});
    },

    onItemsInProgressClicked() {
        FlowRouter.go('projectPageLatest', {projectId: this.props.projectId}, {'rightView': 'ITEMS_IN_PROGRESS'});
    },

    onBlockedItemsClicked() {
        FlowRouter.go('projectPageLatest', {projectId: this.props.projectId}, {'rightView': 'BLOCKED_ITEMS'});
    },

    onItemsInTestClicked() {
        FlowRouter.go('projectPageLatest', {projectId: this.props.projectId}, {'rightView': 'ITEMS_IN_TEST'});
    },

    onClosedItemsClicked() {
        FlowRouter.go('projectPageLatest', {projectId: this.props.projectId}, {'rightView': 'CLOSED_ITEMS'});
    },

    renderMembersComponent() {
        return <MemberListContainer
            showMembersOnly={this.props.currentProject.type == Ols.Project.PROJECT_TYPE_CONVERSATION}
            projectId={this.props.projectId}
            memberList={this.props.memberList}/>;
    },

    renderSelectedComponent() {
        if(this.isBasicProject()) {
            switch(this.data.rightView) {
                case 'ACTIONS': return <ActionListComponent projectId={this.props.projectId} projectTemplate={this.props.currentProject.template} />;
                case 'ITEM_DETAIL': return <ItemDetailComponent projectId={this.props.projectId} projectTemplate={this.props.currentProject.template} />;
                case 'MEMBERS': return this.renderMembersComponent();
                case 'ARCHIVED': return <ArchivedListComponent projectId={this.props.projectId} projectTemplate={this.props.currentProject.template} />;
                case 'MY_ITEMS': return <MyItemsComponent projectId={this.props.projectId} projectTemplate={this.props.currentProject.template} />;
                case 'ITEMS_IN_PROGRESS': return <InProgressItemsComponent projectId={this.props.projectId} projectTemplate={this.props.currentProject.template} />;
                case 'BLOCKED_ITEMS': return <BlockedItemsComponent projectId={this.props.projectId} projectTemplate={this.props.currentProject.template} />;
                case 'CLOSED_ITEMS': return <ClosedItemsComponent projectId={this.props.projectId} projectTemplate={this.props.currentProject.template} />;
            }
        } else {
            switch(this.data.rightView) {
                case 'PROJECT_SUMMARY': return <ProjectSummaryComponent projectId={this.props.projectId} projectTemplate={this.props.currentProject.template} />;
                case 'MILESTONES': return <MilestoneListComponent projectId={this.props.projectId} projectTemplate={this.props.currentProject.template} />;
                case 'RELEASES': return <ReleaseListComponent projectId={this.props.projectId} projectTemplate={this.props.currentProject.template} />;
                case 'RELEASE_DETAIL': return <ReleaseDetailComponent/>;
                case 'MILESTONE_DETAIL': return <MilestoneDetailComponent projectId={this.props.projectId} projectTemplate={this.props.currentProject.template} />;
                case 'ACTIONS': return <ActionListComponent projectId={this.props.projectId} projectTemplate={this.props.currentProject.template} />;
                case 'DISCUSSIONS': return <DiscussionItemsComponent projectId={this.props.projectId} projectTemplate={this.props.currentProject.template} />;
                case 'ISSUES': return <IssueListComponent projectId={this.props.projectId} projectTemplate={this.props.currentProject.template} />;
                case 'QUESTIONS': return <QuestionListComponent projectId={this.props.projectId} projectTemplate={this.props.currentProject.template} />;
                case 'ITEM_DETAIL': return <ItemDetailComponent projectId={this.props.projectId} projectTemplate={this.props.currentProject.template} />;
                case 'BACKLOG': return <BacklogComponent projectId={this.props.projectId} projectTemplate={this.props.currentProject.template} />;
                case 'MEMBERS': return this.renderMembersComponent();
                case 'ARCHIVED': return <ArchivedListComponent projectId={this.props.projectId} projectTemplate={this.props.currentProject.template} />;
                case 'MY_ITEMS': return <MyItemsComponent projectId={this.props.projectId} projectTemplate={this.props.currentProject.template} />;
                case 'WORK_ITEMS': return <WorkItemsComponent projectId={this.props.projectId} projectTemplate={this.props.currentProject.template} />;
                case 'ALL_ITEMS': return <AllItemsComponent projectId={this.props.projectId} projectTemplate={this.props.currentProject.template} />;
                case 'ITEMS_IN_PROGRESS': return <InProgressItemsComponent projectId={this.props.projectId} projectTemplate={this.props.currentProject.template} />;
                case 'BLOCKED_ITEMS': return <BlockedItemsComponent projectId={this.props.projectId} projectTemplate={this.props.currentProject.template} />;
                case 'ITEMS_IN_TEST': return <InTestItemsComponent projectId={this.props.projectId} projectTemplate={this.props.currentProject.template} />;
                case 'CLOSED_ITEMS': return <ClosedItemsComponent projectId={this.props.projectId} projectTemplate={this.props.currentProject.template} />;
            }
        }
    },

    renderSelectedComponentLabel() {
        switch(this.data.rightView) {
            case 'PROJECT_SUMMARY': return 'Project Summary';
            case 'RELEASES': return 'Releases';
            case 'MILESTONES': return 'Milestones';
            case 'MILESTONE_DETAIL': return 'Milestone Detail';
            case 'RELEASE_DETAIL': return 'Release Detail';
            case 'ITEM_DETAIL': return 'Item Detail';
            case 'ACTIONS': return this.isBasicProject()?'Open Tasks':'Tasks';
            case 'DISCUSSIONS': return 'Discussions';
            case 'ISSUES': return 'Bugs';
            case 'QUESTIONS': return 'Questions';
            case 'BACKLOG': return 'Backlog';
            case 'MEMBERS': return 'Members';
            case 'ARCHIVED': return this.isBasicProject()?'Archived Tasks':'Archived';
            case 'MY_ITEMS': return this.isBasicProject()?'My Tasks':'My Items';
            case 'ALL_ITEMS': return 'All Items';
            case 'WORK_ITEMS': return 'Work Items';
            case 'ITEMS_IN_PROGRESS': return this.isBasicProject()?'Tasks In Progress':'Items In Progress';
            case 'BLOCKED_ITEMS': return this.isBasicProject()?'Blocked Tasks':'Blocked Items';
            case 'ITEMS_IN_TEST': return 'Items In Test';
            case 'CLOSED_ITEMS': return this.isBasicProject()?'Closed Tasks':'Closed Items';
        }
    },

    isBasicProject() {
        return this.props.currentProject.template == Ols.Project.PROJECT_TEMPLATE_BASIC;
    }
});
