RefList = React.createClass({
    renderRefs() {
        if(this.props.refList && this.props.refList.length > 0) {
            return this.props.refList.map((ref) => {
                console.log("RefList ref="+ JSON.stringify(ref));
                return <Ref key={ref._id} refItem={ref}/>;
            });
        } else {
            return <i>No References for this task</i>;
        }
    },

    render() {
        return (
            <ul className="ref-list">
                {this.renderRefs()}
            </ul>
        )
    }
});
