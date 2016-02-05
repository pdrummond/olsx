
FlowRouter.route('/conversation/one/:historyMode', {
    name: 'conversationPageLatest',
    action: function(params) {
        ReactLayout.render(MainLayout, {content: <ConversationPage />});
    }
});

FlowRouter.route('/conversation/one/:historyMode/:historyTs/limit/:historyLimit', {
    name: 'conversationPageFrom',
    action: function(params) {
        ReactLayout.render(MainLayout, {content: <ConversationPage />});
    }
});