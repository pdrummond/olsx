FilterApi = function() {

};

FilterApi.prototype.parseString = function(filterString) {
    var filter = {};
    var remainingText = filterString;
    var re = new RegExp("([\\w\\.-]+)\\s*:\\s*([\\w\\.\\-><]+)", "g");
    var match = re.exec(filterString);
    var disableTextSearch = false;
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
        } else if(field == 'milestone') {
            var valueAndRemainingText = value + " " + remainingText;
            valueAndRemainingText = valueAndRemainingText.trim();
            var milestone = Milestones.findOne({title: valueAndRemainingText});
            if(milestone != null) {
                field = 'milestoneId';
                value = milestone._id;
                disableTextSearch = true;
            }
        } else if(field == 'priority') {
            if(value.indexOf('>') != -1) {
                value = parseInt(value.substring(1));
                value = {$gt: value};
            } if(value.indexOf('<') != -1) {
                value = parseInt(value.substring(1));
                value = {$gt: value};
            } else {
                value = parseInt(value);
            }
        }

        filter[field] = value;
        match = re.exec(filterString);
    }
    remainingText = remainingText.trim();
    if(remainingText && remainingText.length > 0 && !disableTextSearch) {
        filter["$or"] = [{description: {$regex:remainingText}}];
    }
    console.log("Ols.Filter.parseString: " + JSON.stringify(filter));
    return filter;
};

Ols.Filter = new FilterApi;