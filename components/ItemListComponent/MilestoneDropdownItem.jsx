MilestoneDropdownItem = React.createClass({

    render() {
        return <li><a href="#" onClick={this.onClicked}>{this.props.milestone.title}</a></li>
    },

    onClicked: function(e) {
        e.preventDefault();
        this.props.onMilestoneSelected(this.props.milestone);
    }

});

