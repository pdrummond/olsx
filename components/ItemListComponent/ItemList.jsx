ItemList = React.createClass({
    renderItems() {
        if(this.props.itemList) {
            return this.props.itemList.map((item) => {
                return <Item milestoneList={this.props.milestoneList} key={item._id} item={item}/>;
            });
        } else {
            return <p style={{textAlign: 'center', color: 'lightgray'}}>
                <i className="fa fa-spin fa-2x fa-spinner"></i>
            </p>;
        }
    },

    render() {

            if(this.props.itemList.length == 0) {
                return (
                    <ul className="item-list">
                        <li><i style={{color:'gray'}}>No existing items found - press ENTER to create</i></li>
                    </ul>
                );
            } else {
                return (
                    <ul className="item-list">
                    {this.renderItems()}
                </ul>
                )
            }
    }
});
