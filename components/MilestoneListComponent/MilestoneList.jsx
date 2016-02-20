MilestoneList = React.createClass({
    renderMilestones() {
        if(this.props.milestoneList) {
            return this.props.milestoneList.map((milestone) => {
                return <Milestone key={milestone._id} milestone={milestone} showDetailLink={true} releaseList={this.props.releaseList}/>;
            });
        } else {
            return <p style={{textAlign: 'center', color: 'lightgray'}}>
                <i className="fa fa-spin fa-2x fa-spinner"></i>
            </p>;
        }
    },

    render() {
        return (
            <ul className="milestone-list">
                {this.renderMilestones()}
            </ul>
        )
    }
});
