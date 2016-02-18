Ols.Status = {
    NEW: 0,
    OPEN: 1,
    IN_PROGRESS: 2,
    BLOCKED: 3,
    IN_TEST: 4,
    DONE: 5,
    REJECTED: 6,
    DUPLICATE: 7,
    OUT_OF_SCOPE: 8,

    LABEL_NEW: 'New',
    LABEL_OPEN: 'Open',
    LABEL_IN_PROGRESS: 'In Progress',
    LABEL_BLOCKED: 'Blocked',
    LABEL_IN_TEST: 'In Test',
    LABEL_DONE: 'Done',
    LABEL_REJECTED: 'Rejected',
    LABEL_DUPLICATE: 'Duplicate',
    LABEL_OUT_OF_SCOPE: 'Out of Scope',

    getStatusLabel(status) {
        switch (status) {
            case Ols.Status.NEW:
                return Ols.Status.LABEL_NEW;
            case Ols.Status.OPEN:
                return Ols.Status.LABEL_OPEN;
            case Ols.Status.IN_PROGRESS:
                return Ols.Status.LABEL_IN_PROGRESS;
            case Ols.Status.BLOCKED:
                return Ols.Status.LABEL_BLOCKED;
            case Ols.Status.IN_TEST:
                return Ols.Status.LABEL_IN_TEST;
            case Ols.Status.DONE:
                return Ols.Status.LABEL_DONE;
            case Ols.Status.REJECTED:
                return Ols.Status.LABEL_REJECTED;
            case Ols.Status.DUPLICATE:
                return Ols.Status.LABEL_DUPLICATE;
            case Ols.Status.OUT_OF_SCOPE:
                return Ols.Status.LABEL_OUT_OF_SCOPE;
        }
    },

    getStatusColor(status) {
        switch (status) {
            case Ols.Status.NEW:
                return '#5cb85c';
            case Ols.Status.OPEN:
                return '#f0ad4e';
            case Ols.Status.IN_PROGRESS:
                return '#5cb85c';
            case Ols.Status.BLOCKED:
                return '#d9534f';
            case Ols.Status.IN_TEST:
                return '#337ab7';
            case Ols.Status.DONE:
                return 'gray';
            case Ols.Status.REJECTED:
                return 'gray';
            case Ols.Status.DUPLICATE:
                return 'gray';
            case Ols.Status.OUT_OF_SCOPE:
                return 'gray';
        }
    }
};



