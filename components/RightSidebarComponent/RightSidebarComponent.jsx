RightSidebarComponent = React.createClass({

    getInitialState() {
        return {
            selectedComponent: 'TASKS'
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
                      <li><a onClick={this.onMembersClicked} href="">Members</a></li>
                      <li><a onClick={this.onTasksClicked} href="">Tasks</a></li>
                      <li><a href="">Epics</a></li>
                      <li><a href="">Sprints</a></li>
                      <li role="separator" className="divider"></li>
                      <li><a href="">My Tasks</a></li>
                  </ul>
              </div>
              {this.renderSelectedComponent()}

          </div>
      )
    },

    onMembersClicked() {
        this.setState({'selectedComponent': 'MEMBERS'});
    },

    onTasksClicked() {
        this.setState({'selectedComponent': 'TASKS'});
    },

    renderSelectedComponent() {
        if(this.state.selectedComponent == 'TASKS') {
            return <TaskListComponent conversationId={this.props.conversationId} />;
        } else {
            return <MemberListContainer conversationId={this.props.conversationId} memberList={this.props.memberList}/>
        }
    },

    renderSelectedComponentLabel() {
      if(this.state.selectedComponent == 'TASKS') {
          return 'Tasks';
      }  else {
          return 'Members';
      }
    }

});