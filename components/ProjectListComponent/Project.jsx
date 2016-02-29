Project = React.createClass({
    propTypes: {
        numNewMessages: React.PropTypes.number,
        isActive: React.PropTypes.bool,

        onClick: React.PropTypes.func
    },

    render() {
        return (
            <li onClick={this.onClick} className={this.getClassName()}>
                <div>
                    <span className="project-title"><i className={this.getProjectTitleClassName()}></i> {this.props.project.title}
                        {this.renderProjectKey()}
                    </span>
                    <div>
                        <div style={{fontSize:'12px', color:'gray', position:'relative'}}>
                            Created by {this.props.project.createdByName} {moment(this.props.project.createdAt).fromNow()}
                        </div>
                        <span className={this.props.numNewMessages == 0 ?"hide project-new-messages-badge":"project-new-messages-badge"}>
                        {this.props.numNewMessages}
                    </span>
                    </div>
                </div>

            </li>
        )
    },

    renderProjectKey() {
        if(this.props.project.type == Ols.Project.PROJECT_TYPE_STANDARD) {
            return <small style={{color:'lightgray', marginLeft:'2px', fontWeight:'bold'}}>{this.props.project.key}</small>;
        }
    },

    getProjectTitleClassName() {
        if(this.props.project.type == Ols.Project.PROJECT_TYPE_STANDARD) {
            return "fa fa-bullseye";
        } else {
            return "fa fa-comments";
        }
    },

    getClassName() {
        var className = 'project';
        if(this.props.isActive) {
            className += ' active';
        }
        if(this.props.isSeen) {
            className += ' seen';
        }
        return className;
    },

    onClick: function() {
        this.props.onClick(this.props.project);
    }
});
