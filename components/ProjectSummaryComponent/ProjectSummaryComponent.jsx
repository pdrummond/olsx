ProjectSummaryComponent = React.createClass({
    mixins: [ReactMeteorData],

    propTypes: {
        projectId: React.PropTypes.string,
    },

    getMeteorData: function() {
        var data = {};
        var currentProjectHandle = Meteor.subscribe('currentProject', this.props.projectId);
        var projectActionCountsHandle = Meteor.subscribe("projectActionCounts", this.props.projectId);
        if(currentProjectHandle.ready() && projectActionCountsHandle.ready()) {
            var counts = ProjectActionCounts.findOne(this.props.projectId);
            if(counts != null) {
                data.totalCount = counts.totalCount;
                data.openCount = counts.openCount;
                data.doneCount = counts.doneCount;
            }
            data.currentProject = Projects.findOne(this.props.projectId);
        }
        return data;
    },

    render() {
        if(this.data.currentProject == null) {
            return (
                <i style={{marginTop: '50px', textAlign: 'center', width: '400px'}} className="fa fa-2x fa-spin fa-spinner"></i>
            );
        } else {
            return (
                <div id="project-summary-component" style={{marginTop:'20px'}}>
                    <div className="panel panel-default">
                        <div className="panel-heading">
                            <div className="panel-title">
                                <i className="fa fa-bullseye"></i> {this.data.currentProject.title}
                                <span style={{position:'relative', top:'0', right:'0'}} className="label label-success pull-right">Open</span>
                            </div>
                        </div>
                        <div className="panel-body">
                            <h2 style={{color:'gray',fontSize:'20px',marginBottom:'10px',fontWeight:'100'}}>{this.getProjectPercentage()} complete</h2>
                            <div className="progress">
                                <div className="progress-bar progress-bar-success progress-bar-striped"
                                     style={{width: this.getProjectPercentage()}}
                                     role="progressbar"/>
                            </div>
                            <span>open: <b>{this.data.openCount}</b> closed: <b>{this.data.doneCount}</b> total: <b>{this.data.totalCount}</b> </span>
                        </div>
                    </div>
                    <div className="panel panel-default">
                        <div className="panel-heading"><div className="panel-title">Release Information</div></div>
                        <div className="panel-body">
                            <div className="alert alert-success"><i className="fa fa-paper-plane"></i> Current Release: <a href=""><strong>Release 1.1</strong></a></div>
                            <div className="alert alert-info"><i className="fa fa-paper-plane"></i> Next Release: <a href=""><strong>Release 1.2</strong></a></div>
                        </div>
                    </div>
                    <div className="panel panel-default">
                        <div className="panel-heading"><div className="panel-title">Project Statistics</div></div>
                        <div className="panel-body">
                            <div className="alert alert-warning"><i className="fa fa-exclamation-circle"></i> This information will be displayed as a nice fancy pie chart eventually!</div>
                            <table className="table table-striped" style={{border:'1px solid lightgray'}}>
                                <thead>
                                <tr><th>Type</th><th>Open</th> <th>Closed</th></tr>
                                </thead>
                                <tbody>
                                <tr><td>Tasks: </td> <td>10</td><td>20</td></tr>
                                <tr><td>Bugs: </td> <td>300</td><td>20</td></tr>
                                <tr><td>Features: </td> <td>3</td><td>30</td></tr>
                                <tr><td>Enhancements: </td> <td>2</td><td>40</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            );
        }
    },

    getProjectPercentage() {
        var p = (this.data.doneCount / this.data.totalCount) * 100;
        return parseInt(p).toFixed(0) + '%';
    },
});