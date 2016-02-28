ProjectListContainer = React.createClass({
    mixins: [ReactMeteorData],

    propTypes: {
        projectList: React.PropTypes.array,
        incomingMessages: React.PropTypes.array,

        onProjectClicked: React.PropTypes.func
    },

   getMeteorData() {
        return {
            currentProjectId: FlowRouter.getParam('projectId'),
        }
    },

    render() {
        return (
            <div className="project-list-container">
                <form className="new-project" onSubmit={this.handleSubmit} >
                    <input className="project-input"
                           type="text"
                           ref="textInput"
                           placeholder="Type here to filter list/create new project" />
                </form>
                <ProjectList
                    currentProjectId={this.data.currentProjectId}
                    projectList={this.props.projectList}
                    onProjectClicked={this.props.onProjectClicked}
                    incomingMessages={this.props.incomingMessages} />
            </div>
        )
    },

    handleSubmit(event) {
        var self = this;
        event.preventDefault();

        var title = ReactDOM.findDOMNode(this.refs.textInput).value.trim();
        if(title != null) {
            title = title.trim();
            if (title.length > 0) {
                bootbox.prompt({
                    title: "What is the unique key for this project?",
                    value: title.substring(0, 3).toUpperCase(),
                    callback: function (key) {
                        if(key != null) {
                            key = key.trim();
                            if (key.length > 0) {
                                Projects.methods.addProject.call({title, key}, (err) => {
                                    if (err) {
                                        toastr.error('Error creating project: ' + err.reason);
                                        console.error('Error creating project: ' + err);
                                    }
                                });
                            }
                        }
                        ReactDOM.findDOMNode(self.refs.textInput).value = "";
                    }
                });
            }
        }
    }
});