MilestoneDetailComponent = React.createClass({
    mixins: [ReactMeteorData],

    propTypes: {
        milestoneId: React.PropTypes.string
    },

    getMeteorData() {
        var data = {};
        data.currentMilestone = null;
        data.milestoneId = FlowRouter.getQueryParam('milestoneId');
        var currentMilestoneHandle = Meteor.subscribe('currentMilestone', data.milestoneId);
        if(currentMilestoneHandle.ready()) {
            data.currentMilestone = Milestones.findOne(data.milestoneId);
        }
        return data;
    },

    render() {
        if(this.data.currentMilestone == null) {
            return (
                <div id="milestone-detail-component">
                    <i style={{marginTop: '50px', textAlign: 'center', width: '400px'}}
                       className="fa fa-2x fa-spin fa-spinner"/>
                </div>
            );
        } else {
            return (
                <div id="milestone-detail-component">
                    <Milestone milestone={this.data.currentMilestone} showDetailLink={false} />
                    <div className="panel panel-default">
                        <div className="panel-heading"><div className="panel-title">Milestone Items</div></div>
                        <div className="panel-body">
                            <ItemListComponent projectId={this.data.currentMilestone.projectId} filter={{milestoneId: this.data.milestoneId}}/>
                        </div>
                    </div>

                </div>
            );
        }
    }
});
