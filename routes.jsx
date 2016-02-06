
FlowRouter.route('/', {
    name: 'homePage',
    action: function(params) {
        ReactLayout.render(MainLayout, {content: <ConversationPage />});
    }
});
FlowRouter.route('/conversation/:conversationId', {
    name: 'conversationPageLatest',
    action: function(params) {
        ReactLayout.render(MainLayout, {content: <ConversationPage />});
    }
});

FlowRouter.route('/conversation/:conversationId/start-message/:startMessageSeq', {
    name: 'conversationPageStartSeq',
    action: function(params) {
        ReactLayout.render(MainLayout, {content: <ConversationPage />});
    }
});

FlowRouter.route('/conversation/:conversationId/start-message/:startMessageSeq/limit/:messagesCountLimit', {
    name: 'conversationPageStartSeqAndLimit',
    action: function(params) {
        ReactLayout.render(MainLayout, {content: <ConversationPage />});
    }
});