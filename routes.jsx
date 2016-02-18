
FlowRouter.route('/', {
    name: 'homePage',
    action: function(params) {
        ReactLayout.render(MainLayout, {content: <ProjectPage />});
    }
});
FlowRouter.route('/project/:projectId', {
    name: 'projectPageLatest',
    action: function(params) {
        ReactLayout.render(MainLayout, {content: <ProjectPage />});
    }
});

FlowRouter.route('/project/:projectId/start-message/:startMessageSeq', {
    name: 'projectPageStartSeq',
    action: function(params) {
        ReactLayout.render(MainLayout, {content: <ProjectPage />});
    }
});

FlowRouter.route('/project/:projectId/start-message/:startMessageSeq/limit/:messagesCountLimit', {
    name: 'projectPageStartSeqAndLimit',
    action: function(params) {
        ReactLayout.render(MainLayout, {content: <ProjectPage />});
    }
});

FlowRouter.notFound = {
    action: function() {
        ReactLayout.render(MainLayout, {content: <NotFoundPage />});
    }
}