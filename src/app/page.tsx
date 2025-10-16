'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { categoryService } from '@/lib/categoryService';
import { productService } from '@/lib/productService';
import { invoiceService } from '@/lib/invoiceService';
import { formatCurrency } from '@/lib/formatters';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FolderTree, Package, FileText, DollarSign } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Invoice } from '@/types/models';
import { Button } from '@/components/ui/button';

interface Stats {
  totalCategories: number;
  totalProducts: number;
  totalInvoices: number;
  totalRevenue: number;
}

export default function Dashboard() {
  const router = useRouter();
  const [invoicesState, setInvoicesState] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalCategories: 0,
    totalProducts: 0,
    totalInvoices: 0,
    totalRevenue: 0,
  });


  const [dailyData, setDailyData] = useState<{ date: string; revenue: number }[]>([]);
  const [startDateStr, setStartDateStr] = useState<string>('');
  const [endDateStr, setEndDateStr] = useState<string>('');

  const toIsoDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const setToday = () => {
    const today = new Date();
    const s = toIsoDate(today);
    setStartDateStr(s);
    setEndDateStr(s);
  };
  const setLast7Days = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 6);
    setStartDateStr(toIsoDate(start));
    setEndDateStr(toIsoDate(end));
  };
  const setLast30Days = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 29);
    setStartDateStr(toIsoDate(start));
    setEndDateStr(toIsoDate(end));
  };
  const setThisMonth = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    setStartDateStr(toIsoDate(start));
    setEndDateStr(toIsoDate(end));
  };

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
      setInvoicesState(invoices);

      // Initialize default range: last 30 days
      const today = new Date();
      const start = new Date();
      start.setDate(today.getDate() - 29);
      const toIsoDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      setStartDateStr(toIsoDate(start));
      setEndDateStr(toIsoDate(today));
    };
    
    loadData();
  }, []);

  useEffect(() => {
    if (!invoicesState.length || !startDateStr || !endDateStr) {
      setDailyData([]);
      return;
    }

    const start = new Date(startDateStr + 'T00:00:00');
    const end = new Date(endDateStr + 'T23:59:59');
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      setDailyData([]);
      return;
    }

    const dailyRevenue: Record<string, number> = {};
    invoicesState.forEach((invoice) => {
      const d = new Date(invoice.orderDate);
      if (d >= start && d <= end) {
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        dailyRevenue[key] = (dailyRevenue[key] || 0) + invoice.totalAmount;
      }
    });

    const chartData: { date: string; revenue: number }[] = [];
    const cur = new Date(start);
    while (cur <= end) {
      const key = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`;
      chartData.push({ date: key, revenue: dailyRevenue[key] || 0 });
      cur.setDate(cur.getDate() + 1);
    }

    setDailyData(chartData);
  }, [invoicesState, startDateStr, endDateStr]);

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

      
      <div className="mb-4 lg:mb-6 grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4 items-end">
        <div className="flex flex-col">
          <label className="text-xs lg:text-sm text-gray-600 mb-1">Từ ngày</label>
          <Input type="date" value={startDateStr} onChange={(e) => setStartDateStr(e.target.value)} />
        </div>
        <div className="flex flex-col">
          <label className="text-xs lg:text-sm text-gray-600 mb-1">Đến ngày</label>
          <Input type="date" value={endDateStr} onChange={(e) => setEndDateStr(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={setToday}>Hôm nay</Button>
          <Button variant="secondary" size="sm" onClick={setLast7Days}>7 ngày</Button>
          <Button variant="secondary" size="sm" onClick={setLast30Days}>30 ngày</Button>
          <Button variant="secondary" size="sm" onClick={setThisMonth}>Tháng này</Button>
        </div>
      </div>

      {dailyData.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader className="p-4 lg:p-6">
            <CardTitle className="text-base lg:text-lg">Doanh thu theo ngày</CardTitle>
          </CardHeader>
          <CardContent className="p-4 lg:p-6 pt-0">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Doanh thu" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
