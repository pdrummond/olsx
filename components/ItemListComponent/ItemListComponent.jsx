ItemListComponent = React.createClass({
    mixins: [ReactMeteorData],

    propTypes: {
        projectId: React.PropTypes.string
    },

    getInitialState() {
        return {
            filterInput: ''
        }
    },

    getMeteorData() {
        var data = {};
        data.itemList = [];
        data.milestoneList = [];
        data.milestoneIdParam = FlowRouter.getQueryParam('milestoneId');
        var itemsHandle = Meteor.subscribe('items', this.props.projectId);
        var refsHandle = Meteor.subscribe('refs', this.props.projectId);
        var milestonesHandle = Meteor.subscribe('milestones', this.props.projectId);
        if(itemsHandle.ready() && refsHandle.ready() && milestonesHandle.ready()) {
            var inputFilter = Ols.Filter.parseString(this.state.filterInput);
            var filter = this.props.filter ? _.extend(inputFilter, this.props.filter) : _.extend(inputFilter, {isArchived:false});
            data.itemList = Items.find(filter, {sort: {priority: -1}}).fetch();

            data.milestoneList = Milestones.find({}, {sort: {createdAt: 1}}).fetch();

            data.authInProcess = Meteor.loggingIn();
        }
        return data;
    },

    render() {
        return (
            <div className="item-list-component">
                <form className="filter-item" onSubmit={this.handleSubmit}>
                    <input className="filter-item-input"
                           type="text"
                           ref="filterInput"
                           placeholder="Type here to create item/filter list"
                           onKeyUp={this.onKeyUp} />
                </form>
                {this.renderItemList()}
            </div>
        )
    },

    renderItemList() {
        if(this.data.itemList.length == 0) {
            if(this.state.filterInput.length > 0) {
                return <p style={{marginTop:'10px'}}><i>Nothing found - press ENTER to create</i></p>
            } else {
                return <p style={{marginTop:'10px'}}><i>No Results</i></p>
            }
        } else {
            return <ItemList
                milestoneList={this.data.milestoneList}
                itemList={this.data.itemList}/>
        }
    },

    onKeyUp: function() {
        var self = this;
        if(this.filterInputKeyTimer) {
            console.log("CANCELLED FILTER KEY TIMER");
            clearTimeout(this.filterInputKeyTimer);
        }
        this.filterInputKeyTimer = setTimeout(function() {
            self.setState({'filterInput': self.refs.filterInput.value});
        }, 500);
    },

    handleSubmit(e) {
        e.preventDefault();
        clearTimeout(this.filterInputKeyTimer);
        var description = this.refs.filterInput.value;
        this.setState({'filterInput': description});
        if (description) {
            this.addItem(description);
        }
    },

    addItem(description) {
        var self = this;
        Items.methods.addItem.call({
            description: description,
            projectId: this.props.projectId,
            type: Ols.Item.ITEM_TYPE_ACTION,
            subType:Ols.Item.ACTION_SUBTYPE_TASK,
            milestoneId: this.data.milestoneIdParam
        }, (err, item) => {
            if (err) {
                if (err.reason) {
                    toastr.error("Error adding item: " + err.reason);
                } else {
                    console.error("Error adding item: " + JSON.stringify(err));
                }
            }
            self.refs.filterInput.value= ''
            self.setState({'filterInput': ''});
        });
    }


});
