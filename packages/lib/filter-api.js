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