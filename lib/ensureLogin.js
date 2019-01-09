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
 * Examples:
 *
 *     app.get('/profile',
 *       ensureLoggedIn('/signin'),
 *       function(req, res) { ... });
 *
 *     app.get('/profile',
 *       ensureLoggedIn({redirectTo:'/login', localUser: false}),
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

module.exports = function ensureLogin(options) {
  if (typeof options == 'string') {
    options = { redirectTo: options }
  }

  options = options || {};

  var url = options.redirectTo || '/login';
  var setReturnTo = (options.setReturnTo === undefined) ? true : options.setReturnTo;
  var localUser = (options.localUser === undefined) ? false : options.localUser;

  return function (req, res, next) {
    localUser =  localUser && req.ip.indexOf("127.0.0.1") > -1
    if (!localUser && (!req.isAuthenticated || !req.isAuthenticated())) {
      if (setReturnTo && req.session) {
        req.session.returnTo = req.originalUrl || req.url;
        return res.redirect(url);
      }
      else res.sendStatus(403)
    }
    else {
      req.user = req.user || { username: "local" }
      next()
    }
  }
}