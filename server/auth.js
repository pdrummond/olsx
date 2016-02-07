Accounts.onCreateUser(function(options, user) {
    console.log("newUser: " + JSON.stringify(user));

    var email = user.emails[0].address;

    user.profileImage = Gravatar.imageUrl(email, {size: 50, default: 'wavatar'});

    // We still want the default hook's 'profile' behavior.
    if (options.profile) {
        user.profile = options.profile;
    }
    return user;
});