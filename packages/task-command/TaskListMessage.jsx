TaskListMessage = React.createClass({
    render() {
        var self = this;
        if(this.props.ctx.tasks.length > 0) {
            return (
                <li className="message-item">
                    <table>
                        <tbody>
                        <tr>
                            <th>Key</th>
                            <th>Status</th>
                            <th>Created</th>
                            <th>Description</th>
                        </tr>
                        {this.props.ctx.tasks.map(function (task) {
                            return (
                                <tr key={task._id}>
                                    <td>{task.key}</td>
                                    <td>{task.status}</td>
                                    <td>by {task.createdByName} {moment(task.createdAt).fromNow()}</td>
                                    <td className="markdown-content" dangerouslySetInnerHTML={ self.getHtmlContent(task)} />
                                </tr>
                            )
                        })}
                        </tbody>
                    </table>
                </li>
            );
        } else {
            return (
                <li className="message-item">
                    <i>You have no tasks - use <code>'/task add'</code> to create one.</i>
                </li>
            );

        }
    },

    getHtmlContent(task) {
        return { __html: parseMarkdown(task.description) };
    }
});
