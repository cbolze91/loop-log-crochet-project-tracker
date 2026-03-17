/***********************************************************/
// AUTHENTICATION MIDDLEWARE
/***********************************************************/

// This middleware checks if a user is logged in before allowing access
const isSignedIn = (req, res, next) => {

    // 1. CHECK IF USER EXISTS IN SESSION
    // req.session.user exists ONLY if the user has logged in
    // (this was set during sign-in or sign-up)
    if (req.session.user) {

        // 2. USER IS LOGGED IN
        // Allow the request to continue to the next middleware or route
        return next();
    }

    // 3. USER IS NOT LOGGED IN
    // Redirect the user to the sign-in page
    res.redirect('/auth/sign-in');
};

// Makes this middleware usable in other files (like controllers)
module.exports = isSignedIn;