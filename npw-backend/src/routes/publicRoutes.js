const express = require('express');
const router = express.Router();

const websiteSettingsController = require('../controllers/websiteSettingsController');

router.get('/website/settings', websiteSettingsController.getPublicWebsiteSettings);
router.get('/promotions/:filename', websiteSettingsController.downloadPromotionImage);

module.exports = router;
