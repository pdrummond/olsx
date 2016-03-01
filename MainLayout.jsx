const { AppBar, IconButton, IconMenu, LeftNav } = mui;
const { MenuItem } = mui.Menus;
const { NavigationMoreVert } = mui.SvgIcons;
const Styles = mui.Styles;
const Colors = Styles.Colors;

MainLayout = React.createClass({
    childContextTypes : {
        muiTheme: React.PropTypes.object
    },

    getInitialState() {
        return {
            open: false
        };
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
                <AccountsUIWrapper />
                <main>{this.props.content}</main>
            </div>
        );
    }
});
