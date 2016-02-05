
FlowRouter.route('/', {
    name: 'homePage',
    action: function(params) {
        ReactLayout.render(MainLayout, {content: <ConversationPage />});
    }
});
FlowRouter.route('/conversation/:conversationId/:historyMode', {
    name: 'conversationPageLatest',
    action: function(params) {
        ReactLayout.render(MainLayout, {content: <ConversationPage />});
    }
});

FlowRouter.route('/conversation/:conversationId/:historyMode/:historyTs/limit/:historyLimit', {
    name: 'conversationPageFrom',
    action: function(params) {
        ReactLayout.render(MainLayout, {content: <ConversationPage />});
    }
});