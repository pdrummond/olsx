
FlowRouter.route('/conversation/one/latest', {
    name: 'conversationPageLatest',
    action: function(params) {
        ReactLayout.render(MainLayout, {content: <ConversationPage />});
    }
});

FlowRouter.route('/conversation/one/from/:historyTs/limit/:historyLimit', {
    name: 'conversationPageFrom',
    action: function(params) {
        ReactLayout.render(MainLayout, {content: <ConversationPage />});
    }
});