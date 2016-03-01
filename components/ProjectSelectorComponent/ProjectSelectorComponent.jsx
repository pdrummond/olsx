const { FlatButton, RaisedButton, Dialog, DropDownMenu, MenuItem } = mui;

ProjectSelectorComponent = React.createClass({

    getInitialState() {
        return {
            open: false,
            title: 'Select Project'
        }
    },

    getDefaultProps() {
        return {
            projectList: []
        };
    },

    handleOpen() {
        this.setState({open: true});
    },

    handleClose() {
        this.setState({open: false});
    },

    render() {
        const actions = [
            <FlatButton
                label="Cancel"
                secondary={true}
                onTouchTap={this.handleCancel}
                />,
            <FlatButton
                label="Ok"
                primary={true}
                keyboardFocused={true}
                onTouchTap={this.handleClose}
                />,
        ];

        return (
            <div>
                <Dialog
                    title={this.state.title}
                    actions={actions}
                    modal={true}
                    open={this.state.open}
                    contentStyle={{width:'400px'}}
                    onRequestClose={this.handleClose}>

                    <DropDownMenu
                        ref='dropdownMenu'
                        autoWidth={false}
                        style={{width:'100%'}}
                        maxHeight={200}
                        onChange={this.handleChange}
                        placeholder="Select Project"
                        value={this.state.value}>
                        {this.renderProjectItems()}
                    </DropDownMenu>
                </Dialog>
            </div>
        );
    },

    handleChange(event, index, value) {
        this.setState({value});
    },

    renderProjectItems() {
        var items = this.props.projectList.filter(function(project) {
            return project.type == Ols.Project.PROJECT_TYPE_STANDARD;
        });
        items = items.map(function(project) {
            return <MenuItem value={project._id} primaryText={project.title}/>
        });
        return items;
    },

    handleCancel() {
        this.setState({open:false});    
    },

    handleClose() {
        this.props.onProjectSelected(this.state.value, this.state.message, this.state.type, this.state.subType);
        this.setState({open:false});
    }
});
