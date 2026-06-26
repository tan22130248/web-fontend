// src/pages/seller/dash/SellerDashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import sellerDashboardService from '../../../services/sellerDashboardService';

export default function SellerDashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter state
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // Current month
  const [timeRange, setTimeRange] = useState(30); // Days range
  
  // State for dashboard data
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    newOrders: 0,
    productsOnline: 0
  });
  const [revenueChartData, setRevenueChartData] = useState([]);
  const [categoryChartData, setCategoryChartData] = useState([]);

  // Colors for category pie chart
  const COLORS = ['#cd5a38', '#c99339', '#558b5a', '#d1d8cb', '#e8cdb9', '#f0ebd6'];

  useEffect(() => {
    fetchDashboardData();
  }, [selectedMonth, timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('\n=== FETCHING DASHBOARD DATA ===');
      console.log('Selected Month:', selectedMonth);
      console.log('Time Range (days):', timeRange);
      
      // Fetch all data in parallel
      const [summaryRes, revenueRes, categoryRes] = await Promise.all([
        sellerDashboardService.getSummary(),
        sellerDashboardService.getRevenueChartByMonthAndDays(selectedMonth, new Date().getFullYear(), timeRange),
        sellerDashboardService.getCategoryChart(selectedMonth, new Date().getFullYear())
      ]);

      console.log('=== RAW RESPONSES ===');
      console.log('Summary Full Response:', summaryRes);
      console.log('Revenue Full Response:', revenueRes);
      console.log('Category Full Response:', categoryRes);
      
      console.log('=== RESPONSE DATA (should be same as above) ===');
      console.log('Summary Data:', summaryRes);
      console.log('Revenue Data:', revenueRes);
      console.log('Category Data:', categoryRes);

      // http.get() already returns response.data, so we use them directly
      setSummary(summaryRes || {
        totalRevenue: 0,
        newOrders: 0,
        productsOnline: 0
      });
      
      // Format revenue chart data
      const formattedRevenueData = formatRevenueData(revenueRes || [], timeRange);
      console.log('Formatted Revenue Data:', formattedRevenueData);
      setRevenueChartData(formattedRevenueData);

      // Format category chart data
      const formattedCategoryData = formatCategoryData(categoryRes || []);
      console.log('Formatted Category Data:', formattedCategoryData);
      setCategoryChartData(formattedCategoryData);
      
      console.log('=== FETCH COMPLETE ===\n');

    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        request: error.request
      });
      
      // Set user-friendly error message
      if (error.response) {
        // Server responded with error
        setError(`Lỗi server: ${error.response.status}. Vui lòng thử lại.`);
      } else if (error.request) {
        // No response from server
        setError('Không thể kết nối với server. Vui lòng kiểm tra backend có chạy không (http://localhost:8080)');
      } else {
        setError('Đã xảy ra lỗi. Vui lòng thử lại.');
      }
      
      // Set default values on error
      setSummary({
        totalRevenue: 0,
        newOrders: 0,
        productsOnline: 0
      });
      setRevenueChartData([]);
      setCategoryChartData([]);
    } finally {
      setLoading(false);
    }
  };

  const formatRevenueData = (data, days) => {
    if (!data || data.length === 0) return [];
    
    // Group by week if > 14 days, otherwise by day
    if (days > 14) {
      return groupByWeek(data);
    }
    
    return data.map(item => ({
      label: formatDate(item.label),
      value: Number(item.value) || 0
    }));
  };

  const groupByWeek = (data) => {
    const weeks = {};
    data.forEach(item => {
      const date = new Date(item.label);
      const weekNum = getWeekNumber(date);
      const weekKey = `Tuần ${weekNum}`;
      
      if (!weeks[weekKey]) {
        weeks[weekKey] = 0;
      }
      weeks[weekKey] += Number(item.value) || 0;
    });

    return Object.keys(weeks).map(key => ({
      label: key,
      value: weeks[key]
    }));
  };

  const getWeekNumber = (date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const dayOfMonth = date.getDate();
    return Math.ceil((dayOfMonth + firstDay.getDay()) / 7);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  const formatCategoryData = (data) => {
    if (!data || data.length === 0) return [];
    
    const total = data.reduce((sum, item) => sum + (Number(item.revenue) || 0), 0);
    
    return data.map(item => ({
      name: item.categoryName,
      value: Number(item.revenue) || 0,
      percentage: total > 0 ? ((Number(item.revenue) / total) * 100).toFixed(1) : 0
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatCompactCurrency = (amount) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K`;
    }
    return amount.toString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A14A24]"></div>
      </div>
    );
  }

  // Show error message if backend is not running
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="text-red-500 text-center">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-xl font-bold mb-2">Không thể tải dữ liệu Dashboard</h3>
          <p className="text-gray-600 mb-4">{error}</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md">
          <h4 className="font-semibold text-yellow-800 mb-2">🔧 Cách khắc phục:</h4>
          <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
            <li>Kiểm tra backend Spring Boot có chạy không</li>
            <li>Chạy: <code className="bg-yellow-100 px-1 rounded">cd d:\Atmdt\web-backend && mvn spring-boot:run</code></li>
            <li>Kiểm tra: <a href="http://localhost:8080/actuator/health" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">http://localhost:8080/actuator/health</a></li>
            <li>Kiểm tra database có dữ liệu không (chạy insert script)</li>
          </ol>
        </div>
        <button 
          onClick={() => fetchDashboardData()}
          className="bg-[#A14A24] text-white px-6 py-2 rounded-lg hover:bg-[#8B3F1E] transition-colors"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/home')}
          className="flex items-center space-x-2 text-[#A14A24] hover:text-[#8B3F1E] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="font-bold text-xl italic">Tủ cũ chill</span>
        </button>
        <div className="text-xs text-gray-400 font-medium">
          Bảng điều khiển Người bán
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Revenue Card */}
        <div className="bg-white p-5 rounded-2xl border border-[#F0ECE0] shadow-sm relative overflow-hidden">
          <span className="text-[11px] font-bold tracking-wider text-gray-400 uppercase">
            Doanh thu tổng
          </span>
          <div className="text-2xl font-black text-[#A14A24] mt-2">
            {formatCurrency(summary.totalRevenue)}
          </div>
          {revenueChartData.length > 0 && (
            <div className="flex items-end space-x-1 h-6 mt-4 opacity-40">
              {revenueChartData.slice(-6).map((item, idx) => {
                const maxValue = Math.max(...revenueChartData.slice(-6).map(d => d.value));
                const height = maxValue > 0 ? (item.value / maxValue) * 100 : 20;
                return (
                  <div 
                    key={idx}
                    className="bg-[#A14A24] w-full rounded-sm"
                    style={{ height: `${height}%` }}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* New Orders Card */}
        <div className="bg-white p-5 rounded-2xl border border-[#F0ECE0] shadow-sm relative">
          <span className="text-[11px] font-bold tracking-wider text-gray-400 uppercase">
            Đơn hàng mới
          </span>
          <div className="absolute top-5 right-5 w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-sm">
            🛒
          </div>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-3xl font-black text-[#4A3B32]">{summary.newOrders}</span>
            <span className="text-xs text-gray-400">đơn chưa xử lý</span>
          </div>
          <div className="flex -space-x-2 mt-4 overflow-hidden">
            <div className="w-5 h-5 rounded-full bg-blue-400 border border-white text-[8px] flex items-center justify-center text-white">A</div>
            <div className="w-5 h-5 rounded-full bg-green-400 border border-white text-[8px] flex items-center justify-center text-white">B</div>
            <div className="w-5 h-5 rounded-full bg-orange-400 border border-white text-[8px] flex items-center justify-center text-white">C</div>
            <div className="w-5 h-5 rounded-full bg-gray-300 border border-white text-[8px] flex items-center justify-center text-gray-600 font-bold">
              +{Math.max(0, summary.newOrders - 3)}
            </div>
          </div>
        </div>

        {/* Products Online Card */}
        <div className="bg-white p-5 rounded-2xl border border-[#F0ECE0] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold tracking-wider text-gray-400 uppercase">
              Sản phẩm đang bán
            </span>
            <div className="mt-3 space-y-1 text-xs">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-gray-500">Hoạt động ({summary.productsOnline})</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span className="text-gray-500">Chờ duyệt (0)</span>
              </div>
            </div>
          </div>
          <div className="w-16 h-16 rounded-full border-4 border-emerald-500 border-t-amber-400 flex items-center justify-center flex-col shadow-inner">
            <span className="text-sm font-black text-[#4A3B32]">{summary.productsOnline}</span>
            <span className="text-[8px] text-gray-400 uppercase font-bold">món</span>
          </div>
        </div>
      </div>

      {/* Revenue Chart & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Revenue Time Chart */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-[#F0ECE0] shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-base text-[#4A3B32]">Doanh thu theo thời gian</h3>
            
            <div className="flex items-center space-x-2">
              {/* Month selector */}
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="bg-[#FAF8F2] border border-[#EBE7D9] text-xs px-2.5 py-1 rounded-lg outline-none font-medium cursor-pointer"
              >
                <option value={1}>Tháng 1</option>
                <option value={2}>Tháng 2</option>
                <option value={3}>Tháng 3</option>
                <option value={4}>Tháng 4</option>
                <option value={5}>Tháng 5</option>
                <option value={6}>Tháng 6</option>
                <option value={7}>Tháng 7</option>
                <option value={8}>Tháng 8</option>
                <option value={9}>Tháng 9</option>
                <option value={10}>Tháng 10</option>
                <option value={11}>Tháng 11</option>
                <option value={12}>Tháng 12</option>
              </select>

              {/* Days range selector */}
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(Number(e.target.value))}
                className="bg-[#FAF8F2] border border-[#EBE7D9] text-xs px-2.5 py-1 rounded-lg outline-none font-medium cursor-pointer"
              >
                <option value={7}>7 ngày qua</option>
                <option value={30}>30 ngày qua</option>
                <option value={90}>90 ngày qua</option>
              </select>
            </div>
          </div>

          {revenueChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="label" 
                  tick={{ fontSize: 11, fill: '#888' }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#888' }}
                  tickLine={false}
                  tickFormatter={(value) => formatCompactCurrency(value)}
                />
                <Tooltip 
                  formatter={(value) => [formatCurrency(value), 'Doanh thu']}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #F0ECE0',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Bar 
                  dataKey="value" 
                  fill="#E87745" 
                  radius={[6, 6, 0, 0]}
                  maxBarSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              Chưa có dữ liệu doanh thu
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-[#F0ECE0] shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-[#4A3B32] mb-4">Thông báo mới nhất</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 text-xs">
                <span className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                  📦
                </span>
                <div>
                  <h4 className="font-bold text-[#4A3B32]">Đơn hàng #TC1204 mới!</h4>
                  <p className="text-gray-500 mt-0.5 leading-relaxed">
                    Lan Anh vừa đặt "Váy Vintage Hoa Nhí". Cần xác nhận ngay.
                  </p>
                  <span className="text-[10px] text-gray-400 block mt-1">10 phút trước</span>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 text-xs">
                <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  💬
                </span>
                <div>
                  <h4 className="font-bold text-[#4A3B32]">Câu hỏi khách hàng</h4>
                  <p className="text-gray-500 mt-0.5 leading-relaxed">
                    "Áo len này có bị xù lông không shop ơi?" từ Minh Tú.
                  </p>
                  <span className="text-[10px] text-gray-400 block mt-1">2 giờ trước</span>
                </div>
              </div>
            </div>
          </div>
          <button 
            onClick={() => navigate('/notifications')}
            className="w-full border border-[#EBE7D9] hover:bg-[#FAF8F2] text-[#4A3B32] font-semibold py-2 rounded-xl text-xs mt-4 transition-colors"
          >
            Xem tất cả
          </button>
        </div>
      </div>

      {/* Category Revenue & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Pie Chart */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-[#F0ECE0] shadow-sm">
          <h3 className="font-bold text-base text-[#4A3B32] mb-6">
            Doanh thu theo danh mục (Tháng {selectedMonth})
          </h3>

          {categoryChartData.length > 0 ? (
            <div className="flex items-center justify-around">
              <ResponsiveContainer width={200} height={200}>
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [formatCurrency(value), 'Doanh thu']}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #F0ECE0',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="grid grid-cols-1 gap-y-2 text-xs">
                {categoryChartData.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span 
                      className="w-2.5 h-2.5 rounded-sm" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></span>
                    <span className="text-gray-500">
                      {item.name} ({item.percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400">
              Chưa có dữ liệu danh mục
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-[#F0ECE0] shadow-sm">
          <h3 className="font-bold text-base text-[#4A3B32] mb-1">Hành động nhanh</h3>
          <p className="text-xs text-gray-400 mb-6">
            Quản lý cửa hàng của bạn một cách tối ưu nhất.
          </p>
          
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/seller/products/create')}
              className="bg-gradient-to-br from-[#D96B43] to-[#E87745] p-4 rounded-xl text-white cursor-pointer hover:shadow-md transition-shadow text-left"
            >
              <div className="text-xl mb-2">🖼️</div>
              <h4 className="font-bold text-sm">Đăng sản phẩm mới</h4>
              <p className="text-[10px] text-orange-100 mt-1 leading-normal">
                Bắt đầu giới thiệu bộ sưu tập mới của bạn
              </p>
            </button>
            
            <button
              onClick={() => navigate('/seller/orders')}
              className="bg-gradient-to-br from-[#A66041] to-[#BA7353] p-4 rounded-xl text-white cursor-pointer hover:shadow-md transition-shadow text-left"
            >
              <div className="text-xl mb-2">📋</div>
              <h4 className="font-bold text-sm">Xem danh sách đơn hàng</h4>
              <p className="text-[10px] text-amber-100 mt-1 leading-normal">
                Theo dõi tiến độ giao nhận và thanh toán
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
