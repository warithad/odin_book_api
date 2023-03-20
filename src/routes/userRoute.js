const express = require('express')
const router = express.Router();
const userController = require('../controllers/userController');
const getTokenData = require('../utils/getTokenData')


router.use(getTokenData);
router.post('/friends/', userController.friend_request_POST)
router.put('/friends/', userController.accept_request_PUT)
router.delete('/friends/', userController.reject_request_DELETE)


router.delete('/', userController.delete_user_DELETE)
router.put('/', userController.update_user_PUT)
router.get('/:id', userController.get_user_GET)
router.get('/', userController.all_users_GET)

module.exports = router;
