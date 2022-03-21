import express from 'express';
// import notion from '../modules/notion';

const calendarRoutes = express.Router();

calendarRoutes.route('/new-event').post(function(req, res) {
  console.log(req.body);
});

calendarRoutes.route('/delete-event').post(function(req, res) {
  console.log('hello');
});

calendarRoutes.route('/update-event').post(function(req, res) {
  console.log('hello');
});

module.exports = calendarRoutes;
