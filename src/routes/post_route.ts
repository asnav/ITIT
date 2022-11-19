import express from 'express';

import post from '../controllers/post';

const router = express.Router();

router.get('/', post.getAllPosts);

router.get('/:id', post.getPostById);

router.post('/', post.addNewPost);

router.put('/:id', post.putPostById);

export default router;