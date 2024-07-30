const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const docsRoute = require('./docs.route');
const gameRoute = require('./game.route');
const taskRoute = require('./task.route');
const botRoute = require('./bot.route');
const walletRoute = require('./wallet.route');
const config = require('../../config/config');
const activityRoute = require('./activity.route');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/user',
    route: userRoute,
  },
  {
    path: '/games',
    route: gameRoute,
  },
  {
    path: '/task',
    route: taskRoute,
  },
  {
    path: '/bot',
    route: botRoute,
  },
  {
    path: '/wallet',
    route: walletRoute,
  },

  {
    path: '/activities',
    route: activityRoute,
  },
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
