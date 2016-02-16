Task = React.createClass({

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
            <li className="task">
                <div className="task-wrapper">
                    <i style={this.styles.taskIcon} className="fa fa-exclamation-circle fa-2x"></i>
                    <div style={{paddingLeft: '50px'}}>
                        <div>{this.props.task.description}</div>
                        <div style={{fontSize:'12px',color:'gray'}}>{this.props.task.createdByName}</div>
                    </div>
                </div>
            </li>
        )
    },


    onClick: function() {
        this.props.onClick(this.props.task);
    }
});
