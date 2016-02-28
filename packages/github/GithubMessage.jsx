
GithubMessage = React.createClass({
    styles: {
        profileImage: {
            float: 'left',
            width: '40px',
            borderRadius: '20px',
            position:'relative',
            top:'0px',
            left: '-5px'
        }
    },

    render() {
        try {
            return (
                <li className="message-item github-message">
                    <img style={this.styles.profileImage} src="https://assets-cdn.github.com/images/modules/logos_page/GitHub-Mark.png" title={'Message ' + this.props.message.seq}/>
                    <div style={{paddingLeft:'50px'}}>
                        <div><b>{this.props.message.createdByName}</b>
                            <span className="message-created-at"> {moment(this.props.message.createdAt).fromNow()} </span>
                              {this.renderMessageDropdown()}
                        </div>
                        <div className="message-content markdown-content">
                            {this.renderContent()}
                        </div>
                    </div>
                </li>
            );
        } catch(err) {
            console.log("Error rendering message: " + JSON.stringify(err));
            return <p style={{padding:'10px', color:'red'}}>Unexpected error rendering message {this.props.message.seq}</p>;
        }
    },

    renderContent() {
        if(this.props.message.data.event) {
            switch (this.props.message.data.eventType) {
                case 'ping':
                    return this.renderPingEvent();
                case 'push':
                    return this.renderPushEvent();
                    break;
                case 'issues':
                    return this.renderIssuesEvent();
                    break;
                case 'issue_comment':
                    return this.renderIssueCommentEvent();
                    break;
                default:
                    return <p>Github event <i>{this.props.message.data.eventType}</i> not supported.</p>;
                    break;
            }
        } else {
            return <p style={{color:'red'}}>Unexpected error: message contains invalid data</p>;
        }
    },

    renderPingEvent() {
        var username = this.props.message.data.event.sender.login;
        return (
            <div>
                <span><i>{username}</i> added <b>GitHub</b> integration to this project.</span>
            </div>
        )
    },

    renderPushEvent() {
        var username = this.props.message.data.event.sender.login;
        var numCommits = this.props.message.data.event.commits.length;
        var repo = this.props.message.data.event.repository.name;
        var branch = this.props.message.data.event.ref.replace(/refs\/heads\//g, '');
        return (
            <div>
                <span><i>{username}</i> pushed <b>{numCommits}</b> new {numCommits==1?"commit":"commits"} to {repo}:{branch}:</span>
                <ul>
                    {this.renderCommitMessages()}
                </ul>
            </div>
        );
    },

    renderCommitMessages() {
        return this.props.message.data.event.commits.map(function(commit) {
            return <li><a target='_blank' href={commit.url}>{Ols.StringUtils.truncate(commit.id, 7, {ellipsis:false})}</a>: {commit.message}</li>;
        });
    },

    renderIssuesEvent() {
        var username = this.props.message.data.event.sender.login;
        var issueNumber = this.props.message.data.event.issue.number;
        var issueTitle = this.props.message.data.event.issue.title;
        var url = this.props.message.data.event.issue.html_url;
        var assignee = this.props.message.data.event.assignee.login;
        var action = this.props.message.data.event.action;
        if (action == 'assigned') {
            return (
                <span>
                    <i>{username}</i> {action} issue <a target="_blank" href={url}>issue #{issueNumber}: {Ols.StringUtils.truncate(issueTitle, 100)}</a> to {assignee}
                </span>
            );
        } else {
            return (
                <span>
                    <i>{username}</i> {action} issue <a target="_blank" href={url}>issue #{issueNumber}: {Ols.StringUtils.truncate(issueTitle, 100)}</a>
                </span>
            );
        }
    },

    renderIssueCommentEvent() {
        var username = this.props.message.data.event.sender.login;
        var url = this.props.message.data.event.comment.html_url;
        var issueNumber = this.props.message.data.event.issue.number;
        var issueTitle = this.props.message.data.event.issue.title;
        return (
            <span>
                <i>{username}</i> commented on <a target="_blank" href={url}>issue #{issueNumber}: {Ols.StringUtils.truncate(issueTitle, 100)}</a>
            </span>
        );

    },

    renderMessageDropdown() {
        return (
            <span className="dropdown">
                <button className="btn btn-xs btn-default dropdown-toggle" style={{color:'gray', backgroundColor:'none', border:'none'}} type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                    <span className="caret"></span>
                </button>
                <ul className="dropdown-menu" aria-labelledby="dropdownMenu1">
                    <li><a onClick={this.onAddRefClicked} href="#">Add Item Reference</a></li>
                </ul>
            </span>
        );
    },

    onAddRefClicked(e) {
      e.preventDefault();
      var self = this;
      bootbox.prompt({title: "Enter item seq (i.e: 'For #OLS-42 enter 42'):", callback: function(seq) {
        if (seq !== null) {
          seq = parseInt(seq.trim());
          Meteor.call('addRefToMessage', self.props.message.projectId, self.props.message._id, seq, (err, content) => {
            if(err) {
              toastr.error("Error adding ref to message: " + err.reason);
            }
          });
        }
      }});
    }
});
