ReleaseList = React.createClass({
    renderReleases() {
        if(this.props.releaseList) {
            return this.props.releaseList.map((release) => {
                return <Release key={release._id}
                                release={release}
                                showDetailLink={true}
                                currentReleaseId={this.props.currentReleaseId}
                                nextReleaseId={this.props.nextReleaseId} />;
            });
        } else {
            return <p style={{textAlign: 'center', color: 'lightgray'}}>
                <i className="fa fa-spin fa-2x fa-spinner"></i>
            </p>;
        }
    },

    render() {
        return (
            <ul className="release-list">
                {this.renderReleases()}
            </ul>
        )
    }
});
