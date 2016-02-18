ProjectList = React.createClass({

    propTypes: {
        currentProjectId: React.PropTypes.string,
        projectList: React.PropTypes.array,
        incomingMessages: React.PropTypes.array,

        onProjectClicked: React.PropTypes.func
    },

    renderProjects() {
        return this.props.projectList.map((project) => {
            return (
                <Project
                    numNewMessages={this.numNewMessages(project._id)}
                    isSeen={this.isSeen(project)}
                    isActive={project._id == this.props.currentProjectId}
                    onClick={this.props.onProjectClicked} key={project._id} project={project}/>
            );
        });
    },

    numNewMessages: function(projectId) {
        var count = 0;
        _.each(this.props.incomingMessages, function(msg) {
           if(msg.projectId == projectId) {
               count++;
           }
        });
        return count;
    },

    isSeen: function(project) {
        return project.seenList && project.seenList.indexOf(Meteor.userId()) != -1;
    },

    render() {
       return (
           <ul className="project-list">
               {this.renderProjects()}
           </ul>
       )
    }
});