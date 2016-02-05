MainLayout = React.createClass({
    render() {
        return (

            <div id="app-wrapper">
                <AccountsUIWrapper />
                <main>{this.props.content}</main>
            </div>
        );
    }
});