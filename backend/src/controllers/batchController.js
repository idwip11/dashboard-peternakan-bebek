const prisma = require('../config/database');

// Get all batches
exports.getAllBatches = async (req, res, next) => {
  try {
    const batches = await prisma.batch.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(batches);
  } catch (error) {
    next(error);
  }
};

// Get single batch
exports.getBatchById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const batch = await prisma.batch.findUnique({
      where: { id: parseInt(id) },
      include: { dailyRecords: true }
    });
    
    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }
    
    res.json(batch);
  } catch (error) {
    next(error);
  }
};

// Create new batch
exports.createBatch = async (req, res, next) => {
  try {
    const { name, type, startDate, population, initialPopulation, age, status } = req.body;
    
    const batch = await prisma.batch.create({
      data: {
        name,
        type,
        startDate: new Date(startDate),
        population,
        initialPopulation,
        age,
        status: status || 'AKTIF'
      }
    });
    
    res.status(201).json(batch);
  } catch (error) {
    next(error);
  }
};

// Update batch
exports.updateBatch = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, type, startDate, population, initialPopulation, age, status } = req.body;
    
    const batch = await prisma.batch.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(type && { type }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(population !== undefined && { population }),
        ...(initialPopulation !== undefined && { initialPopulation }),
        ...(age !== undefined && { age }),
        ...(status && { status })
      }
    });
    
    res.json(batch);
  } catch (error) {
    next(error);
  }
};

// Delete batch
exports.deleteBatch = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    await prisma.batch.delete({
      where: { id: parseInt(id) }
    });
    
    res.json({ message: 'Batch deleted successfully' });
  } catch (error) {
    next(error);
  }
};
