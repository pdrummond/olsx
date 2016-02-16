RightSidebarComponent = React.createClass({

    getInitialState() {
        return {
            selectedComponent: 'TASKS'
        }
    },

    render() {
      return (
          <div className="right-sidebar-container">
              <a href="" onClick={this.onSwitchComponentLinkClicked}>{this.renderSelectedComponentLabel()}</a>
              {this.renderSelectedComponent()}

          </div>
      )
    },

    renderSelectedComponent() {
        if(this.state.selectedComponent == 'TASKS') {
            return <TaskListComponent/>;
        } else {
            return <MemberListContainer conversationId={this.props.conversationId} memberList={this.props.memberList}/>
        }
    },

    renderSelectedComponentLabel() {
      if(this.state.selectedComponent == 'TASKS') {
          return 'Show Members';
      }  else {
          return 'Show Tasks';
      }
    },

    onSwitchComponentLinkClicked() {
        this.setState({'selectedComponent': (this.state.selectedComponent == 'TASKS' ? 'MEMBERS' : 'TASKS')});
    }

});