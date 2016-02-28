LinksApi = function() {

};

LinksApi.prototype.generateItemKeyLink = function(projectId, itemId, key, seq) {
  return "[#" + key + "-" + seq + "](/project/" + projectId + "?rightView=ITEM_DETAIL&itemId=" + itemId + ")";
}

Ols.Links = new LinksApi;
