Ols.Status = {
    NEW: 0,
    OPEN: 1,
    IN_PROGRESS: 2,
    BLOCKED: 3,
    IN_TEST: 4,

    DONE: 100,
    REJECTED: 101,
    DUPLICATE: 102,
    OUT_OF_SCOPE: 103,

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
                return 'lightgray';
            case Ols.Status.OPEN:
                return '#99CAD9';
            case Ols.Status.IN_PROGRESS:
                return '#f0ad4e';
            case Ols.Status.BLOCKED:
                return '#d9534f';
            case Ols.Status.IN_TEST:
                return '#337ab7';
            case Ols.Status.DONE:
                return '#5cb85c';
            case Ols.Status.REJECTED:
                return 'gray';
            case Ols.Status.DUPLICATE:
                return 'gray';
            case Ols.Status.OUT_OF_SCOPE:
                return 'gray';
        }
    },

    isOpen: function(status) {
        return status < Ols.Status.DONE;
    },

    isDone: function(status) {
        return !this.isOpen(status);
    },

    isInvalidType: function(status) {
        return status >= Ols.Status.REJECTED;
    }
};
