NotFoundPage = React.createClass({
    render() {
        return (
            <div className="container">
                <ProjectListContainer />
                <div className="empty-project-list">
                    <p><b>Oh Four Oh Four - Nothing to see here!</b></p>
                    <div><i className="fa fa-frown-o" style={{'fontSize':'20em'}}></i></div>
                    <p>Don't worry, just click on a project to your left to get back to normality <i className="fa fa-smile-o"></i></p>
                </div>
            </div>
            );
    },

});