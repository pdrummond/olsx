
MainLayout = React.createClass({

    render() {
        return (
            <div id="app-wrapper">
                <main>{this.props.content}</main>
            </div>
        );
    }
});
