const prisma = require('../config/database');

// Get all daily records with optional filters
exports.getAllRecords = async (req, res, next) => {
  try {
    const { batchId, startDate, endDate } = req.query;
    
    const where = {};
    if (batchId) where.batchId = parseInt(batchId);
    if (startDate || endDate) {
      where.recordDate = {};
      if (startDate) where.recordDate.gte = new Date(startDate);
      if (endDate) where.recordDate.lte = new Date(endDate);
    }
    
    const records = await prisma.dailyRecord.findMany({
      where,
      include: { batch: true },
      orderBy: { recordDate: 'desc' }
    });
    
    res.json(records);
  } catch (error) {
    next(error);
  }
};

// Get single record
exports.getRecordById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const record = await prisma.dailyRecord.findUnique({
      where: { id: parseInt(id) },
      include: { batch: true }
    });
    
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    
    res.json(record);
  } catch (error) {
    next(error);
  }
};

// Create new daily record
exports.createRecord = async (req, res, next) => {
  try {
    const {
      batchId,
      recordDate,
      mortality,
      feedConsumption,
      eggProduction,
      eggWeight,
      rejectedEggs,
      avgWeight,
      expenses,
      revenue,
      notes
    } = req.body;
    
    const record = await prisma.dailyRecord.create({
      data: {
        batchId: parseInt(batchId),
        recordDate: new Date(recordDate),
        mortality: mortality || 0,
        feedConsumption: feedConsumption || 0,
        eggProduction: eggProduction || 0,
        eggWeight: eggWeight || 0,
        rejectedEggs: rejectedEggs || 0,
        avgWeight: avgWeight || 0,
        expenses: expenses || 0,
        revenue: revenue || 0,
        notes
      }
    });
    
    res.status(201).json(record);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Record for this batch and date already exists' });
    }
    next(error);
  }
};

// Update record
exports.updateRecord = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    // Convert date if present
    if (updateData.recordDate) {
      updateData.recordDate = new Date(updateData.recordDate);
    }
    
    // Convert batchId if present
    if (updateData.batchId) {
      updateData.batchId = parseInt(updateData.batchId);
    }
    
    const record = await prisma.dailyRecord.update({
      where: { id: parseInt(id) },
      data: updateData
    });
    
    res.json(record);
  } catch (error) {
    next(error);
  }
};

// Delete record
exports.deleteRecord = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    await prisma.dailyRecord.delete({
      where: { id: parseInt(id) }
    });
    
    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    next(error);
  }
};
