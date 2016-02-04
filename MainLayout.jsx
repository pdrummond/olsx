MainLayout = React.createClass({
    render() {
        return (
            <div id="app-wrapper">
                <header><h1>OpenLoops</h1></header>
                <main>{this.props.content}</main>
            </div>
        );
    }
});