Ols.Status = {
    NEW: 0,
    OPEN: 1,
    IN_PROGRESS:2,
    PAUSED: 3,
    DONE: 4,

    LABEL_NEW: 'New',
    LABEL_OPEN: 'Open',
    LABEL_IN_PROGRESS: 'In Progress',
    LABEL_PAUSED: 'Paused',
    LABEL_DONE: 'Done',

    getStatusLabel(status) {
        switch(status) {
            case Ols.Status.NEW: return Ols.Status.LABEL_NEW;
            case Ols.Status.OPEN: return Ols.Status.LABEL_OPEN;
            case Ols.Status.IN_PROGRESS: return Ols.Status.LABEL_IN_PROGRESS;
            case Ols.Status.PAUSED: return Ols.Status.LABEL_PAUSED;
            case Ols.Status.DONE: return Ols.Status.LABEL_DONE;
        }
    }
}