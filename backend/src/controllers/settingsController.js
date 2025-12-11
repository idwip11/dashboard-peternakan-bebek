const prisma = require('../config/database');

// Get all settings
exports.getAllSettings = async (req, res, next) => {
  try {
    const settings = await prisma.setting.findMany();
    
    // Convert to key-value object
    const settingsObj = {};
    settings.forEach(s => {
      settingsObj[s.settingKey] = s.settingValue;
    });
    
    res.json(settingsObj);
  } catch (error) {
    next(error);
  }
};

// Update a setting
exports.updateSetting = async (req, res, next) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    
    const setting = await prisma.setting.upsert({
      where: { settingKey: key },
      update: { settingValue: value },
      create: { settingKey: key, settingValue: value }
    });
    
    res.json(setting);
  } catch (error) {
    next(error);
  }
};

// Initialize default settings
exports.initializeSettings = async (req, res, next) => {
  try {
    const defaultSettings = [
      { settingKey: 'whatsapp_number', settingValue: '' },
      { settingKey: 'mortality_threshold', settingValue: '1.5' },
      { settingKey: 'fcr_threshold', settingValue: '2.0' },
      { settingKey: 'hdp_threshold', settingValue: '70' },
      { settingKey: 'stock_threshold', settingValue: '3' }
    ];
    
    for (const setting of defaultSettings) {
      await prisma.setting.upsert({
        where: { settingKey: setting.settingKey },
        update: {},
        create: setting
      });
    }
    
    res.json({ message: 'Default settings initialized' });
  } catch (error) {
    next(error);
  }
};
