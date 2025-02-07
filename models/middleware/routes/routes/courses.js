const express = require('express');
const multer = require('multer');
const Course = require('../models/Course');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

router.post('/', verifyToken, isAdmin, upload.single('image'), async (req, res) => {
    try {
        const { title, description } = req.body;
        const newCourse = new Course({
            title,
            description,
            image: req.file ? req.file.path : null,
            createdBy: req.user.id
        });
        await newCourse.save();
        res.status(201).json(newCourse);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/', verifyToken, async (req, res) => {
    try {
        const courses = await Course.find();
        res.json(courses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedCourse);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        await Course.findByIdAndDelete(req.params.id);
        res.json({ message: 'Course deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
