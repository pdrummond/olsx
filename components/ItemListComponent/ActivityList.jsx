ActivityList = React.createClass({
    renderActivityMessages() {
        if(this.props.activityList && this.props.activityList.length > 0) {
            return this.props.activityList.map((activityItem) => {
                return <ActivityItem key={activityItem._id} activityItem={activityItem}/>;
            });
        } else {
            return <i>No activity for this item</i>;
        }
    },

    render() {
        return (
            <ul className="activity-list">
                {this.renderActivityMessages()}
            </ul>
        )
    }
});
