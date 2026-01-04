const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');

const WebsiteSettings = require('../models/WebsiteSettings');

const SETTINGS_KEY = 'default';

const normalizeString = (v, maxLen = 500) => {
  const s = String(v ?? '').trim();
  if (!s) return '';
  return s.length > maxLen ? s.slice(0, maxLen) : s;
};

const normalizeUrl = (v, maxLen = 800) => {
  const s = normalizeString(v, maxLen);
  if (!s) return '';
  // Allow empty or http(s) URLs only.
  if (!/^https?:\/\//i.test(s)) return '';
  return s;
};

const normalizeSocialLinks = (v) => {
  const o = v && typeof v === 'object' ? v : {};
  return {
    facebook: normalizeUrl(o.facebook, 800),
    twitter: normalizeUrl(o.twitter, 800),
    instagram: normalizeUrl(o.instagram, 800),
  };
};

const normalizePromotionPatch = (v) => {
  const o = v && typeof v === 'object' ? v : {};
  const visible = typeof o.visible === 'boolean' ? o.visible : undefined;
  const sortOrderNum = Number(o.sortOrder);
  const sortOrder = Number.isFinite(sortOrderNum) ? Math.trunc(sortOrderNum) : undefined;
  return {
    alt: normalizeString(o.alt, 200),
    ...(visible === undefined ? {} : { visible }),
    ...(sortOrder === undefined ? {} : { sortOrder }),
  };
};

const toPromotionResponse = (p) => {
  if (!p) return null;
  const filename = String(p.filename || '').trim();
  return {
    id: String(p.id || ''),
    imageUrl: filename ? `/api/public/promotions/${encodeURIComponent(filename)}` : '',
    alt: String(p.alt || ''),
    visible: Boolean(p.visible),
    sortOrder: Number(p.sortOrder) || 0,
    createdAt: p.createdAt,
  };
};

const toSettingsResponse = (doc, { publicOnly = false } = {}) => {
  const socialLinks = normalizeSocialLinks(doc?.socialLinks);

  let promotions = Array.isArray(doc?.promotions) ? doc.promotions : [];
  if (publicOnly) promotions = promotions.filter((p) => Boolean(p?.visible));

  promotions = promotions
    .map(toPromotionResponse)
    .filter(Boolean)
    .sort((a, b) => {
      const aSort = Number(a.sortOrder) || 0;
      const bSort = Number(b.sortOrder) || 0;
      if (aSort !== bSort) return aSort - bSort;
      const aTime = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });

  return { socialLinks, promotions };
};

const getPublicWebsiteSettings = async (_req, res) => {
  try {
    const doc = await WebsiteSettings.findOne({ key: SETTINGS_KEY }).lean();
    return res.json({ settings: toSettingsResponse(doc || {}, { publicOnly: true }) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to load website settings' });
  }
};

const getAdminWebsiteSettings = async (_req, res) => {
  try {
    const doc = await WebsiteSettings.findOne({ key: SETTINGS_KEY }).lean();
    return res.json({ settings: toSettingsResponse(doc || {}, { publicOnly: false }) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to load website settings' });
  }
};

const updateAdminWebsiteSettings = async (req, res) => {
  try {
    const payload = req.body?.settings && typeof req.body.settings === 'object' ? req.body.settings : req.body;

    const socialLinks = normalizeSocialLinks(payload?.socialLinks);

    const update = { socialLinks };

    const doc = await WebsiteSettings.findOneAndUpdate(
      { key: SETTINGS_KEY },
      { $set: { key: SETTINGS_KEY, ...update } },
      { upsert: true, new: true }
    ).lean();

    return res.json({ settings: toSettingsResponse(doc || {}, { publicOnly: false }) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to update website settings' });
  }
};

const getPromotionsUploadDir = () => path.join(__dirname, '..', '..', 'uploads', 'promotions');

const ensurePromotionsDir = () => {
  const dir = getPromotionsUploadDir();
  try {
    fs.mkdirSync(dir, { recursive: true });
  } catch {}
  return dir;
};

const uploadPromotionImage = async (req, res) => {
  try {
    const file = req.file;
    if (!file?.filename) return res.status(400).json({ message: 'Image file is required' });

    const alt = normalizeString(req.body?.alt, 200);
    const visible = String(req.body?.visible || '').trim() !== 'false';

    const promotion = {
      id: crypto.randomUUID(),
      filename: String(file.filename),
      alt,
      visible,
      sortOrder: 0,
      createdAt: new Date(),
    };

    const doc = await WebsiteSettings.findOneAndUpdate(
      { key: SETTINGS_KEY },
      { $setOnInsert: { key: SETTINGS_KEY }, $push: { promotions: promotion } },
      { upsert: true, new: true }
    ).lean();

    const created = (doc?.promotions || []).find((p) => p?.id === promotion.id) || promotion;

    return res.json({ promotion: toPromotionResponse(created) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to upload promotion image' });
  }
};

const updatePromotion = async (req, res) => {
  try {
    const promotionId = normalizeString(req.params.promotionId, 120);
    if (!promotionId) return res.status(400).json({ message: 'Promotion ID is required' });

    const patch = normalizePromotionPatch(req.body || {});

    const doc = await WebsiteSettings.findOne({ key: SETTINGS_KEY }).select('promotions').lean();
    if (!doc) return res.status(404).json({ message: 'Settings not found' });

    const promotions = Array.isArray(doc.promotions) ? doc.promotions : [];
    const idx = promotions.findIndex((p) => String(p?.id) === promotionId);
    if (idx < 0) return res.status(404).json({ message: 'Promotion not found' });

    promotions[idx] = { ...promotions[idx], ...patch };

    const saved = await WebsiteSettings.findOneAndUpdate(
      { key: SETTINGS_KEY },
      { $set: { promotions } },
      { new: true }
    ).lean();

    const updated = (saved?.promotions || []).find((p) => String(p?.id) === promotionId);

    return res.json({ promotion: toPromotionResponse(updated) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to update promotion' });
  }
};

const deletePromotion = async (req, res) => {
  try {
    const promotionId = normalizeString(req.params.promotionId, 120);
    if (!promotionId) return res.status(400).json({ message: 'Promotion ID is required' });

    const doc = await WebsiteSettings.findOne({ key: SETTINGS_KEY }).select('promotions').lean();
    if (!doc) return res.status(404).json({ message: 'Settings not found' });

    const promotions = Array.isArray(doc.promotions) ? doc.promotions : [];
    const toDelete = promotions.find((p) => String(p?.id) === promotionId);
    if (!toDelete) return res.status(404).json({ message: 'Promotion not found' });

    const next = promotions.filter((p) => String(p?.id) !== promotionId);

    await WebsiteSettings.findOneAndUpdate({ key: SETTINGS_KEY }, { $set: { promotions: next } }, { new: true }).lean();

    // Best-effort remove the file if no other promotions reference it.
    const filename = String(toDelete?.filename || '').trim();
    if (filename && !next.some((p) => String(p?.filename || '') === filename)) {
      const filePath = path.join(ensurePromotionsDir(), filename);
      try {
        fs.unlinkSync(filePath);
      } catch {}
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to delete promotion' });
  }
};

const downloadPromotionImage = async (req, res) => {
  try {
    const filename = String(req.params.filename || '').trim();
    if (!filename) return res.status(400).json({ message: 'Filename is required' });

    // Prevent path traversal.
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ message: 'Invalid filename' });
    }

    const filePath = path.join(ensurePromotionsDir(), filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'File not found' });

    return res.sendFile(filePath);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to download promotion image' });
  }
};

module.exports = {
  ensurePromotionsDir,
  getPublicWebsiteSettings,
  getAdminWebsiteSettings,
  updateAdminWebsiteSettings,
  uploadPromotionImage,
  updatePromotion,
  deletePromotion,
  downloadPromotionImage,
};
