const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController')

const { catchErrors} = require('../handlers/errorHandlers');
// Do work here
router.get('/',catchErrors(storeController.getStores));
router.get('/stores',catchErrors(storeController.getStores));
router.get('/stores/page/:page',catchErrors(storeController.getStores));


//adding a new store
router.get('/add',authController.isLoggedIn,storeController.addStore);

//posting store
router.post('/add',authController.isLoggedIn,
    storeController.upload,
    catchErrors(storeController.resize),
    catchErrors(storeController.createStore)
);

router.get('/stores/:id/edit',authController.isLoggedIn,
    catchErrors(storeController.editStore)
);

router.post('/add/:id',authController.isLoggedIn,
storeController.upload,
catchErrors(storeController.resize),
catchErrors(storeController.updateStore));

router.get('/store/:slug',catchErrors(storeController.getStoreBySlug));

router.get('/tags',catchErrors(storeController.getStoresByTag));
router.get('/tags/:tag',catchErrors(storeController.getStoresByTag))

//login route

router.get('/login',userController.loginForm);

//register

router.get('/register',userController.registerForm);

router.post('/register',
userController.validateRegister,
userController.register,
authController.login
);

router.get('/logout',authController.logout);

router.post('/login',authController.login);

router.get('/account',userController.account);
router.post('/account',catchErrors(userController.updateAccount));

//forgot route post
router.post('/account/forgot',catchErrors(authController.forgot));

//resetting account
router.get('/account/reset/:token',catchErrors(authController.reset));

router.post('/account/reset/:token',
authController.confirmedPasswords,
catchErrors(authController.updatePassword));

router.get('/map',storeController.mapPage);
router.get('/hearts',authController.isLoggedIn,catchErrors(storeController.getHearts));
router.post('/reviews/:id',authController.isLoggedIn,catchErrors(reviewController.addReview));

router.get('/top',catchErrors(storeController.getTopStores));

//API

router.get('/api/search',catchErrors(storeController.searchStores));
router.get('/api/stores/near',catchErrors(storeController.mapStores));
router.post('/api/stores/:id/heart',catchErrors(storeController.heartStore));

module.exports = router;
