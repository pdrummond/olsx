FilterApi = function() {

};

FilterApi.prototype.parseString = function(filterString) {
    var filter = {};
    var remainingText = filterString;
    var re = new RegExp("([\\w\\.-]+)\\s*:\\s*([\\w\\.-]+)", "g");
    var match = re.exec(filterString);
    while (match != null) {
        var field = match[1].trim();
        var value = match[2].trim();
        remainingText = remainingText.replace(field, '');
        remainingText = remainingText.replace(value, '');
        remainingText = remainingText.replace(/:/g, '');

        if(field == 'status') {
            switch(value) {
                case 'new': value = Ols.Status.NEW; break;
                case 'open': value = Ols.Status.OPEN; break;
                case 'in-progress': value = Ols.Status.IN_PROGRESS; break;
                case 'blocked': value = Ols.Status.BLOCKED; break;
                case 'in-test': value = Ols.Status.IN_TEST; break;
                case 'done': value = Ols.Status.DONE; break;
                case 'rejected': value = Ols.Status.REJECTED; break;
                case 'duplicate': value = Ols.Status.DUPLICATE; break;
                case 'out-of-scope': value = Ols.Status.OUT_OF_SCOPE; break;
            }
        }

        filter[field] = value;
        match = re.exec(filterString);
    }
    if(remainingText && remainingText.length > 0) {
        filter["$or"] = [{description: {$regex:remainingText}}];
    }
    console.log("Ols.Filter.parseString: " + JSON.stringify(filter));
    return filter;
};

Ols.Filter = new FilterApi;