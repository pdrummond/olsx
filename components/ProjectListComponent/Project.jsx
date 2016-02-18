Project = React.createClass({
    propTypes: {
        numNewMessages: React.PropTypes.number,
        isActive: React.PropTypes.bool,

        onClick: React.PropTypes.func
    },

    render() {
        return (
            <li
                onClick={this.onClick}
                className={this.getClassName()}>
                <div>
                    <span className="project-title"><i className="fa fa-bullseye"></i> {this.props.project.title}</span>
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