ItemDetailComponent = React.createClass({
    mixins: [ReactMeteorData],

    propTypes: {
        projectId: React.PropTypes.string.isRequired,
    },

    getMeteorData() {
        var data = {};
        data.currentItem = null;
        data.itemId = FlowRouter.getQueryParam('itemId');
        var currentItemHandle = Meteor.subscribe('currentItem', data.itemId);
        var milestonesHandle = Meteor.subscribe('milestones', this.props.projectId);
        var refsHandle = Meteor.subscribe('refs', this.props.projectId);
        if(currentItemHandle.ready() && milestonesHandle.ready() && refsHandle.ready()) {
            data.currentItem = Items.findOne(data.itemId);
            data.milestoneList = Milestones.find({}, {sort: {createdAt: 1}}).fetch();
        }
        return data;
    },

    render() {
        if(this.data.currentItem == null) {
            return (
                <div id="item-detail-component">
                    <LoadingSpinner/>
                </div>
            );
        } else {
            return (
                <div id="item-detail-component">
                    <Item item={this.data.currentItem} detailMode={true} milestoneList={this.data.milestoneList} />
                </div>
            );
        }
    }
});
