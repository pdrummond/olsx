Accounts.onCreateUser(function(options, user) {
    console.log("newUser: " + JSON.stringify(user));

    var email = user.emails[0].address;

    var projectId = Projects.insert({
        title: user.username + "_DEFAULT_PROJECT",
        type: Ols.PROJECT_TYPE_USER_DEFAULT,
    });
    user.defaultProjectId = projectId;
    user.profileImage = Gravatar.imageUrl(email, {size: 50, default: 'wavatar'});

    // We still want the default hook's 'profile' behavior.
    if (options.profile) {
        user.profile = options.profile;
    }
    return user;
});