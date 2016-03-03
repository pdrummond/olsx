RouterApi = function() {
};

RouterApi.prototype.showProjectPageLatest = function(params, queryParams) {
    this._go('projectPageLatest', params, queryParams);
}

RouterApi.prototype.showProjectPageFromMessage = function(params, queryParams) {
    this._go('projectPageStartSeq', params, queryParams);
}

RouterApi.prototype.showProjectPageFromMessageWithLimit = function(params, queryParams) {
    this._go('projectPageStartSeqAndLimit', params, queryParams);
}

RouterApi.prototype._go = function(name, params, queryParams) {
    queryParams = _.extend(this._getDefaultQueryParams(), queryParams);
    console.log("Ols.Router.showProjectPageLatest queryParams: " + JSON.stringify(queryParams));
    FlowRouter.go(name, params, queryParams);    
};

RouterApi.prototype._getDefaultQueryParams = function() {
    var defaultQueryParams = {
        scrollBottom: FlowRouter.getQueryParam('scrollBottom'),
        scrollTop: FlowRouter.getQueryParam('scrollTop'),
        rightView: FlowRouter.getQueryParam('rightView'),
        selectStartMessage: FlowRouter.getQueryParam('selectStartMessage'),
        itemId: FlowRouter.getQueryParam('itemId'),
        milestoneId: FlowRouter.getQueryParam('milestoneId'),
        releaseId: FlowRouter.getQueryParam('releaseId')
    };
    console.log("Ols.Router._getDefaultQueryParams: " + JSON.stringify(defaultQueryParams));
    return defaultQueryParams;
};

Ols.Router = new RouterApi();
