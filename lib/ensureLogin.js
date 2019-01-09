/**
 * Ensure that a user is logged in before proceeding to next route middleware.
 *
 * This middleware ensures that a user is logged in.  If a request is received
 * that is unauthenticated, the request will be redirected to a login page (by
 * default to `/login`).
 *
 * Additionally, `returnTo` will be be set in the session to the URL of the
 * current request.  After authentication, this value can be used to redirect
 * the user to the page that was originally requested.
 *
 * options:
 *   - `redirectTo`   URL to redirect to for login, defaults to _/login_
 *   - `setReturnTo`  set redirectTo in session, defaults to _true_
 *   - `localUser`    always grant local requests as {username:'local'}, defaults to _true_
 * 
 * verifyToken:
 *   - `callback`     callback function to verify _token_, defaults to _null_
 * 
 * Examples:
 *
 *     app.get('/profile',
 *       ensureLoggedIn('/signin'),
 *       function(req, res) { ... });
 *
 *     app.get('/profile',
 *       ensureLoggedIn({redirectTo:'/login', localUser: false}, verifyToken),
 *       function(req, res) { ... });
 *
 *     app.get('/profile',
 *       ensureLoggedIn({ redirectTo: '/session/new', setReturnTo: false }),
 *       function(req, res) { ... });
 *
 * @param {Object} options
 * @return {Function}
 * @api public
 */

module.exports = function ensureLogin(options, verifyToken = null) {
  if (typeof options == 'string') {
    options = { redirectTo: options }
  }

  options = options || {};

  var url = options.redirectTo || '/login';
  var setReturnTo = (options.setReturnTo === undefined) ? true : options.setReturnTo;
  var grantLocalUser = (options.localUser === undefined) ? false : options.localUser;
  var tokenCallback = (typeof verifyToken == 'function' && verifyToken.length == 2)

  return function (req, res, next) {
    const localUser = grantLocalUser && req.ip.indexOf("127.0.0.1") > -1
    const token = tokenCallback && req.headers && req.headers.authorization
    && req.headers.authorization.split(" ").length == 2
    && /^Bearer$/i.test(req.headers.authorization.split(" ")[0])
    && req.headers.authorization.split(" ")[1]

    if (!token && !localUser && (!req.isAuthenticated || !req.isAuthenticated())) {
      // console.log("Option 1")
      if (setReturnTo && req.session) {
        req.session.returnTo = req.originalUrl || req.url;
        return res.redirect(url);
      }
      else res.sendStatus(403)
    }
    else if (token) {
      // console.log("Option 2")
      verifyToken(token, function(user){
        console.log(user)
        if (user) { req.user = req.user; next() }
        else res.sendStatus(403)
      })
    }
    else {
      // console.log("Option 3")
      req.user = req.user || { username: "local" }
      next()
    }
  }
}