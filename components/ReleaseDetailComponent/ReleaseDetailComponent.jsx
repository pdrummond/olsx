ReleaseDetailComponent = React.createClass({
    mixins: [ReactMeteorData],

    propTypes: {
        releaseId: React.PropTypes.string
    },

    getMeteorData() {
        var data = {};
        data.currentRelease = null;
        data.releaseId = FlowRouter.getQueryParam('releaseId');
        var currentReleaseHandle = Meteor.subscribe('currentRelease', data.releaseId);
        if(currentReleaseHandle.ready()) {
            data.currentRelease = Releases.findOne(data.releaseId);
        }
        return data;
    },

    render() {
        if(this.data.currentRelease == null) {
            return (
                <div id="release-detail-component">
                    <i style={{marginTop: '50px', textAlign: 'center', width: '400px'}}
                       className="fa fa-2x fa-spin fa-spinner"/>
                </div>
            );
        } else {
            return (
                <div id="release-detail-component">
                    <Release release={this.data.currentRelease} showDetailLink={false} />
                    <div className="panel panel-default">
                        <div className="panel-heading"><div className="panel-title">Milestones</div></div>
                        <div className="panel-body">
                            <MilestoneListComponent projectId={this.data.currentRelease.projectId} filter={{releaseId: this.data.releaseId}}/>
                        </div>
                    </div>

                </div>
            );
        }
    }
});
