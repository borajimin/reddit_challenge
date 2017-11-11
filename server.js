const path = require('path');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt');
const sequelize = require('./models');
const PORT = process.env.PORT || 3000;
const api = require('./backend/routes');
const {User} = require('./models');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.get('/', (request, response) => {
    response.sendFile(__dirname + '/public/index.html'); // For React/Redux
});

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findOne({where: {id: id}})
    .then(user => done(null, user.rows[0]))
    .catch((err) => {throw new Error(err);});
});

passport.use(new LocalStrategy(function(username, password, done) {
    User.findOne({where: {username: username}})
      .then(user => {
        console.log('comparing.', user);
        if(!user){
          console.log('no user.');
          return done(null, false);
        }  else {
          console.log('user found: ', user.dataValues);
          bcrypt.compare(password, user.dataValues.password, function(err, res) {
             if(res) {
               console.log('response found.', res);
                 return done(null, user.dataValues);
             }  else {
               console.log('no response.');
               return done(null, false);
             }
          })
        }
        })
      .catch(err => {
        console.log('error, ', err);
        return done(null, false)
      })
}));

passport.use(new LocalStrategy((username, password, done) => {
    User.findOne({where: {username: username}})
      .then( (user) => {
          if(user) {
              bcrypt.compare(password, user.dataValues.password, (err, res) => {
                  if (res) {
                      return done(null, user.dataValues);
                  }
                  return done(null, false);
              });
          } else {
              return done(null, false);
          }
      })
      .catch((err) => {return done(err);});
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/api', api(passport));

app.listen(PORT, error => {
    error
    ? console.error(error)
    : console.info(`==> 🌎 Listening on port ${PORT}. Visit http://localhost:${PORT}/ in your browser.`);
});
