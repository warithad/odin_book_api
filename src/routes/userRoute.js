const express = require('express')
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/friends/request', userController.friend_request_POST)
router.put('/friends/accept', userController.accept_request_PUT)
router.delete('/friends/reject', userController.reject_request_DELETE)


router.put('/update', userController.update_user_PUT)
router.get('/:id', userController.get_user_GET)
router.get('/', userController.all_users_GET)