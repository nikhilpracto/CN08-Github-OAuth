const express = require('express');
const https = require('https');
const passport = require('passport');
const cookieSession = require('cookie-session');
const port = 3000;
const app = express();
const isLoggedIn = require('./Middleware/auth');
require('./passport')

app.use(cookieSession({
    name: 'github-auth-session',
    keys: ['key1', 'key2']
}))

app.use(passport.initialize());
app.use(passport.session());

app.get('/', isLoggedIn, (req, res) => {
    res.send(`Hello World ${req.user.displayName}`);
})

app.get('/activity', isLoggedIn, (req, res) => {
    const user = req.user.username;
    const options = {
        hostname: 'api.github.com',
        path: '/users/' + user + '/events',
        headers: {
            'User-Agent': ''
        }
    }
    https.get(options, function (apiResponse) {
        apiResponse.pipe(res);
    }).on('error', (e) => {
        res.status(500).send('Something went wrong!');
    })
})

app.get('/logout', (req, res) => {
    // req.session = null;
    req.logout();
    res.redirect('/');
})

app.get('/auth/error', (req, res) =>
    res.send('Unknown Error')
)

app.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));

app.get('/auth/github/callback', passport.authenticate('github', {
    failureRedirect: '/auth/error'
}), function (req, res) {
    res.redirect('/activity');
})

app.listen(port, () => {
    console.log(`Server is started on port ${port}`);
});