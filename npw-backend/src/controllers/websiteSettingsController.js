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
  // Normalize common user input like "x.com/handle" -> "https://x.com/handle".
  // Always return either empty or a http(s) URL.
  const hasScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(s);
  let normalized = '';
  if (hasScheme) {
    normalized = s;
  } else if (s.startsWith('//')) {
    normalized = `https:${s}`;
  } else if (/^[^\s]+\.[^\s]+$/i.test(s)) {
    normalized = `https://${s}`;
  }

  if (!normalized) return '';
  if (!/^https?:\/\//i.test(normalized)) return '';
  return normalized;
};

const normalizeSocialLinks = (v) => {
  const o = v && typeof v === 'object' ? v : {};
  return {
    facebook: normalizeUrl(o.facebook, 800),
    twitter: normalizeUrl(o.twitter, 800),
    instagram: normalizeUrl(o.instagram, 800),
  };
};

const normalizeStringArray = (arr, maxLen = 200) => {
  if (!Array.isArray(arr)) return [];
  return arr
    .map((v) => normalizeString(v, maxLen))
    .filter(Boolean);
};

const normalizeOpeningHours = (arr) => {
  if (!Array.isArray(arr)) return [];
  return arr
    .map((v) => {
      const o = v && typeof v === 'object' ? v : {};
      return {
        days: normalizeString(o.days, 80),
        hours: normalizeString(o.hours, 80),
      };
    })
    .filter((x) => x.days || x.hours);
};

const normalizeLocations = (arr) => {
  if (!Array.isArray(arr)) return [];
  return arr
    .map((v) => {
      const o = v && typeof v === 'object' ? v : {};
      return {
        label: normalizeString(o.label, 80),
        address: normalizeString(o.address, 300),
        mapUrl: normalizeUrl(o.mapUrl, 1000),
      };
    })
    .filter((x) => x.label || x.address || x.mapUrl);
};

const normalizeContactInfo = (v) => {
  const o = v && typeof v === 'object' ? v : {};
  return {
    emails: normalizeStringArray(o.emails, 200),
    phoneNumbers: normalizeStringArray(o.phoneNumbers, 80),
    openingHours: normalizeOpeningHours(o.openingHours),
    locations: normalizeLocations(o.locations),
  };
};

const normalizeFeaturedProducts = (v) => {
  const o = v && typeof v === 'object' ? v : {};
  return {
    desktopProductId: normalizeString(o.desktopProductId, 120),
    laptopProductId: normalizeString(o.laptopProductId, 120),
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

const normalizeFaqPatch = (v) => {
  const o = v && typeof v === 'object' ? v : {};
  const visible = typeof o.visible === 'boolean' ? o.visible : undefined;
  const sortOrderNum = Number(o.sortOrder);
  const sortOrder = Number.isFinite(sortOrderNum) ? Math.trunc(sortOrderNum) : undefined;
  return {
    question: normalizeString(o.question, 200),
    answer: normalizeString(o.answer, 2000),
    ...(visible === undefined ? {} : { visible }),
    ...(sortOrder === undefined ? {} : { sortOrder }),
  };
};

const toFaqResponse = (f) => {
  if (!f) return null;
  return {
    id: String(f.id || ''),
    question: String(f.question || ''),
    answer: String(f.answer || ''),
    visible: Boolean(f.visible),
    sortOrder: Number(f.sortOrder) || 0,
    createdAt: f.createdAt,
  };
};

const normalizeTeamMemberPatch = (v) => {
  const o = v && typeof v === 'object' ? v : {};
  const visible = typeof o.visible === 'boolean' ? o.visible : undefined;
  const sortOrderNum = Number(o.sortOrder);
  const sortOrder = Number.isFinite(sortOrderNum) ? Math.trunc(sortOrderNum) : undefined;
  return {
    name: normalizeString(o.name, 100),
    title: normalizeString(o.title, 100),
    bio: normalizeString(o.bio, 1000),
    ...(visible === undefined ? {} : { visible }),
    ...(sortOrder === undefined ? {} : { sortOrder }),
  };
};

const toTeamMemberResponse = (m) => {
  if (!m) return null;
  const filename = String(m.filename || '').trim();
  return {
    id: String(m.id || ''),
    name: String(m.name || ''),
    title: String(m.title || ''),
    bio: String(m.bio || ''),
    imageUrl: filename ? `/api/public/team/${encodeURIComponent(filename)}` : '',
    visible: Boolean(m.visible),
    sortOrder: Number(m.sortOrder) || 0,
    createdAt: m.createdAt,
  };
};

const toSettingsResponse = (doc, { publicOnly = false } = {}) => {
  const socialLinks = normalizeSocialLinks(doc?.socialLinks);

  const contactInfo = normalizeContactInfo(doc?.contactInfo);
  const featuredProducts = normalizeFeaturedProducts(doc?.featuredProducts);

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

  let faqs = Array.isArray(doc?.faqs) ? doc.faqs : [];
  if (publicOnly) faqs = faqs.filter((f) => Boolean(f?.visible));
  faqs = faqs
    .map(toFaqResponse)
    .filter(Boolean)
    .sort((a, b) => {
      const aSort = Number(a.sortOrder) || 0;
      const bSort = Number(b.sortOrder) || 0;
      if (aSort !== bSort) return aSort - bSort;
      const aTime = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });

  let teamMembers = Array.isArray(doc?.teamMembers) ? doc.teamMembers : [];
  if (publicOnly) teamMembers = teamMembers.filter((m) => Boolean(m?.visible));
  teamMembers = teamMembers
    .map(toTeamMemberResponse)
    .filter(Boolean)
    .sort((a, b) => {
      const aSort = Number(a.sortOrder) || 0;
      const bSort = Number(b.sortOrder) || 0;
      if (aSort !== bSort) return aSort - bSort;
      const aTime = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });

  return { socialLinks, contactInfo, featuredProducts, promotions, faqs, teamMembers };
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

    const update = {};
    if (payload && typeof payload === 'object') {
      if (Object.hasOwn(payload, 'socialLinks')) {
        update.socialLinks = normalizeSocialLinks(payload?.socialLinks);
      }
      if (Object.hasOwn(payload, 'contactInfo')) {
        update.contactInfo = normalizeContactInfo(payload?.contactInfo);
      }
      if (Object.hasOwn(payload, 'featuredProducts')) {
        update.featuredProducts = normalizeFeaturedProducts(payload?.featuredProducts);
      }
    }

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

const createFaq = async (req, res) => {
  try {
    const patch = normalizeFaqPatch(req.body || {});
    if (!patch.question) return res.status(400).json({ message: 'Question is required' });
    if (!patch.answer) return res.status(400).json({ message: 'Answer is required' });

    const faq = {
      id: crypto.randomUUID(),
      question: patch.question,
      answer: patch.answer,
      visible: typeof patch.visible === 'boolean' ? patch.visible : true,
      sortOrder: Number(patch.sortOrder) || 0,
      createdAt: new Date(),
    };

    const doc = await WebsiteSettings.findOneAndUpdate(
      { key: SETTINGS_KEY },
      { $setOnInsert: { key: SETTINGS_KEY }, $push: { faqs: faq } },
      { upsert: true, new: true }
    ).lean();

    const created = (doc?.faqs || []).find((f) => f?.id === faq.id) || faq;
    return res.json({ faq: toFaqResponse(created) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to create FAQ' });
  }
};

const updateFaq = async (req, res) => {
  try {
    const faqId = normalizeString(req.params.faqId, 120);
    if (!faqId) return res.status(400).json({ message: 'FAQ ID is required' });

    const patch = normalizeFaqPatch(req.body || {});

    const doc = await WebsiteSettings.findOne({ key: SETTINGS_KEY }).select('faqs').lean();
    if (!doc) return res.status(404).json({ message: 'Settings not found' });

    const faqs = Array.isArray(doc.faqs) ? doc.faqs : [];
    const idx = faqs.findIndex((f) => String(f?.id) === faqId);
    if (idx < 0) return res.status(404).json({ message: 'FAQ not found' });

    faqs[idx] = { ...faqs[idx], ...patch };

    const saved = await WebsiteSettings.findOneAndUpdate(
      { key: SETTINGS_KEY },
      { $set: { faqs } },
      { new: true }
    ).lean();

    const updated = (saved?.faqs || []).find((f) => String(f?.id) === faqId);
    return res.json({ faq: toFaqResponse(updated) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to update FAQ' });
  }
};

const deleteFaq = async (req, res) => {
  try {
    const faqId = normalizeString(req.params.faqId, 120);
    if (!faqId) return res.status(400).json({ message: 'FAQ ID is required' });

    const doc = await WebsiteSettings.findOne({ key: SETTINGS_KEY }).select('faqs').lean();
    if (!doc) return res.status(404).json({ message: 'Settings not found' });

    const faqs = Array.isArray(doc.faqs) ? doc.faqs : [];
    if (!faqs.some((f) => String(f?.id) === faqId)) return res.status(404).json({ message: 'FAQ not found' });

    const next = faqs.filter((f) => String(f?.id) !== faqId);
    await WebsiteSettings.findOneAndUpdate({ key: SETTINGS_KEY }, { $set: { faqs: next } }, { new: true }).lean();

    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to delete FAQ' });
  }
};

const getPromotionsUploadDir = () => path.join(__dirname, '..', '..', 'uploads', 'promotions');

const ensurePromotionsDir = () => {
  const dir = getPromotionsUploadDir();
  try {
    fs.mkdirSync(dir, { recursive: true });
  } catch { }
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
      } catch { }
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

const getTeamUploadDir = () => path.join(__dirname, '..', '..', 'uploads', 'team');

const ensureTeamDir = () => {
  const dir = getTeamUploadDir();
  try {
    fs.mkdirSync(dir, { recursive: true });
  } catch { }
  return dir;
};

const createTeamMember = async (req, res) => {
  try {
    const patch = normalizeTeamMemberPatch(req.body || {});
    if (!patch.name) return res.status(400).json({ message: 'Name is required' });

    const member = {
      id: crypto.randomUUID(),
      name: patch.name,
      title: patch.title || '',
      bio: patch.bio || '',
      filename: '',
      visible: typeof patch.visible === 'boolean' ? patch.visible : true,
      sortOrder: Number(patch.sortOrder) || 0,
      createdAt: new Date(),
    };

    const doc = await WebsiteSettings.findOneAndUpdate(
      { key: SETTINGS_KEY },
      { $setOnInsert: { key: SETTINGS_KEY }, $push: { teamMembers: member } },
      { upsert: true, new: true }
    ).lean();

    const created = (doc?.teamMembers || []).find((m) => m?.id === member.id) || member;
    return res.json({ teamMember: toTeamMemberResponse(created) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to create team member' });
  }
};

const updateTeamMember = async (req, res) => {
  try {
    const memberId = normalizeString(req.params.memberId, 120);
    if (!memberId) return res.status(400).json({ message: 'Member ID is required' });

    const patch = normalizeTeamMemberPatch(req.body || {});

    const doc = await WebsiteSettings.findOne({ key: SETTINGS_KEY }).select('teamMembers').lean();
    if (!doc) return res.status(404).json({ message: 'Settings not found' });

    const members = Array.isArray(doc.teamMembers) ? doc.teamMembers : [];
    const idx = members.findIndex((m) => String(m?.id) === memberId);
    if (idx < 0) return res.status(404).json({ message: 'Team member not found' });

    members[idx] = { ...members[idx], ...patch };

    const saved = await WebsiteSettings.findOneAndUpdate(
      { key: SETTINGS_KEY },
      { $set: { teamMembers: members } },
      { new: true }
    ).lean();

    const updated = (saved?.teamMembers || []).find((m) => String(m?.id) === memberId);
    return res.json({ teamMember: toTeamMemberResponse(updated) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to update team member' });
  }
};

const deleteTeamMember = async (req, res) => {
  try {
    const memberId = normalizeString(req.params.memberId, 120);
    if (!memberId) return res.status(400).json({ message: 'Member ID is required' });

    const doc = await WebsiteSettings.findOne({ key: SETTINGS_KEY }).select('teamMembers').lean();
    if (!doc) return res.status(404).json({ message: 'Settings not found' });

    const members = Array.isArray(doc.teamMembers) ? doc.teamMembers : [];
    const toDelete = members.find((m) => String(m?.id) === memberId);
    if (!toDelete) return res.status(404).json({ message: 'Team member not found' });

    const next = members.filter((m) => String(m?.id) !== memberId);
    await WebsiteSettings.findOneAndUpdate({ key: SETTINGS_KEY }, { $set: { teamMembers: next } }, { new: true }).lean();

    // Best-effort remove the file if it exists and is no longer used.
    const filename = String(toDelete?.filename || '').trim();
    if (filename && !next.some((m) => String(m?.filename || '') === filename)) {
      const filePath = path.join(ensureTeamDir(), filename);
      try {
        fs.unlinkSync(filePath);
      } catch { }
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to delete team member' });
  }
};

const uploadTeamMemberImage = async (req, res) => {
  try {
    const memberId = normalizeString(req.params.memberId, 120);
    if (!memberId) return res.status(400).json({ message: 'Member ID is required' });

    const file = req.file;
    if (!file?.filename) return res.status(400).json({ message: 'Image file is required' });

    const doc = await WebsiteSettings.findOne({ key: SETTINGS_KEY }).select('teamMembers').lean();
    if (!doc) return res.status(404).json({ message: 'Settings not found' });

    const members = Array.isArray(doc.teamMembers) ? doc.teamMembers : [];
    const idx = members.findIndex((m) => String(m?.id) === memberId);
    if (idx < 0) return res.status(404).json({ message: 'Team member not found' });

    const oldFilename = members[idx].filename;
    members[idx].filename = file.filename;

    const saved = await WebsiteSettings.findOneAndUpdate(
      { key: SETTINGS_KEY },
      { $set: { teamMembers: members } },
      { new: true }
    ).lean();

    // Cleanup old file if it changed and is no longer used.
    if (oldFilename && oldFilename !== file.filename && !members.some(m => m.filename === oldFilename)) {
      const oldPath = path.join(ensureTeamDir(), oldFilename);
      try { fs.unlinkSync(oldPath); } catch { }
    }

    const updated = (saved?.teamMembers || []).find((m) => String(m?.id) === memberId);
    return res.json({ teamMember: toTeamMemberResponse(updated) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to upload team member image' });
  }
};

const downloadTeamMemberImage = async (req, res) => {
  try {
    const filename = String(req.params.filename || '').trim();
    if (!filename) return res.status(400).json({ message: 'Filename is required' });

    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ message: 'Invalid filename' });
    }

    const filePath = path.join(ensureTeamDir(), filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'File not found' });

    return res.sendFile(filePath);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to download team member image' });
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
  createFaq,
  updateFaq,
  deleteFaq,
  downloadPromotionImage,
  ensureTeamDir,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  uploadTeamMemberImage,
  downloadTeamMemberImage,
};
