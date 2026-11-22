const express = require('express');
const healthRoutes = require('./health.routes');

const router = express.Router();

// Health check route
router.use('/health', healthRoutes);

// Future module routes will be mounted here:
// router.use('/auth', authRoutes);
// router.use('/verses', verseRoutes);
// router.use('/streaks', streakRoutes);
// router.use('/admin', adminRoutes);

module.exports = router;
