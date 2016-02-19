RightSidebarComponent = React.createClass({

    getInitialState() {
        return {
            selectedComponent: 'MILESTONES'
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
                      <li><a href="">Project Summary</a></li>
                      <li><a onClick={this.onMilestonesClicked} href="">Milestones</a></li>
                      <li><a onClick={this.onTasksClicked} href="">Tasks</a></li>
                      <li><a onClick={this.onMembersClicked} href="">Members</a></li>
                      <li role="separator" className="divider"></li>
                      <li><a href="">Filter View</a></li>
                      <li><a href="">Detail View</a></li>
                      <li><a href="">Features</a></li>

                      <li><a href="">Sprints</a></li>
                      <li role="separator" className="divider"></li>
                      <li><a href="">My Tasks</a></li>
                      <li role="separator" className="divider"></li>
                      <li><a onClick={this.onArchivedClicked} href="">Archived</a></li>
                  </ul>
              </div>
              {this.renderSelectedComponent()}

          </div>
      )
    },

    onMilestonesClicked() {
        this.setState({'selectedComponent': 'MILESTONES'});
    },

    onMembersClicked() {
        this.setState({'selectedComponent': 'MEMBERS'});
    },

    onTasksClicked() {
        this.setState({'selectedComponent': 'TASKS'});
    },

    onArchivedClicked() {
        this.setState({'selectedComponent': 'ARCHIVED'});
    },

    renderSelectedComponent() {
        switch(this.state.selectedComponent) {
            case 'MILESTONES': return <MilestoneListComponent projectId={this.props.projectId} />
            case 'TASKS': return <TaskListComponent projectId={this.props.projectId} />;
            case 'MEMBERS': return <MemberListContainer projectId={this.props.projectId} memberList={this.props.memberList}/>
            case 'ARCHIVED': return <ArchivedListComponent projectId={this.props.projectId} />
        }
    },

    renderSelectedComponentLabel() {
      switch(this.state.selectedComponent) {
          case 'MILESTONES': return 'Milestones';
          case 'TASKS': return 'Tasks';
          case 'MEMBERS': return 'Members';
          case 'ARCHIVED': return 'Archived';
      }
    }

});