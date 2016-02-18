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
        event.preventDefault();
        var title = ReactDOM.findDOMNode(this.refs.textInput).value.trim();

        Projects.methods.addProject.call({title}, (err) => {
            if(err) {
                toastr.error('Oops! Something went wrong creating project - please try again.');
                console.error('Error creating project: ' + err);
            }
        });
        ReactDOM.findDOMNode(this.refs.textInput).value = "";
    }
});