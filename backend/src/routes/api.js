const express = require('express');
const router = express.Router();

const batchController = require('../controllers/batchController');
const recordController = require('../controllers/recordController');
const kpiController = require('../controllers/kpiController');
const settingsController = require('../controllers/settingsController');

// ===== BATCH ROUTES =====
router.get('/batches', batchController.getAllBatches);
router.get('/batches/:id', batchController.getBatchById);
router.post('/batches', batchController.createBatch);
router.put('/batches/:id', batchController.updateBatch);
router.delete('/batches/:id', batchController.deleteBatch);

// ===== DAILY RECORDS ROUTES =====
router.get('/records', recordController.getAllRecords);
router.get('/records/:id', recordController.getRecordById);
router.post('/records', recordController.createRecord);
router.put('/records/:id', recordController.updateRecord);
router.delete('/records/:id', recordController.deleteRecord);

// ===== KPI & ANALYTICS ROUTES =====
router.get('/kpis', kpiController.getKPIs);
router.get('/analytics/monthly-eggs', kpiController.getMonthlyEggs);
router.get('/analytics/monthly-finance', kpiController.getMonthlyFinance);
router.get('/analytics/cost-per-duck', kpiController.getCostPerDuck);

// ===== SETTINGS ROUTES =====
router.get('/settings', settingsController.getAllSettings);
router.put('/settings/:key', settingsController.updateSetting);
router.post('/settings/initialize', settingsController.initializeSettings);

module.exports = router;
