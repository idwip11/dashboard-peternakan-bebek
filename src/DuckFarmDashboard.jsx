import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, AlertCircle, Calendar, Package, Download, Bell, Target, ChevronDown, CheckCircle } from 'lucide-react';
import { batchAPI, recordAPI, analyticsAPI, settingsAPI } from './services/api';

const DuckFarmDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dailyData, setDailyData] = useState([]);
  const [batchData, setBatchData] = useState([]);
  const [kpis, setKpis] = useState({});
  const [monthlyEggData, setMonthlyEggData] = useState([]);
  const [monthlyFinanceData, setMonthlyFinanceData] = useState([]);
  const [costPerDuckData, setCostPerDuckData] = useState({ costPerDuck: 0, trend: 0 });
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [alertSettings, setAlertSettings] = useState({
    mortalityThreshold: 1.5,
    fcrThreshold: 2.0,
    hdpThreshold: 70,
    stockThreshold: 3
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Industry standards for comparison
  const industryStandards = {
    pedaging: {
      fcr: 1.8,
      mortalityRate: 2.5,
      harvestAge: 45,
      harvestWeight: 1.6
    },
    petelur: {
      fcr: 2.3,
      mortalityRate: 3.0,
      hdp: 80,
      eggWeight: 70
    }
  };
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    batchId: 1,
    mortality: 0,
    feedConsumption: 0,
    eggProduction: 0,
    eggWeight: 0,
    rejectedEggs: 0,
    avgWeight: 0,
    expenses: 0,
    revenue: 0,
    notes: ''
  });

  // Fetch all data from backend on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all data in parallel
        const [batches, records, kpisData, monthlyEggs, monthlyFinance, costPerDuck, settings] = await Promise.all([
          batchAPI.getAll(),
          recordAPI.getAll(),
          analyticsAPI.getKPIs(30),
          analyticsAPI.getMonthlyEggs(6),
          analyticsAPI.getMonthlyFinance(6),
          analyticsAPI.getCostPerDuck(),
          settingsAPI.getAll()
        ]);
        
        // Fix data types for charts - Ensure numbers are actually numbers
        const cleanRecords = records.map(r => ({
          ...r,
          mortality: Number(r.mortality),
          feedConsumption: Number(r.feedConsumption),
          eggProduction: Number(r.eggProduction),
          fcr: Number(r.feedConsumption) / (Number(r.avgWeight) || Number(r.eggProduction)/20),
          hdp: (Number(r.eggProduction) / batches.find(b => b.id === r.batchId)?.population * 100) || 0,
          revenue: Number(r.revenue),
          cost: Number(r.expenses) // Map expenses to cost for chart
        })).sort((a, b) => new Date(a.recordDate) - new Date(b.recordDate)); // Sort by date ascending

        setBatchData(batches);
        setDailyData(cleanRecords);
        setKpis(kpisData);
        setMonthlyEggData(monthlyEggs);
        setMonthlyFinanceData(monthlyFinance);
        setCostPerDuckData(costPerDuck);
        
        // Set settings
        if (settings.whatsapp_number) setWhatsappNumber(settings.whatsapp_number);
        if (settings.mortality_threshold) {
          setAlertSettings(prev => ({
            ...prev,
            mortalityThreshold: parseFloat(settings.mortality_threshold),
            fcrThreshold: parseFloat(settings.fcr_threshold),
            hdpThreshold: parseFloat(settings.hdp_threshold),
            stockThreshold: parseFloat(settings.stock_threshold)
          }));
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Export to Excel function
  const exportToExcel = () => {
    // Prepare data for export
    const exportData = {
      summary: {
        'Total Populasi': kpis.totalPopulation,
        'Mortalitas Rata-rata': `${kpis.avgMortality}%`,
        'FCR Rata-rata': kpis.avgFCR,
        'HDP Rata-rata': `${kpis.avgHDP}%`,
        'Total Revenue (30 hari)': `Rp ${(kpis.totalRevenue / 1000000).toFixed(2)} juta`,
        'Total Biaya (30 hari)': `Rp ${(kpis.totalCost / 1000000).toFixed(2)} juta`,
        'Profit Margin': `${kpis.profitMargin}%`
      },
      dailyRecords: dailyData.slice(-30),
      batches: batchData
    };

    // Create CSV content
    let csv = 'RINGKASAN KPI\n';
    Object.entries(exportData.summary).forEach(([key, value]) => {
      csv += `${key},${value}\n`;
    });
    
    csv += '\n\nDATA HARIAN (30 HARI TERAKHIR)\n';
    csv += 'Tanggal,Mortalitas,Konsumsi Pakan,Produksi Telur,FCR,HDP,Revenue,Biaya\n';
    exportData.dailyRecords.forEach(row => {
      csv += `${row.date},${row.mortality},${row.feedConsumption},${row.eggProduction},${row.fcr?.toFixed(2)},${row.hdp?.toFixed(1)},${row.revenue},${row.cost}\n`;
    });
    
    csv += '\n\nDATA KANDANG/BATCH\n';
    csv += 'Nama,Tipe,Tanggal Mulai,Populasi,Populasi Awal,Umur,Status\n';
    exportData.batches.forEach(batch => {
      csv += `${batch.name},${batch.type},${batch.startDate},${batch.population},${batch.initialPop},${batch.age},${batch.status}\n`;
    });

    // Download CSV
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `peternakan-bebek-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // WhatsApp Alert function
  const sendWhatsAppAlert = (message) => {
    if (!whatsappNumber) {
      alert('Silakan set nomor WhatsApp di tab Pengaturan terlebih dahulu');
      return;
    }
    const cleanNumber = whatsappNumber.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Check alerts
  const checkAlerts = () => {
    const alerts = [];
    if (parseFloat(kpis.avgMortality) > alertSettings.mortalityThreshold) {
      alerts.push(`⚠️ ALERT: Mortalitas tinggi ${kpis.avgMortality}%`);
    }
    if (parseFloat(kpis.avgFCR) > alertSettings.fcrThreshold) {
      alerts.push(`⚠️ ALERT: FCR tinggi ${kpis.avgFCR}`);
    }
    if (parseFloat(kpis.avgHDP) < alertSettings.hdpThreshold) {
      alerts.push(`⚠️ ALERT: HDP rendah ${kpis.avgHDP}%`);
    }
    return alerts;
  };

  // Cost breakdown data
  const costBreakdown = [
    { name: 'Pakan', value: 65, amount: 19500000 },
    { name: 'DOD', value: 15, amount: 4500000 },
    { name: 'Tenaga Kerja', value: 10, amount: 3000000 },
    { name: 'Obat & Vitamin', value: 5, amount: 1500000 },
    { name: 'Operasional', value: 5, amount: 1500000 }
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Prepare data for API
      const newRecord = {
        batchId: parseInt(formData.batchId),
        recordDate: formData.date,
        mortality: parseInt(formData.mortality) || 0,
        feedConsumption: parseFloat(formData.feedConsumption) || 0,
        eggProduction: parseInt(formData.eggProduction) || 0,
        eggWeight: parseFloat(formData.eggWeight) || 0,
        rejectedEggs: parseInt(formData.rejectedEggs) || 0,
        avgWeight: parseFloat(formData.avgWeight) || 0,
        expenses: parseFloat(formData.expenses) || 0,
        revenue: parseFloat(formData.revenue) || 0,
        notes: formData.notes || ''
      };
      
      // Save to backend
      await recordAPI.create(newRecord);
      
      // Refetch all data to update UI
      const [records, kpisData, monthlyEggs, monthlyFinance] = await Promise.all([
        recordAPI.getAll(),
        analyticsAPI.getKPIs(30),
        analyticsAPI.getMonthlyEggs(6),
        analyticsAPI.getMonthlyFinance(6)
      ]);
      
      const cleanRecords = records.map(r => ({
        ...r,
        mortality: Number(r.mortality),
        feedConsumption: Number(r.feedConsumption),
        eggProduction: Number(r.eggProduction),
        fcr: Number(r.feedConsumption) / (Number(r.avgWeight) || Number(r.eggProduction)/20),
        hdp: (Number(r.eggProduction) / batchData.find(b => b.id === r.batchId)?.population * 100) || 0,
        revenue: Number(r.revenue),
        cost: Number(r.expenses)
      })).sort((a, b) => new Date(a.recordDate) - new Date(b.recordDate));

      setDailyData(cleanRecords);
      setKpis(kpisData);
      setMonthlyEggData(monthlyEggs);
      setMonthlyFinanceData(monthlyFinance);
      
      alert('✅ Data berhasil disimpan ke database!');
      
      // Reset form
      setFormData({
        ...formData,
        mortality: 0,
        feedConsumption: 0,
        eggProduction: 0,
        eggWeight: 0,
        rejectedEggs: 0,
        avgWeight: 0,
        expenses: 0,
        revenue: 0,
        notes: ''
      });
    } catch (error) {
      console.error('Error saving data:', error);
      alert(`❌ Gagal menyimpan data: ${error.message}`);
    }
  };

  // --- UI COMPONENTS ---

  const KPICard = ({ title, value, subtitle, icon: Icon, trend, alert }) => (
    <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
        </div>
        <div className={`p-2 rounded-lg ${alert ? 'bg-red-50' : 'bg-blue-50'}`}>
          <Icon className={`w-5 h-5 ${alert ? 'text-red-500' : 'text-blue-500'}`} />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{subtitle}</p>
        {trend && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center ${
            trend > 0 ? (title.includes('Mortalitas') || title.includes('FCR') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600') 
            : (title.includes('Mortalitas') || title.includes('FCR') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600')
          }`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% vs bulan lalu
          </span>
        )}
      </div>
    </div>
  );

  const SectionHeader = ({ title }) => (
    <div className="mb-6">
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
    </div>
  );

  const InputField = ({ label, name, type = "text", value, onChange, placeholder, ...props }) => (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400"
          placeholder={placeholder}
          {...props}
        />
        {name === 'date' && <Calendar className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header - Clean Blue */}
      <header className="bg-blue-600 text-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-xl font-bold tracking-tight">Dashboard Peternakan Bebek</h1>
              <p className="text-blue-100 text-xs mt-0.5 opacity-90">Sistem Manajemen & Analisis Terpadu</p>
            </div>
            <div className="hidden md:flex items-center space-x-4 text-sm font-medium">
              <span className="bg-blue-500 bg-opacity-30 px-3 py-1 rounded-full text-blue-50">
                {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
        
        {/* Navigation - Clean Tabs */}
        <div className="bg-white border-b border-gray-200 text-gray-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8 overflow-x-auto no-scrollbar">
              {['dashboard', 'input', 'analisis', 'kandang', 'pengaturan'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`
                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all
                    ${activeTab === tab
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                  `}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Loading State */}
      {loading && (
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Memuat data dari database...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-red-800 font-bold mb-2">❌ Error Loading Data</h3>
            <p className="text-red-700">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      )}

      {/* Main Content - Only show when loaded */}
      {!loading && !error && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* View: Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fade-in">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
               <div>{/* Spacer */}</div>
               <div className="flex space-x-3">
                <button
                  onClick={() => {
                    const alerts = checkAlerts();
                    if (alerts.length > 0) sendWhatsAppAlert('🦆 ALERT PETERNAKAN BEBEK\n\n' + alerts.join('\n\n'));
                    else alert('Tidak ada alert, semua kondisi aman.');
                  }}
                  className="flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition shadow-sm"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Kirim Alert WhatsApp
                </button>
                <button
                  onClick={exportToExcel}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition shadow-sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export ke Excel
                </button>
              </div>
            </div>

            {/* KPI Grid - Now 5 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              <KPICard title="Total Populasi" value={kpis.totalPopulation?.toLocaleString()} subtitle="Ekor" icon={Target} />
              <KPICard title="Mortalitas (30 hari)" value={`${kpis.avgMortality}%`} subtitle="Rata-rata harian" icon={AlertTriangle} alert={parseFloat(kpis.avgMortality) > 1.5} trend={-12} />
              <KPICard title="FCR (30 hari)" value={kpis.avgFCR} subtitle="Feed Conversion Ratio" icon={Package} trend={-5} />
              <KPICard title="HDP (30 hari)" value={`${kpis.avgHDP}%`} subtitle="Hen Day Production" icon={TrendingUp} trend={3} />
              <KPICard title="Biaya Produksi" value={`Rp ${parseInt(costPerDuckData.costPerDuck).toLocaleString()}`} subtitle="Per bebek per hari" icon={Package} trend={costPerDuckData.trend} />
            </div>

            {/* Financial Summary Card */}
            <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Ringkasan Keuangan (30 Hari)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div>
                    <p className="text-sm text-gray-500 mb-1">Total Pendapatan</p>
                    <p className="text-2xl font-bold text-gray-900">Rp {(kpis.totalRevenue / 1000000).toFixed(1)}jt</p>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                       <div className="bg-green-500 h-1.5 rounded-full" style={{width: '100%'}}></div>
                    </div>
                 </div>
                 <div>
                    <p className="text-sm text-gray-500 mb-1">Total Biaya</p>
                    <p className="text-2xl font-bold text-gray-900">Rp {(kpis.totalCost / 1000000).toFixed(1)}jt</p>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                       <div className="bg-red-500 h-1.5 rounded-full" style={{width: `${(kpis.totalCost/kpis.totalRevenue)*100}%`}}></div>
                    </div>
                 </div>
                 <div>
                    <p className="text-sm text-gray-500 mb-1">Profit Margin</p>
                    <p className="text-2xl font-bold text-blue-600">{kpis.profitMargin}%</p>
                    <p className="text-xs text-gray-400 mt-1">Net Profit: Rp {(kpis.profit / 1000000).toFixed(1)}jt</p>
                 </div>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Tren Mortalitas (30 Hari)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={dailyData.slice(-30)}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} dy={10} />
                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Line type="monotone" dataKey="mortality" stroke="#ef4444" strokeWidth={2} dot={false} activeDot={{ r: 6 }} name="Mortalitas" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

               <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6">FCR & HDP Trend</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={dailyData.slice(-30)}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} dy={10} />
                    <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend iconType="circle" />
                    <Line yAxisId="left" type="monotone" dataKey="fcr" stroke="#3b82f6" strokeWidth={2} dot={false} name="FCR" />
                    <Line yAxisId="right" type="monotone" dataKey="hdp" stroke="#10b981" strokeWidth={2} dot={false} name="HDP %" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Monthly Egg Production Trend - New Chart */}
            <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Trend Produksi Telur Bulanan (6 Bulan Terakhir)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyEggData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} label={{ value: 'Total Telur (butir)', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: '#6b7280' } }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [`${value.toLocaleString()} butir`, 'Produksi Telur']}
                  />
                  <Bar dataKey="totalEggs" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Total Produksi" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>📈 Insight:</strong> {monthlyEggData.length > 0 ? `Total produksi telur bulan ini mencapai ${monthlyEggData[monthlyEggData.length - 1]?.totalEggs.toLocaleString() || 0} butir.` : 'Data sedang dikumpulkan.'}
                </p>
              </div>
            </div>

            {/* Monthly Financial Trend - New Chart */}
            <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Trend Keuangan Bulanan (6 Bulan Terakhir)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyFinanceData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(value) => `${(value/1000000).toFixed(0)}jt`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [`Rp ${value.toLocaleString()}`, 'Total']}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} name="Pemasukan" />
                  <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} name="Pengeluaran" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <span className="text-green-600 font-bold">● Pemasukan</span> vs <span className="text-red-600 font-bold">● Pengeluaran</span> 
                  {monthlyFinanceData.length > 0 && monthlyFinanceData[monthlyFinanceData.length - 1].profit > 0 ? 
                    ` — Bulan ini profit positif Rp ${monthlyFinanceData[monthlyFinanceData.length - 1].profit.toLocaleString()} 🎉` : 
                    ''}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* View: Input */}
        {activeTab === 'input' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 max-w-3xl mx-auto">
            <div className="p-6 border-b border-gray-100">
               <h2 className="text-xl font-bold text-gray-900">Input Data Harian</h2>
               <p className="text-sm text-gray-500 mt-1">Masukkan data produksi terbaru hari ini.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-6">
                 {/* Group 1: Basics */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Tanggal" name="date" type="date" value={formData.date} onChange={handleInputChange} required />
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-gray-700">Kandang/Batch</label>
                      <div className="relative">
                         <select
                           name="batchId"
                           value={formData.batchId}
                           onChange={handleInputChange}
                           className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                         >
                           {batchData.map(batch => (
                             <option key={batch.id} value={batch.id}>{batch.name}</option>
                           ))}
                         </select>
                         <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                 </div>

                 <hr className="border-gray-100" />

                 {/* Group 2: Production */}
                 <h3 className="text-sm font-semibold text-gray-900">Data Produksi</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Mortalitas (ekor)" name="mortality" type="number" min="0" value={formData.mortality} onChange={handleInputChange} placeholder="0" />
                    <InputField label="Konsumsi Pakan (kg)" name="feedConsumption" type="number" step="0.1" min="0" value={formData.feedConsumption} onChange={handleInputChange} placeholder="0.0" />
                    <InputField label="Produksi Telur (butir)" name="eggProduction" type="number" min="0" value={formData.eggProduction} onChange={handleInputChange} placeholder="0" />
                    <InputField label="Berat Telur Total (kg)" name="eggWeight" type="number" step="0.1" min="0" value={formData.eggWeight} onChange={handleInputChange} placeholder="0.0" />
                    <InputField label="Telur Reject/Pecah (butir)" name="rejectedEggs" type="number" min="0" value={formData.rejectedEggs} onChange={handleInputChange} placeholder="0" />
                    <InputField label="Berat Rata-rata Sampel (kg) - Pedaging" name="avgWeight" type="number" step="0.01" min="0" value={formData.avgWeight} onChange={handleInputChange} placeholder="0.00" />
                 </div>

                 <hr className="border-gray-100" />

                 {/* Group 3: Finance */}
                 <h3 className="text-sm font-semibold text-gray-900">Keuangan</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Pengeluaran (Rp)" name="expenses" type="number" min="0" value={formData.expenses} onChange={handleInputChange} placeholder="0" />
                    <InputField label="Pendapatan (Rp)" name="revenue" type="number" min="0" value={formData.revenue} onChange={handleInputChange} placeholder="0" />
                 </div>

                 <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">Catatan Khusus</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400"
                      placeholder="Contoh: Vaksinasi ND, cuaca hujan lebat, dll"
                    ></textarea>
                 </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="px-8 py-2.5 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 transition shadow-sm focus:ring-4 focus:ring-blue-100"
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        )}

        {/* View: Analisis */}
        {activeTab === 'analisis' && (
          <div className="space-y-6">
            <SectionHeader title="Analisis Performa" />
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
               <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center">
                     <Target className="w-5 h-5 mr-2 text-blue-600" />
                     Perbandingan dengan Standar Industri
                  </h3>
               </div>
               
               <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Pedaging Standards */}
                  <div className="space-y-4">
                     <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-gray-900">Bebek Pedaging</h4>
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">Benchmark</span>
                     </div>
                     
                     <div className="space-y-4">
                        <div>
                           <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-500">Feed Conversion Ratio (FCR)</span>
                              <span className="font-medium text-gray-900">{kpis.avgFCR} / {industryStandards.pedaging.fcr}</span>
                           </div>
                           <div className="w-full bg-gray-100 rounded-full h-2">
                              <div className={`h-2 rounded-full ${parseFloat(kpis.avgFCR) < industryStandards.pedaging.fcr ? 'bg-green-500' : 'bg-red-500'}`} 
                                   style={{width: `${Math.min((parseFloat(kpis.avgFCR)/3)*100, 100)}%`}}></div>
                           </div>
                           <p className="text-xs text-right mt-1 text-gray-400">Target: {industryStandards.pedaging.fcr}</p>
                        </div>

                        <div>
                           <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-500">Mortalitas Rate</span>
                              <span className="font-medium text-gray-900">{kpis.avgMortality}% / {industryStandards.pedaging.mortalityRate}%</span>
                           </div>
                           <div className="w-full bg-gray-100 rounded-full h-2">
                              <div className={`h-2 rounded-full ${parseFloat(kpis.avgMortality) < industryStandards.pedaging.mortalityRate ? 'bg-green-500' : 'bg-red-500'}`} 
                                   style={{width: `${Math.min(parseFloat(kpis.avgMortality)*10, 100)}%`}}></div>
                           </div>
                           <p className="text-xs text-right mt-1 text-gray-400">Max: {industryStandards.pedaging.mortalityRate}%</p>
                        </div>
                     </div>
                  </div>

                  {/* Petelur Standards */}
                  <div className="space-y-4">
                     <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-gray-900">Bebek Petelur</h4>
                        <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">Benchmark</span>
                     </div>
                     
                     <div className="space-y-4">
                        <div>
                           <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-500">Hen Day Production (HDP)</span>
                              <span className="font-medium text-gray-900">{kpis.avgHDP}% / {industryStandards.petelur.hdp}%</span>
                           </div>
                           <div className="w-full bg-gray-100 rounded-full h-2">
                              <div className={`h-2 rounded-full ${parseFloat(kpis.avgHDP) > industryStandards.petelur.hdp ? 'bg-green-500' : 'bg-orange-500'}`} 
                                   style={{width: `${parseFloat(kpis.avgHDP)}%`}}></div>
                           </div>
                           <p className="text-xs text-right mt-1 text-gray-400">Target: &gt;{industryStandards.petelur.hdp}%</p>
                        </div>

                        <div>
                           <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-500">FCR</span>
                              <span className="font-medium text-gray-900">{kpis.avgFCR} / {industryStandards.petelur.fcr}</span>
                           </div>
                           <div className="w-full bg-gray-100 rounded-full h-2">
                              <div className={`h-2 rounded-full ${parseFloat(kpis.avgFCR) < industryStandards.petelur.fcr ? 'bg-green-500' : 'bg-red-500'}`} 
                                   style={{width: `${Math.min((parseFloat(kpis.avgFCR)/3)*100, 100)}%`}}></div>
                           </div>
                           <p className="text-xs text-right mt-1 text-gray-400">Target: {industryStandards.petelur.fcr}</p>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Summary Box */}
               <div className="bg-blue-50 p-6 border-t border-blue-100">
                  <h4 className="text-sm font-bold text-blue-900 mb-2">💡 Kesimpulan & Rekomendasi</h4>
                  <ul className="space-y-2 text-sm text-blue-800">
                     <li className="flex items-start">
                        <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-blue-600" />
                        <span>FCR Pedaging Anda {parseFloat(kpis.avgFCR) < industryStandards.pedaging.fcr ? 'sangat efisien' : 'perlu dievaluasi'}, pertahankan manajemen pakan saat ini.</span>
                     </li>
                     <li className="flex items-start">
                        <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-blue-600" />
                        <span>HDP Petelur {parseFloat(kpis.avgHDP) > industryStandards.petelur.hdp ? 'sangat baik' : 'cukup baik'}, pastikan durasi pencahayaan stabil 16 jam/hari diperhatikan.</span>
                     </li>
                  </ul>
               </div>
            </div>
          </div>
        )}

        {/* View: Kandang */}
        {activeTab === 'kandang' && (
          <div className="space-y-6">
            <SectionHeader title="Manajemen Kandang" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {batchData.map(batch => {
                const mortalityRate = ((batch.initialPop - batch.population) / batch.initialPop * 100).toFixed(2);
                const percentSurvival = (batch.population / batch.initialPop) * 100;
                
                return (
                  <div key={batch.id} className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                         <h3 className="text-lg font-bold text-gray-900">{batch.name}</h3>
                         <div className="flex items-center space-x-2 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${batch.type === 'pedaging' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                               {batch.type.toUpperCase()}
                            </span>
                            <span className="text-xs text-gray-500">• {batch.age} Hari</span>
                         </div>
                      </div>
                      <span className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded font-medium">{batch.status}</span>
                    </div>

                    <div className="space-y-4">
                       <div>
                          <div className="flex justify-between text-sm mb-1">
                             <span className="text-gray-500">Populasi</span>
                             <span className="font-medium text-gray-900">{batch.population} <span className="text-gray-400">/ {batch.initialPop}</span></span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                             <div className="bg-blue-600 h-2 rounded-full" style={{width: `${percentSurvival}%`}}></div>
                          </div>
                       </div>
                       
                       <div className="grid grid-cols-2 gap-4 pt-2">
                          <div className="bg-gray-50 p-3 rounded-lg">
                             <p className="text-xs text-gray-500">Mortalitas</p>
                             <p className={`text-lg font-bold ${parseFloat(mortalityRate) > 3 ? 'text-red-600' : 'text-gray-900'}`}>{mortalityRate}%</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                             <p className="text-xs text-gray-500">Estimasi Panen</p>
                             <p className="text-lg font-bold text-gray-900">{Math.max(0, 45 - batch.age)} Hari</p>
                          </div>
                       </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* View: Pengaturan */}
        {activeTab === 'pengaturan' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 max-w-3xl mx-auto">
             <div className="p-6 border-b border-gray-100">
               <h2 className="text-xl font-bold text-gray-900">Pengaturan & Konfigurasi</h2>
             </div>
             
             <div className="p-6 space-y-8">
                {/* Whatsapp Section */}
                <div>
                   <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                      <Bell className="w-4 h-4 mr-2 text-green-600" /> Notifikasi WhatsApp
                   </h3>
                   <div className="flex gap-4">
                      <div className="flex-1">
                         <InputField 
                           label="Nomor WhatsApp (dengan kode negara)" 
                           value={whatsappNumber} 
                           onChange={(e) => setWhatsappNumber(e.target.value)} 
                           placeholder="62812345678" 
                         />
                         <p className="text-xs text-gray-500 mt-1">Contoh: 62812345678 (Gunakan kode negara, tanpa '+')</p>
                      </div>
                      <div className="flex items-end mb-1">
                         <button onClick={() => alert('Disimpan!')} className="px-6 py-2.5 bg-green-600 text-white font-medium text-sm rounded-lg hover:bg-green-700">Simpan</button>
                      </div>
                   </div>
                </div>

                <hr className="border-gray-100" />

                {/* Threshold Section */}
                <div>
                   <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2 text-yellow-600" /> Threshold Alert
                   </h3>
                   <p className="text-sm text-gray-500 mb-4">Sistem akan memberi peringatan jika performa melewati batas ini.</p>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputField label="Threshold Mortalitas (%)" type="number" step="0.1" value={alertSettings.mortalityThreshold} onChange={(e) => setAlertSettings({...alertSettings, mortalityThreshold: e.target.value})} />
                      <InputField label="Threshold FCR" type="number" step="0.1" value={alertSettings.fcrThreshold} onChange={(e) => setAlertSettings({...alertSettings, fcrThreshold: e.target.value})} />
                      <InputField label="Threshold HDP Minimum (%)" type="number" value={alertSettings.hdpThreshold} onChange={(e) => setAlertSettings({...alertSettings, hdpThreshold: e.target.value})} />
                      <InputField label="Threshold Stok Pakan (hari)" type="number" value={alertSettings.stockThreshold} onChange={(e) => setAlertSettings({...alertSettings, stockThreshold: e.target.value})} />
                   </div>
                </div>
             </div>
          </div>
        )}

      </main>
      )}
    </div>
  );
};

export default DuckFarmDashboard;
