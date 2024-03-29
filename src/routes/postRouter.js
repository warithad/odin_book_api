const express = require('express')
const router = express.Router()
const post_controller = require('../controllers/postController')
const getTokenData = require('../utils/getTokenData')


router.use(getTokenData);
router.post('/comments/:postId', post_controller.add_comment_POST)
router.delete('/comments/:commentId', post_controller.delete_comment_DELETE)
router.put('/comments/:commentId/likes', post_controller.like_comment_PUT)

router.put('/:postId/likes', post_controller.like_post_PUT)
router.delete('/:id', post_controller.post_delete_DELETE)
router.get('/:id', post_controller.post_GET)
router.post('/', post_controller.create_post_POST)
router.get('/', post_controller.get_posts_POST)

module.exports = router;