ReleaseDropdownItem = React.createClass({

    render() {
        return <li><a href="#" onClick={this.onClicked}>{this.props.release.title}</a></li>
    },

    onClicked: function(e) {
        e.preventDefault();
        this.props.onReleaseSelected(this.props.release);
    }

});

