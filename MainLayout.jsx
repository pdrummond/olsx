const Styles = mui.Styles;
const Colors = Styles.Colors;

MainLayout = React.createClass({
    childContextTypes : {
        muiTheme: React.PropTypes.object
    },

    getChildContext() {
        return {
            muiTheme: Styles.ThemeManager.getMuiTheme(Styles.LightRawTheme)
        };
    },

    handleToggle() {
        this.setState({open: ! this.state.open});
    },

    render() {
        return (
            <div id="app-wrapper">            
                <main>{this.props.content}</main>
            </div>
        );
    }
});
