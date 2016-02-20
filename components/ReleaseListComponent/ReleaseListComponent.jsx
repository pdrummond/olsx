ReleaseListComponent = React.createClass({
    mixins: [ReactMeteorData],

    getInitialState() {
        return {
            filterInput: ''
        }
    },

    getMeteorData() {
        var data = {};
        data.releaseList = [];
        var releasesHandle = Meteor.subscribe('releases', this.props.projectId);

        if(releasesHandle.ready()) {
            var filter = Ols.Filter.parseString(this.state.filterInput);
            data.releaseList = Releases.find(filter, {sort: {updatedAt: -1}}).fetch();
            data.authInProcess = Meteor.loggingIn();
        }
        return data;
    },

    render() {
        return (
            <div className="release-list-component">
                <form className="filter-release" onSubmit={this.handleSubmit}>
                    <input className="filter-release-input"
                           type="text"
                           ref="filterInput"
                           placeholder="Type here to create release/filter list"
                           onKeyUp={this.onKeyUp} />
                </form>
                <ReleaseList
                    releaseList={this.data.releaseList}/>
            </div>
        )
    },

    onKeyUp: function() {
        var self = this;
        if(this.filterInputKeyTimer) {
            clearTimeout(this.filterInputKeyTimer);
        }
        this.filterInputKeyTimer = setTimeout(function() {
            self.setState({'filterInput': self.refs.filterInput.value});
        }, 500);
    },

    handleSubmit(e) {
        e.preventDefault();
        clearTimeout(this.filterInputKeyTimer);
        var title = this.refs.filterInput.value;
        this.setState({'filterInput': title});
        if (title) {
            this.addRelease(title);
        }
    },

    addRelease(title) {
        var self = this;
        Releases.methods.addRelease.call({
            title,
            projectId: this.props.projectId,
        }, (err, release) => {
            if (err) {
                if (err.reason) {
                    toastr.error("Error adding release: " + err.reason);
                } else {
                    console.error("Error adding release: " + JSON.stringify(err));
                }
            }
            self.refs.filterInput.value= '';
            self.setState({'filterInput': ''});
        });
    }
});
