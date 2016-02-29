ItemList = React.createClass({
    renderItems() {
        if(this.props.itemList) {
            return this.props.itemList.map((item) => {
                return <Item projectTemplate={this.props.projectTemplate} milestoneList={this.props.milestoneList} key={item._id} item={item}/>;
            });
        } else {
            return <p style={{textAlign: 'center', color: 'lightgray'}}>
                <i className="fa fa-spin fa-2x fa-spinner"></i>
            </p>;
        }
    },

    render() {
        return (
            <ul className="item-list">
                {this.renderItems()}
            </ul>
        )

    }
});
