const prisma = require('../config/database');

// Calculate all KPIs from database
exports.getKPIs = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));
    
    // Get all batches
    const batches = await prisma.batch.findMany({
      where: { status: 'AKTIF' }
    });
    
    const totalPopulation = batches.reduce((sum, b) => sum + b.population, 0);
    
    // Get daily records for the period
    const records = await prisma.dailyRecord.findMany({
      where: {
        recordDate: { gte: daysAgo }
      },
      orderBy: { recordDate: 'asc' }
    });
    
    if (records.length === 0) {
      return res.json({
        totalPopulation,
        avgMortality: 0,
        avgFCR: 0,
        avgHDP: 0,
        totalRevenue: 0,
        totalCost: 0,
        profit: 0,
        profitMargin: 0
      });
    }
    
    // Calculate averages
    const totalMortality = records.reduce((sum, r) => sum + r.mortality, 0);
    const avgMortality = (totalMortality / records.length / totalPopulation * 100).toFixed(2);
    
    // Calculate FCR (Feed Conversion Ratio)
    const totalFeed = records.reduce((sum, r) => sum + parseFloat(r.feedConsumption), 0);
    const totalWeight = records.reduce((sum, r) => sum + parseFloat(r.avgWeight), 0);
    const avgFCR = totalWeight > 0 ? (totalFeed / totalWeight).toFixed(2) : 0;
    
    // Calculate HDP (Hen Day Production)
    const totalEggs = records.reduce((sum, r) => sum + r.eggProduction, 0);
    const avgHDP = ((totalEggs / records.length / totalPopulation) * 100).toFixed(1);
    
    // Financial metrics
    const totalRevenue = records.reduce((sum, r) => sum + parseFloat(r.revenue), 0);
    const totalCost = records.reduce((sum, r) => sum + parseFloat(r.expenses), 0);
    const profit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? ((profit / totalRevenue) * 100).toFixed(1) : 0;
    
    res.json({
      totalPopulation,
      avgMortality,
      avgFCR,
      avgHDP,
      totalRevenue: parseFloat(totalRevenue),
      totalCost: parseFloat(totalCost),
      profit: parseFloat(profit),
      profitMargin: parseFloat(profitMargin)
    });
  } catch (error) {
    next(error);
  }
};

// Get monthly egg production trend
exports.getMonthlyEggs = async (req, res, next) => {
  try {
    const { months = 6 } = req.query;
    
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(months));
    
    const records = await prisma.dailyRecord.findMany({
      where: {
        recordDate: { gte: startDate }
      },
      orderBy: { recordDate: 'asc' }
    });
    
    // Aggregate by month
    const monthlyData = {};
    records.forEach(record => {
      const date = new Date(record.recordDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: date.toLocaleDateString('id-ID', { year: 'numeric', month: 'short' }),
          totalEggs: 0
        };
      }
      
      monthlyData[monthKey].totalEggs += record.eggProduction;
    });
    
    const result = Object.keys(monthlyData)
      .sort()
      .map(key => monthlyData[key]);
    
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Get monthly financial trend
exports.getMonthlyFinance = async (req, res, next) => {
  try {
    const { months = 6 } = req.query;
    
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(months));
    
    const records = await prisma.dailyRecord.findMany({
      where: {
        recordDate: { gte: startDate }
      },
      orderBy: { recordDate: 'asc' }
    });
    
    // Aggregate by month
    const monthlyData = {};
    records.forEach(record => {
      const date = new Date(record.recordDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: date.toLocaleDateString('id-ID', { year: 'numeric', month: 'short' }),
          revenue: 0,
          expenses: 0,
          profit: 0
        };
      }
      
      const rev = parseFloat(record.revenue) || 0;
      const exp = parseFloat(record.expenses) || 0;
      
      monthlyData[monthKey].revenue += rev;
      monthlyData[monthKey].expenses += exp;
      monthlyData[monthKey].profit += (rev - exp);
    });
    
    const result = Object.keys(monthlyData)
      .sort()
      .map(key => monthlyData[key]);
    
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Get cost per duck
exports.getCostPerDuck = async (req, res, next) => {
  try {
    const batches = await prisma.batch.findMany({
      where: { status: 'AKTIF' }
    });
    
    const totalPopulation = batches.reduce((sum, b) => sum + b.population, 0);
    
    if (totalPopulation === 0) {
      return res.json({ costPerDuck: 0, trend: 0 });
    }
    
    // Based on cost breakdown: Pakan (65%) + Tenaga Kerja (10%)
    const feedCost = 19500000; // Monthly
    const laborCost = 3000000; // Monthly
    const totalProductionCost = feedCost + laborCost;
    
    const costPerDuckPerDay = Math.round(totalProductionCost / 30 / totalPopulation);
    
    res.json({
      costPerDuck: costPerDuckPerDay,
      trend: -8 // Simulated trend
    });
  } catch (error) {
    next(error);
  }
};
