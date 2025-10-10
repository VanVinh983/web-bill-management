'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { categoryService } from '@/lib/categoryService';
import { productService } from '@/lib/productService';
import { invoiceService } from '@/lib/invoiceService';
import { formatCurrency } from '@/lib/formatters';
import { getStorageInfo, formatBytes } from '@/lib/storageUtils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FolderTree, Package, FileText, DollarSign, HardDrive } from 'lucide-react';

interface Stats {
  totalCategories: number;
  totalProducts: number;
  totalInvoices: number;
  totalRevenue: number;
}

export default function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    totalCategories: 0,
    totalProducts: 0,
    totalInvoices: 0,
    totalRevenue: 0,
  });

  const [monthlyData, setMonthlyData] = useState<{ month: string; revenue: number }[]>([]);
  const [storageInfo, setStorageInfo] = useState({
    usedBytes: 0,
    usedKB: 0,
    usedMB: 0,
    quotaBytes: 0,
    quotaMB: 0,
    percentageUsed: 0,
  });

  useEffect(() => {
    const loadData = async () => {
      const categories = await categoryService.getAll();
      const products = await productService.getAll();
      const invoices = await invoiceService.getAll();
      const revenue = await invoiceService.getTotalRevenue();

      setStats({
        totalCategories: categories.length,
        totalProducts: products.length,
        totalInvoices: invoices.length,
        totalRevenue: revenue,
      });

      // Get storage info
      setStorageInfo(getStorageInfo());

      // Calculate monthly revenue
      const monthlyRevenue: Record<string, number> = {};
      invoices.forEach(invoice => {
        const date = new Date(invoice.orderDate);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + invoice.totalAmount;
      });

      const chartData = Object.entries(monthlyRevenue)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-6)
        .map(([month, revenue]) => ({
          month,
          revenue,
        }));

      setMonthlyData(chartData);
    };
    
    loadData();
  }, []);

  const cards = [
    {
      title: 'Danh mục',
      value: stats.totalCategories,
      icon: FolderTree,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      link: '/categories',
    },
    {
      title: 'Sản phẩm',
      value: stats.totalProducts,
      icon: Package,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      link: '/products',
    },
    {
      title: 'Hóa đơn',
      value: stats.totalInvoices,
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      link: '/invoices',
    },
    {
      title: 'Doanh thu',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      link: null,
    },
  ];

  return (
    <div>
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 lg:mb-8">Tổng quan</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6 lg:mb-8">
        {cards.map((card, index) => (
          <Card 
            key={index} 
            className={`shadow-sm hover:shadow-md transition-all ${card.link ? 'cursor-pointer hover:scale-105' : ''}`}
            onClick={() => card.link && router.push(card.link)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 lg:p-6">
              <CardTitle className="text-xs lg:text-sm font-medium text-gray-600">{card.title}</CardTitle>
              <div className={`p-1.5 lg:p-2 rounded-full ${card.bgColor}`}>
                <card.icon className={`h-4 w-4 lg:h-5 lg:w-5 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent className="p-3 lg:p-6 pt-0">
              <div className="text-xl lg:text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Storage Usage Card */}
      <Card className="shadow-sm mb-6 lg:mb-8">
        <CardHeader className="p-4 lg:p-6">
          <div className="flex items-center gap-2">
            <HardDrive className="h-5 w-5 text-gray-600" />
            <CardTitle className="text-base lg:text-lg">Dung lượng lưu trữ</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4 lg:p-6 pt-0">
          <div className="space-y-3">
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  storageInfo.percentageUsed > 80
                    ? 'bg-red-500'
                    : storageInfo.percentageUsed > 50
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(storageInfo.percentageUsed, 100)}%` }}
              />
            </div>
            
            {/* Storage Info */}
            <div className="flex justify-between items-center text-sm">
              <div className="space-y-1">
                <p className="text-gray-600">
                  Đã sử dụng: <span className="font-semibold text-gray-900">{formatBytes(storageInfo.usedBytes)}</span>
                </p>
                <p className="text-gray-600">
                  Tổng dung lượng: <span className="font-semibold text-gray-900">{storageInfo.quotaMB} MB</span>
                </p>
              </div>
              <div className="text-right">
                <p className={`text-2xl font-bold ${
                  storageInfo.percentageUsed > 80
                    ? 'text-red-600'
                    : storageInfo.percentageUsed > 50
                    ? 'text-yellow-600'
                    : 'text-green-600'
                }`}>
                  {storageInfo.percentageUsed.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500">đã dùng</p>
              </div>
            </div>

            {/* Warning if storage is high */}
            {storageInfo.percentageUsed > 80 && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  ⚠️ Dung lượng lưu trữ sắp đầy. Hãy xem xét xóa bớt dữ liệu cũ.
                </p>
              </div>
            )}
            
            {storageInfo.percentageUsed > 50 && storageInfo.percentageUsed <= 80 && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  💡 Dung lượng đã sử dụng hơn 50%. Hãy theo dõi thường xuyên.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {monthlyData.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader className="p-4 lg:p-6">
            <CardTitle className="text-base lg:text-lg">Doanh thu theo tháng (6 tháng gần nhất)</CardTitle>
          </CardHeader>
          <CardContent className="p-4 lg:p-6 pt-0">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="revenue" fill="#8884d8" name="Doanh thu" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
