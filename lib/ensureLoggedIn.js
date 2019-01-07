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
 *   - 'grantLocal'   always grant local requests as {username:'local'} 
 * 
 * verifyToken: callback function returns user if token authorized. 
 *   - 'token'        Bearer token set the header              
 * 
 * Examples:
 *
 *     app.get('/profile',
 *       ensureLoggedIn('/signin'),
 *       function(req, res) { ... });
 *
 *     app.get('/profile',
 *       ensureLoggedIn({redirectTo:'/login', granLocal: true}, function(token){
 *          mongodb.db("auth").collection("users").findOne({ token: token }, function (err, user) {
 *            return user || req.user || { username: "local" }
 *          }); 
 *       }),
 *       function(req, res) { ... });
 *
 *     app.get('/profile',
 *       ensureLoggedIn({ redirectTo: '/session/new', setReturnTo: false }),
 *       function(req, res) { ... });
 *
 * @param {Object} options
 * @param {Function} verifyToken
 * @return {Function}
 * @api public
 */

module.exports = function ensureLoggedIn(options, verifyToken = function () { true; }) {
  if (typeof options == 'string') {
    options = { redirectTo: options }
  }

  options = options || {};

  var url = options.redirectTo || '/login';
  var grantLocal = options.grantLocal || false
  var setReturnTo = (options.setReturnTo === undefined) ? true : options.setReturnTo;

  return function (req, res, next) {
    var isLocal = grantLocal || req.ip.indexOf("127.0.0.1") > -1
    var isToken = req.headers && req.headers.authorization
      && req.headers.authorization.split(" ").length == 2
      && /^Bearer$/i.test(req.headers.authorization.split(" ")[0])
    if (!isLocal && !isToken && (!req.isAuthenticated || !req.isAuthenticated())) {

    }
    else {
      if (isToken) {
        verifyToken(req.headers.authorization.split(" ")[1], function (user) {
          if (user) { req.user = user; next() }
          else {
            if (setReturnTo && req.session) {
              req.session.returnTo = req.originalUrl || req.url;
            }
            return res.redirect(url);
          }
        })
      }
      else {
        req.user = req.user || { username: "local" }
        next()
      }
    }
  }
}