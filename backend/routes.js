const express = require('express');
const router = express.Router();
const { User, Post, Vote } = require('../models');
const bcrypt = require('bcrypt');
let hashedPassword;

module.exports = (passport) => {
  // YOUR API ROUTES HERE
  router.post('/register', (req, res) => {
    User.findAll({where: {username: req.body.username}})
    .then(users => {
      if(req.body.password === req.body.repeatPassword && !users[0]) {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          hashedPassword = hash;
          User.create({
            username: req.body.username,
            password: hashedPassword
          })
          .then(() => {
            res.json({success: true});
          });
        });
      } else {
        res.json({success: false});
      }
    })
    .catch((err)=>console.log(err));
  });


  router.get('/posts/all', (req, res) => {
    Post.findAll({
      where: {fk_post_id: null}
    })
    .then((posts) => {
      console.log(posts);
      res.json({success: true, posts: posts.dataValues});
    });
  });

  router.post('/login', (req, res, next) => {
    console.log('logging in.');
    passport.authenticate('local', (err, user) => {
      console.log('HERE');
      user ? req.login(user, error => {
        if(err) {return next(error);}
        return res.json({success: true});
      }) : res.json({success: false});
    })(req, res, next);
  });

  router.use((req, res, next) => {
    console.log('use.');
    if (! req.user) {
      console.log('no user.');
      res.status(400).json({success: false, message: 'You are not logged in.'});
    } else {
      console.log('user found.');
      next();
    }
  });

  router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
  });

  router.get('/:username', (req, res) => {
    User.findOne({where: {username: req.params.username}})
    .then((user) => {
      if(user) {
        console.log(user.dataValues);
        res.json({success: true, user: Object.assign({}, user.dataValues, {password: null})});
      } else {
        res.json({success: false, user: null});
      }
    });
  });

  router.get('/user', (req, res) => {
    User.findOne({where: {username: req.user.username}})
    .then((user) => {
      res.json({success: true, user: user.dataValues});
    });
  });

  router.post('/post/new', (req, res) => {
    console.log('routes post new.');
    Post.create({
      fk_post_id: req.body.postId,
      //img: req.body.img,
      description: req.body.description,
      fk_user_id: req.user.username,
      title: req.body.title
    })
    .then(() => {
      res.json({success: true});
    })
    .catch((error)=>{
      res.json({success: false, error: error});
    });
  });


  router.get('/post/:id', (req, res) => {
    console.log('here.');
    Post.findOne({where: {id: req.params.id}})
    .then((post) => {
      res.redirect('/post/page/' + req.params.id);
    })
    .catch(err => res.json({success: false, error: err}));
  })

  router.post('/post/delete/:id', (req, res) => {
    Post.destroy({
      where: {
        id: req.params.id
      }
    })
    .then(res.json({success: true, post: post.dataValues}))
    .catch(err => res.json({success: false, error: err}));
  })

  router.get('/post/:id/upvote', (req, res) => {
    Vote.findOne({
      where: {fk_post_id: req.params.id, fk_user_id: req.user.id}
    })
    .then(post => {
      if(post === null){
        const vote = Vote.build({
          fk_post_id: req.params.id,
          fk_user_id: req.user.id,
          vote_type: 'upvote'
        })
        vote.save().catch(error => {
          console.log('could not make downvote.');
        })
      }  else if(post.dataValues.type === 'upvote'){
        // delete it
        Vote.destroy({
          where: {
            fk_post_id: req.params.id,
            user_id: req.user.id
          }
        })
        .then(() => {
          res.json({success: true})
        })
        .catch(err => res.json({success: false, error: err}))
      }  else {
        // delete it and create upvote
        Vote.destroy({
          where: {
            fk_post_id: req.params.id,
            user_id: req.user.id
          }
        })
        .then(() => {
          // create upvote
          const vote = Vote.build({
            fk_post_id: req.params.id,
            fk_user_id: req.user.id,
            vote_type: 'upvote'
          })
          vote.save().catch(error => {
            console.log('could not make upvote.');
          })
        })
        .catch(err => res.json({success: false, error: err}));
      }
    })
    .catch(err => res.json({success: false, error: err}))
  })

  router.get('/post/:id/downvote', (req, res) => {
    Vote.findOne({
      where: {fk_post_id: req.params.id, fk_user_id: req.user.id}
    })
    .then(post => {
      if(post === null){
        const vote = Vote.build({
          fk_post_id: req.params.id,
          fk_user_id: req.user.id,
          vote_type: 'downvote'
        })
        vote.save().catch(error => {
          console.log('could not make downvote.');
        })
      }  else if(post.dataValues.type === 'upvote'){
        // delete it and create downvote
        Vote.destroy({
          where: {
            fk_post_id: req.params.id,
            user_id: req.user.id
          }
        })
        .then(() => {
          // create upvote
          const vote = Vote.build({
            fk_post_id: req.params.id,
            fk_user_id: req.user.id,
            vote_type: 'downvote'
          })
          vote.save().catch(error => {
            console.log('could not make downvote.');
          })
        })
        .catch(err => res.json({success: false, error: err}));
      }  else{
        // delete it
        Vote.destroy({
          where: {
            fk_post_id: req.params.id,
            user_id: req.user.id
          }
        })
        .then(() => {
          res.json({success: true})
        })
        .catch(err => res.json({success: false, error: err}))
      }
    })
    .catch(err => res.json({success: false, error: err}))
  })

  // SAMPLE ROUTE
  router.use('/users', (req, res) => {
    res.json({ success: true });
  });

  return router;
};
