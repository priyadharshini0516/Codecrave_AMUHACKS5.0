const express = require('express');
const {
    getSubjects,
    getSubject,
    createSubject,
    updateSubject,
    deleteSubject,
    markTopicComplete,
} = require('../controllers/subjectController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/').get(protect, getSubjects).post(protect, createSubject);

router
    .route('/:id')
    .get(protect, getSubject)
    .put(protect, updateSubject)
    .delete(protect, deleteSubject);

router.put('/:id/topics/:topicId/complete', protect, markTopicComplete);

module.exports = router;
