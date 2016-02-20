Release = React.createClass({
    mixins: [ReactMeteorData],

    getInitialState() {
        return {
            isSelected: false
        }
    },

    propTypes: {
        release: React.PropTypes.object,
        showDetailLink: React.PropTypes.bool
    },

    getMeteorData: function() {
        var data = {};
        return data;
    },

    styles: {
        icon: {
            float: 'left',
            width: '20px',
            borderRadius: '10px',
            position:'relative',
            top:'5px'

        }
    },

    render() {
        return (
            <li className={this.state.isSelected?'release active':'release'}>
                <i style={this.styles.icon} className="fa fa-2x fa-paper-plane"></i>
                <div style={{paddingLeft:'40px', fontSize: '12px'}}>
                    <span
                        onClick={this.onTitleClicked}
                        className="release-title">
                        {this.props.release.title}
                        <span className="pull-right label label-success">{this.props.release.status}</span>
                    </span>
                    {this.renderDescription()}
                </div>
                {this.renderSelectedLinks()}
            </li>
        );
    },

    renderDescription() {
        if(this.props.release.description) {
            return <p>{this.props.release.description}</p>;
        }
    },

    renderSelectedLinks() {
        if(this.state.isSelected) {
            return (
                <div style={{paddingLeft:'30px'}}>
                    <div className="btn-group" role="group" aria-label="...">
                        {/*<button type="button" className="btn btn-link" onClick={this.onJumpClicked}><i className="fa fa-mail-reply"></i> Jump</button>
                         <button type="button" className="btn btn-link" onClick={this.onRefsClicked}><i className="fa fa-hashtag"></i> References</button>*/}
                        {this.renderDetailLink()}
                        <button type="button" className="btn btn-link" onClick={this.onDeleteClicked}><i className="fa fa-trash"></i> Delete</button>
                    </div>
                    <div className="pull-right">
                        <div className="dropdown">
                            <button className="btn btn-default dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                                <i className="fa fa-ellipsis-v"></i>
                            </button>
                            <ul className="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenu1">
                                {/*<li><a href="">Set Due Date</a></li>*/}
                                <li><a onClick={this.onUpdateDescriptionClicked} href="">Update Description</a></li>
                                <li><a onClick={this.onRenameClicked} href="">Rename</a></li>

                                {/*<li role="separator" className="divider"></li>
                                 <li><a href="">Activate Release</a></li>
                                 <li><a href="">Mark Complete</a></li>*/}
                            </ul>
                        </div>
                    </div>

                </div>
            );
        } else {
            return <div></div>
        }
    },

    renderDetailLink() {
        if(this.props.showDetailLink) {
            return <button type="button" className="btn btn-link" onClick={this.onDetailClicked}><i
                className="fa fa-paper-plane"></i> Details</button>
        }
    },

    onJumpClicked: function() {
        FlowRouter.go('projectPageStartSeq', {
            projectId: this.props.release.projectId,
            startMessageSeq: this.props.release.messageSeq
        }, {
            scrollTop: true,
            selectStartMessage: true
        });
    },

    onTitleClicked: function() {
        this.setState({'isSelected': !this.state.isSelected});
    },

    onDetailClicked(e) {
        e.preventDefault();
        FlowRouter.setQueryParams({'rightView': 'RELEASE_DETAIL', 'releaseId': this.props.release._id});
    },

    onDeleteClicked(e) {
        e.preventDefault();
        Releases.methods.removeRelease.call({
            releaseId: this.props.release._id,
        }, (err) => {
            if(err) {
                toastr.error("Error removing release: " + err.reason);
            } else {
                FlowRouter.setQueryParams({'rightView': 'RELEASES'});
            }
        });
    },

    onUpdateDescriptionClicked() {
        var self = this;
        var description = "";
        if(this.props.release.description) {
            description = this.props.release.description;
        }
        bootbox.dialog({
            message: '<textarea id="update-release-description-textarea" rows=10 style="width:100%;border:1px solid lightgray" type="text" name="content">' + description + '</textarea>',
            title: "Edit Message",
            buttons: {
                main: {
                    label: "Save",
                    className: "btn-primary",
                    callback: function (result) {
                        var description = $('#update-release-description-textarea').val();
                        if(description != null) {
                            description = description.trim();
                            Releases.methods.setDescription.call({
                                releaseId: self.props.release._id,
                                description
                            }, (err) => {
                                if(err) {
                                    toastr.error("Error updating release description: " + err.reason);
                                }
                            });
                        }
                    }
                },
                cancel: {
                    label: 'Cancel',
                    className: 'btn-default'
                }
            }
        });
    },

    onRenameClicked(e) {
        e.preventDefault();
        var self = this;
        bootbox.prompt({title: "Enter new title for release:", value: this.props.release.title, callback: function(title) {
            if (title!== null) {
                Releases.methods.setTitle.call({
                    releaseId: self.props.release._id,
                    title: title
                }, (err) => {
                    if(err) {
                        toastr.error("Error renaming release: " + err.reason);
                    }
                });
            }
        }});
    }
});