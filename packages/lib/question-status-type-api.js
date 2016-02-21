Ols.QuestionStatus = {
    UNANSWERED: 0,
    BLOCKED: 1,
    ANSWERED: 2,
    
    ANSWER_ACCEPTED: 100,
    INVALID: 101,
    DUPLICATE: 102,
    OUT_OF_SCOPE: 103,

    LABEL_UNANSWERED: 'Unanswered',
    LABEL_BLOCKED: 'Blocked',
    LABEL_ANSWERED: 'Answered',
    LABEL_ANSWER_ACCEPTED: 'Answer Accepted',
    LABEL_INVALID: 'Invalid',
    LABEL_DUPLICATE: 'Duplicate',
    LABEL_OUT_OF_SCOPE: 'Out of Scope',

    getStatusLabel(status) {
        switch (status) {
            case Ols.QuestionStatus.UNANSWERED:
                return Ols.QuestionStatus.LABEL_UNANSWERED;
            case Ols.QuestionStatus.BLOCKED:
                return Ols.QuestionStatus.LABEL_BLOCKED;
            case Ols.QuestionStatus.ANSWERED:
                return Ols.QuestionStatus.LABEL_ANSWERED;
            case Ols.QuestionStatus.ANSWER_ACCEPTED:
                return Ols.QuestionStatus.LABEL_ANSWER_ACCEPTED;
            case Ols.QuestionStatus.INVALID:
                return Ols.QuestionStatus.LABEL_INVALID;
            case Ols.QuestionStatus.DUPLICATE:
                return Ols.QuestionStatus.LABEL_DUPLICATE;
            case Ols.QuestionStatus.OUT_OF_SCOPE:
                return Ols.QuestionStatus.LABEL_OUT_OF_SCOPE;
        }
    },

    getStatusColor(status) {
        switch (status) {
            case Ols.QuestionStatus.UNANSWERED:
                return '#99CAD9';
            case Ols.QuestionStatus.OPEN:
                return '#f0ad4e';
            case Ols.QuestionStatus.IN_PROGRESS:
                return '#337ab7';
            case Ols.QuestionStatus.BLOCKED:
                return '#d9534f';
            case Ols.QuestionStatus.ANSWERED:
                return '#337AB7';
            case Ols.QuestionStatus.ANSWER_ACCEPTED:
                return '#5cb85c';
            case Ols.QuestionStatus.INVALID:
                return 'gray';
            case Ols.QuestionStatus.DUPLICATE:
                return 'gray';
            case Ols.QuestionStatus.OUT_OF_SCOPE:
                return 'gray';
        }
    },

    isOpen: function(status) {
        return status < Ols.QuestionStatus.ANSWER_ACCEPTED;
    },

    isClosed: function(status) {
        return !this.isOpen(status);
    }
};



