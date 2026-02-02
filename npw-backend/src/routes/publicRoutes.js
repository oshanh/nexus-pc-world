const express = require('express');
const router = express.Router();

const websiteSettingsController = require('../controllers/websiteSettingsController');

router.get('/website/settings', websiteSettingsController.getPublicWebsiteSettings);
router.get('/promotions/:filename', websiteSettingsController.downloadPromotionImage);
router.get('/team/:filename', websiteSettingsController.downloadTeamMemberImage);

module.exports = router;
