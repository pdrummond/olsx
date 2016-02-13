RefListMessage = React.createClass({
    render() {
        var self = this;
        if(this.props.ctx.refs.length > 0) {
            return (
                <li className="message-item">
                    <table>
                        <tbody>
                        <tr>
                            <th>ID</th>
                            <th>Author</th>
                            <th>Created</th>
                            <th>Message</th>
                        </tr>
                        {this.props.ctx.refs.map(function (ref) {
                            return (
                                <tr key={ref._id}>
                                    <td>{ref.messageSeq}</td>
                                    <td>{ref.createdByName}</td>
                                    <td style={{minWidth:'120px'}}>{moment(ref.createdAt).fromNow()}</td>
                                    <td className="markdown-content" dangerouslySetInnerHTML={ self.getHtmlContent(ref)} />
                                </tr>
                            )
                        })}
                        </tbody>
                    </table>
                </li>
            );
        } else {
            return (
                <li>
                    <i>No references found for task {this.props.ctx.taskKey}.</i>
                </li>
            );

        }
    },

    getHtmlContent: function(ref) {
        return { __html: parseMarkdown(ref.messageContent) };
    }

});
