Ols.Item = {
    ITEM_TYPE_ACTION: 'action',
    ITEM_TYPE_ISSUE: 'issue',
    ITEM_TYPE_INFO: 'info',
    ITEM_TYPE_FEATURE: 'feature',

    ACTION_SUBTYPE_TASK: 'task',
    ACTION_SUBTYPE_TODO: 'todo',
    ACTION_SUBTYPE_FEATURE_REQUEST: 'feature-request',

    ISSUE_SUBTYPE_BUG: 'bug',
    ISSUE_SUBTYPE_PROBLEM: 'problem',

    FEATURE_SUBTYPE_EPIC: 'epic',
    FEATURE_SUBTYPE_FEATURE: 'feature',
    FEATURE_SUBTYPE_ENHANCEMENT: 'enhancement',

    INFO_SUBTYPE_DISCUSSION: 'discussion',
    INFO_SUBTYPE_QUESTION: 'question',
    INFO_SUBTYPE_IDEA: 'idea',
    INFO_SUBTYPE_WISH: 'wish',

    isDoable: function(subType) {
        return (subType == Ols.Item.ACTION_SUBTYPE_TASK || subType == Ols.Item.ISSUE_SUBTYPE_BUG);
    }
};
