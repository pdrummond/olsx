ItemListComponent = React.createClass({
    mixins: [ReactMeteorData],

    propTypes: {
        projectId: React.PropTypes.string.isRequired,
        projectTemplate: React.PropTypes.string,
        filter: React.PropTypes.object,
        newItemType: React.PropTypes.string,
        newItemSubType: React.PropTypes.string,
        newItemStatus: React.PropTypes.number,
        newItemAssignee: React.PropTypes.string
    },

    getDefaultProps() {
        return {
            newItemType: Ols.Item.ITEM_TYPE_ACTION,
            newItemSubType: Ols.Item.ACTION_SUBTYPE_TASK,
            newItemStatus: Ols.Status.OPEN
        };
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
            data.itemList = Items.find(filter, {sort: {priority: -1, createdAt: -1}}).fetch();

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
                           placeholder={this.renderPlaceholder()}
                           onKeyUp={this.onKeyUp} />
                </form>
                {this.renderItemList()}
            </div>
        )
    },

    renderPlaceholder() {
        return "Type here to create " + this.props.newItemSubType + "/filter list";
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
                projectTemplate={this.props.projectTemplate}
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
            type: this.props.newItemType,
            subType:this.props.newItemSubType,
            status: this.props.newItemStatus,
            assignee: this.props.newItemAssignee,
            milestoneId: this.data.milestoneIdParam
        }, (err, item) => {
            if (err) {
                if (err.reason) {
                    toastr.error("Error adding item: " + err.reason);
                } else {
                    console.error("Error adding item: " + JSON.stringify(err));
                }
            }
            self.refs.filterInput.value= '';
            self.setState({'filterInput': ''});
        });
    }


});
