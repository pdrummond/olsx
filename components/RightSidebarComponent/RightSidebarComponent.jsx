RightSidebarComponent = React.createClass({
    mixins: [ReactMeteorData],

    getMeteorData() {
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
                      <li><a onClick={this.onMilestonesClicked} href="">Milestones</a></li>
                      <li><a onClick={this.onActionsClicked} href="">Actions</a></li>
                      <li><a onClick={this.onIssuesClicked} href="">Issues</a></li>
                      <li role="separator" className="divider"></li>
                      <li><a onClick={this.onMembersClicked} href="">Members</a></li>
                      <li><a onClick={this.onArchivedClicked} href="">Archived</a></li>
                  </ul>
              </div>
              {this.renderSelectedComponent()}

          </div>
      )
    },

    onProjectSummaryClicked() {
        FlowRouter.setQueryParams({'rightView': 'PROJECT_SUMMARY'});
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

    onArchivedClicked() {
        FlowRouter.setQueryParams({'rightView': 'ARCHIVED'});
    },

    renderSelectedComponent() {
        switch(this.data.rightView) {
            case 'PROJECT_SUMMARY': return <ProjectSummaryComponent projectId={this.props.projectId} />
            case 'MILESTONES': return <MilestoneListComponent projectId={this.props.projectId} />
            case 'MILESTONE_DETAIL': return <MilestoneDetailComponent/>
            case 'ACTIONS': return <ActionListComponent projectId={this.props.projectId} />;
            case 'ISSUES': return <IssueListComponent projectId={this.props.projectId} />;
            case 'MEMBERS': return <MemberListContainer projectId={this.props.projectId} memberList={this.props.memberList}/>
            case 'ARCHIVED': return <ArchivedListComponent projectId={this.props.projectId} />
        }
    },

    renderSelectedComponentLabel() {
      switch(this.data.rightView) {
          case 'PROJECT_SUMMARY': return 'Project Summary';
          case 'MILESTONES': return 'Milestones';
          case 'MILESTONE_DETAIL': return 'Milestone Detail';
          case 'ACTIONS': return 'Actions';
          case 'ISSUES': return 'Issues';
          case 'MEMBERS': return 'Members';
          case 'ARCHIVED': return 'Archived';
      }
    }

});