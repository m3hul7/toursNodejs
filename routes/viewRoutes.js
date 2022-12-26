const express = require('express')
const viewContorller = require('../controllers/viewControllers')
const authController = require('../controllers/authControllers')

const router = express.Router()

// router.get('/', (req, res) => {
//   res.status(200).render('base', {
//     title: 'Exciting tours for adventurous people',
//     user: 'mehul'
//   })
// })

router.get('/', authController.isLoggedIn, viewContorller.getOverview)
router.get('/tour/:slug', authController.isLoggedIn, viewContorller.getTour)
router.get('/login', authController.isLoggedIn, viewContorller.getLogIn)
router.get('/me', authController.protect, viewContorller.getAccount)

module.exports = router  