RightSidebarComponent = React.createClass({
    mixins: [ReactMeteorData],

    propTypes: {
        projectId: React.PropTypes.string.isRequired,
    },

    getMeteorData() {
        console.log("RightSidebarComponent.projectId: " + this.props.projectId);
        return {
            rightView: FlowRouter.getQueryParam('rightView') || 'PROJECT_SUMMARY'
        };
    },

    render() {
        return (
            <div className="right-sidebar-container">
                <div className="dropdown">
                    <button className="btn btn-default dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                        {this.renderSelectedComponentLabel()} <span className="caret"></span>
                    </button>
                    <ul className="dropdown-menu" aria-labelledby="dropdownMenu1">
                        <li><a onClick={this.onProjectSummaryClicked} href="">Project Summary</a></li>
                        <li><a onClick={this.onReleasesClicked} href="">Releases</a></li>
                        <li><a onClick={this.onMilestonesClicked} href="">Milestones</a></li>
                        <li><a onClick={this.onActionsClicked} href="">Actions</a></li>
                        <li><a onClick={this.onIssuesClicked} href="">Issues</a></li>
                        <li role="separator" className="divider"></li>
                        <li><a onClick={this.onBacklogClicked} href="">Backlog</a></li>
                        <li><a onClick={this.onMembersClicked} href="">Members</a></li>
                        <li><a onClick={this.onArchivedClicked} href="">Archived</a></li>
                        <li role="separator" className="divider"></li>
                        <li><a onClick={this.onNewItemsClicked} href="">New Items</a></li>
                        <li><a onClick={this.onItemsInProgressClicked} href="">Items In Progress</a></li>
                        <li><a onClick={this.onBlockedItemsClicked} href="">Blocked Items</a></li>
                        <li><a onClick={this.onItemsInTestClicked} href="">Items In Test</a></li>
                        <li><a onClick={this.onClosedItemsClicked} href="">Closed Items</a></li>
                    </ul>
                </div>
                {this.renderSelectedComponent()}

            </div>
        )
    },

    onProjectSummaryClicked() {
        FlowRouter.setQueryParams({'rightView': 'PROJECT_SUMMARY'});
    },

    onReleasesClicked() {
        FlowRouter.setQueryParams({'rightView': 'RELEASES'});
    },

    onMilestonesClicked() {
        FlowRouter.setQueryParams({'rightView': 'MILESTONES'});
    },

    onMembersClicked() {
        FlowRouter.setQueryParams({'rightView': 'MEMBERS'});
    },

    onActionsClicked() {
        FlowRouter.setQueryParams({'rightView': 'ACTIONS'});
    },

    onIssuesClicked() {
        FlowRouter.setQueryParams({'rightView': 'ISSUES'});
    },

    onBacklogClicked() {
        FlowRouter.setQueryParams({'rightView': 'BACKLOG'});
    },

    onArchivedClicked() {
        FlowRouter.setQueryParams({'rightView': 'ARCHIVED'});
    },

    onNewItemsClicked() {
        FlowRouter.setQueryParams({'rightView': 'NEW_ITEMS'});
    },

    onItemsInProgressClicked() {
        FlowRouter.setQueryParams({'rightView': 'ITEMS_IN_PROGRESS'});
    },

    onBlockedItemsClicked() {
        FlowRouter.setQueryParams({'rightView': 'BLOCKED_ITEMS'});
    },

    onItemsInTestClicked() {
        FlowRouter.setQueryParams({'rightView': 'ITEMS_IN_TEST'});
    },

    onClosedItemsClicked() {
        FlowRouter.setQueryParams({'rightView': 'CLOSED_ITEMS'});
    },

    renderSelectedComponent() {
        switch(this.data.rightView) {
            case 'PROJECT_SUMMARY': return <ProjectSummaryComponent projectId={this.props.projectId} />;
            case 'MILESTONES': return <MilestoneListComponent projectId={this.props.projectId} />;
            case 'RELEASES': return <ReleaseListComponent projectId={this.props.projectId} />;
            case 'RELEASE_DETAIL': return <ReleaseDetailComponent/>;
            case 'MILESTONE_DETAIL': return <MilestoneDetailComponent/>;
            case 'ACTIONS': return <ActionListComponent projectId={this.props.projectId} />;
            case 'ISSUES': return <IssueListComponent projectId={this.props.projectId} />;
            case 'BACKLOG': return <BacklogComponent projectId={this.props.projectId} />;
            case 'MEMBERS': return <MemberListContainer projectId={this.props.projectId} memberList={this.props.memberList}/>;
            case 'ARCHIVED': return <ArchivedListComponent projectId={this.props.projectId} />;
            case 'NEW_ITEMS': return <NewItemsComponent projectId={this.props.projectId} />;
            case 'ITEMS_IN_PROGRESS': return <InProgressItemsComponent projectId={this.props.projectId} />;
            case 'BLOCKED_ITEMS': return <BlockedItemsComponent projectId={this.props.projectId} />;
            case 'ITEMS_IN_TEST': return <InTestItemsComponent projectId={this.props.projectId} />;
            case 'CLOSED_ITEMS': return <ClosedItemsComponent projectId={this.props.projectId} />;
        }
    },

    renderSelectedComponentLabel() {
        switch(this.data.rightView) {
            case 'PROJECT_SUMMARY': return 'Project Summary';
            case 'RELEASES': return 'Releases';
            case 'MILESTONES': return 'Milestones';
            case 'MILESTONE_DETAIL': return 'Milestone Detail';
            case 'RELEASE_DETAIL': return 'Release Detail';
            case 'ACTIONS': return 'Actions';
            case 'ISSUES': return 'Issues';
            case 'BACKLOG': return 'Backlog';
            case 'MEMBERS': return 'Members';
            case 'ARCHIVED': return 'Archived';
            case 'NEW_ITEMS': return 'New Items';
            case 'ITEMS_IN_PROGRESS': return 'Items In Progress';
            case 'BLOCKED_ITEMS': return 'Blocked Items';
            case 'ITEMS_IN_TEST': return 'Items In Test';
            case 'CLOSED_ITEMS': return 'Closed Items';
        }
    }

});