Task = React.createClass({
    mixins: [ReactMeteorData],

    getInitialState() {
        return {
            isSelected: false,
            showRefList: false
        }
    },

    getMeteorData() {
        var data = {};
        data.refList = Refs.find({
                projectId: this.props.task.projectId,
                taskId: this.props.task._id
            }, {
                sort: {createdAt: -1}
            }).fetch();
        console.log("Task.getMeteorData() refList = " + JSON.stringify(data.refList));
        return data;
    },

    styles: {
        taskIcon: {
            float: 'left',
            width: '35px',
            position: 'relative',
            top: '5px'
        }
    },

    render() {
        return (
            <li className={this.state.isSelected?'task active':'task'}>
                <div className="task-wrapper">
                    <i style={this.styles.taskIcon} className="fa fa-exclamation-circle fa-2x"></i>
                    <div style={{paddingLeft: '0px'}}>
                        <div onClick={this.onDescriptionClicked}
                             className="task-description"
                             style={{fontSize: '14px', fontWeight: 'bold', color:'gray'}}>
                                {this.renderKey()} {this.props.task.description}
                        </div>
                        <div style={{fontSize:'12px',color:'gray'}}>{this.props.task.createdByName}</div>
                    </div>
                    {this.renderSelectedLinks()}
                </div>
                {this.renderRefList()}
            </li>
        )
    },

    renderKey() {
        if(this.props.task.key == -1) {
            return <i className="fa fa-spin fa-spinner"></i>;
        } else {
            return this.props.task.key + ": ";
        }
    },

    renderRefList() {
        if(this.state.showRefList) {
            return <RefList refList={this.data.refList} />;
        } else {
            return null;
        }
    },

    renderSelectedLinks() {
        if(this.state.isSelected) {
            return (
                <div>
                    <div className="btn-group" role="group" aria-label="...">
                        <button type="button" className="btn btn-link" onClick={this.onJumpClicked}><i className="fa fa-mail-reply"></i> Jump</button>
                        <button type="button" className="btn btn-link" onClick={this.onRefsClicked}><i className="fa fa-hashtag"></i> References</button>
                        <button type="button" className="btn btn-link"><i className="fa fa-archive"></i> Archive</button>
                    </div>
                    <div className="pull-right">
                        <div className="dropdown">
                            <button className="btn btn-default dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                                <i className="fa fa-ellipsis-v"></i>
                            </button>
                            <ul className="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenu1">
                                <li><a href="">Show Details</a></li>
                                <li role="separator" className="divider"></li>
                                <li><a href="">Set Open - New</a></li>
                                <li><a href="">Set Open - In Progress</a></li>
                                <li><a href="">Set Open - Blocked</a></li>
                                <li><a href="">Set Open - In Test</a></li>
                                <li role="separator" className="divider"></li>
                                <li><a href="">Set Closed - Done</a></li>
                                <li><a href="">Set Closed - Rejected</a></li>
                                <li><a href="">Set Closed - Duplicate</a></li>
                                <li><a href="">Set Closed - Out of Scope</a></li>
                                <li role="separator" className="divider"></li>
                                <li><a href="">Delete</a></li>
                            </ul>
                        </div>
                    </div>

                </div>
            );
        } else {
            return <div></div>
        }
    },

    onDescriptionClicked: function() {
        this.setState({'isSelected': !this.state.isSelected});
    },

    onJumpClicked: function() {
        FlowRouter.go('projectPageStartSeq', {
            projectId: this.props.task.projectId,
            startMessageSeq: this.props.task.messageSeq
        }, {
            scrollTop: true,
            selectStartMessage: true
        });
    },

    onRefsClicked: function() {
        this.setState({'showRefList': !this.state.showRefList});
    }
});
