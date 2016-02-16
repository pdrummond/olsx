LoopBotMember = React.createClass({

    styles: {
        profileImage: {
            float: 'left',
            width: '35px',
            position: 'relative',
            top: '8px'
        }
    },

    render() {
        return (
            <li onClick={this.onClick} className="member">
                <img style={this.styles.profileImage} src='/images/loopbot-medium.png'/>
                <div style={{paddingLeft: '50px'}}>
                    <div>loopbot</div>
                    <div style={{position:'relative',top:'-5px',fontSize:'12px',fontWeight:'bold', color: 'orange', lineHeight:'1.2'}} className='loopbot-member-status'>
                        Creating new task, waiting for description..
                    </div>
                </div>
            </li>
        )
    },


    onClick: function() {
        alert("loopbot clicked");
    }
});
