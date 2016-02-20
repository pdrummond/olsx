RightSidebarComponent = React.createClass({

    getInitialState() {
        return {
            selectedComponent: 'PROJECT_SUMMARY'
        }
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
                      <li><a onClick={this.onActionsClicked} href="">Actions</a></li>
                      <li><a onClick={this.onMilestonesClicked} href="">Milestones</a></li>
                      <li><a onClick={this.onMembersClicked} href="">Members</a></li>
                      <li role="separator" className="divider"></li>
                      <li><a onClick={this.onArchivedClicked} href="">Archived</a></li>
                  </ul>
              </div>
              {this.renderSelectedComponent()}

          </div>
      )
    },

    onProjectSummaryClicked() {
        this.setState({'selectedComponent': 'PROJECT_SUMMARY'});
    },

    onMilestonesClicked() {
        this.setState({'selectedComponent': 'MILESTONES'});
    },

    onMembersClicked() {
        this.setState({'selectedComponent': 'MEMBERS'});
    },

    onActionsClicked() {
        this.setState({'selectedComponent': 'ACTIONS'});
    },

    onArchivedClicked() {
        this.setState({'selectedComponent': 'ARCHIVED'});
    },

    renderSelectedComponent() {
        switch(this.state.selectedComponent) {
            case 'PROJECT_SUMMARY': return <ProjectSummaryComponent projectId={this.props.projectId} />
            case 'MILESTONES': return <MilestoneListComponent projectId={this.props.projectId} />
            case 'ACTIONS': return <ItemListComponent projectId={this.props.projectId} />;
            case 'MEMBERS': return <MemberListContainer projectId={this.props.projectId} memberList={this.props.memberList}/>
            case 'ARCHIVED': return <ArchivedListComponent projectId={this.props.projectId} />
        }
    },

    renderSelectedComponentLabel() {
      switch(this.state.selectedComponent) {
          case 'PROJECT_SUMMARY': return 'Project Summary';
          case 'MILESTONES': return 'Milestones';
          case 'ACTIONS': return 'Actions';
          case 'MEMBERS': return 'Members';
          case 'ARCHIVED': return 'Archived';
      }
    }

});