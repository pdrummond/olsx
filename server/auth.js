Accounts.onCreateUser(function(options, user) {
    console.log("newUser: " + JSON.stringify(user));

    var gravatarSource;
    var email;
    if(user.emails) {
        email = user.emails[0].address;
        gravatarSource = email;
    } else {
        gravatarSource = user.username;
    }

    user.profileImage = Gravatar.imageUrl(gravatarSource, {size: 50, default: 'wavatar'});



    // We still want the default hook's 'profile' behavior.
    if (options.profile) {
        user.profile = options.profile;
    }
    return user;
});
