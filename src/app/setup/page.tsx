'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { setInvoiceCounter, getCounterValue } from '@/lib/initializeCounters';
import { ArrowLeft, Settings, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SetupPage() {
  const router = useRouter();
  const [invoiceStartId, setInvoiceStartId] = useState('595');
  const [isLoading, setIsLoading] = useState(false);
  const [currentCounters, setCurrentCounters] = useState({
    invoice: 0,
    product: 0,
    category: 0,
  });

  useEffect(() => {
    loadCurrentCounters();
  }, []);

  const loadCurrentCounters = async () => {
    try {
      const [invoice, product, category] = await Promise.all([
        getCounterValue('invoice_counter'),
        getCounterValue('product_counter'),
        getCounterValue('category_counter'),
      ]);
      
      setCurrentCounters({
        invoice,
        product,
        category,
      });
    } catch (error) {
      console.error('Error loading counters:', error);
    }
  };

  const handleSetInvoiceCounter = async () => {
    const value = parseInt(invoiceStartId);
    
    if (isNaN(value) || value < 1) {
      alert('Vui lòng nhập số ID hợp lệ (lớn hơn 0)');
      return;
    }

    const confirmMessage = `Bạn có chắc chắn muốn thiết lập ID hóa đơn tiếp theo là ${value}?\n\n` +
      `Giá trị counter hiện tại: ${currentCounters.invoice}\n` +
      `Giá trị counter sau khi cập nhật: ${value - 1}\n` +
      `ID hóa đơn tiếp theo sẽ là: ${value}`;

    if (!confirm(confirmMessage)) {
      return;
    }

    setIsLoading(true);
    try {
      await setInvoiceCounter(value);
      alert(`✅ Thiết lập thành công! ID hóa đơn tiếp theo sẽ là ${value}`);
      await loadCurrentCounters();
    } catch (error) {
      alert('❌ Lỗi khi thiết lập counter: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" onClick={() => router.push('/')} size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Thiết lập hệ thống</h1>
      </div>

      {/* Warning Banner */}
      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-3">
        <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
        <div className="text-sm text-yellow-800">
          <p className="font-semibold mb-1">⚠️ Cảnh báo quan trọng</p>
          <p>
            Trang này dùng để thiết lập ID ban đầu cho hệ thống. Chỉ sử dụng khi bạn hiểu rõ mình đang làm gì.
            Thiết lập sai có thể gây xung đột ID hoặc mất dữ liệu.
          </p>
        </div>
      </div>

      {/* Current Counters Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Trạng thái Counter hiện tại
          </CardTitle>
          <CardDescription>
            Giá trị counter hiện tại trong hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-sm text-purple-600 font-medium mb-1">Invoice Counter</p>
              <p className="text-2xl font-bold text-purple-900">{currentCounters.invoice}</p>
              <p className="text-xs text-purple-600 mt-1">ID tiếp theo: {currentCounters.invoice + 1}</p>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-600 font-medium mb-1">Product Counter</p>
              <p className="text-2xl font-bold text-green-900">{currentCounters.product}</p>
              <p className="text-xs text-green-600 mt-1">ID tiếp theo: {currentCounters.product + 1}</p>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-600 font-medium mb-1">Category Counter</p>
              <p className="text-2xl font-bold text-blue-900">{currentCounters.category}</p>
              <p className="text-xs text-blue-600 mt-1">ID tiếp theo: {currentCounters.category + 1}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Set Invoice Counter */}
      <Card>
        <CardHeader>
          <CardTitle>Thiết lập ID Hóa đơn bắt đầu</CardTitle>
          <CardDescription>
            Nhập ID bạn muốn cho hóa đơn tiếp theo. Ví dụ: nhập 595 thì hóa đơn tiếp theo sẽ có ID = 595
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invoiceStartId">ID hóa đơn tiếp theo</Label>
            <Input
              id="invoiceStartId"
              type="number"
              min="1"
              value={invoiceStartId}
              onChange={(e) => setInvoiceStartId(e.target.value)}
              placeholder="Ví dụ: 595"
              className="max-w-xs"
            />
            <p className="text-sm text-gray-500">
              Counter sẽ được set = {parseInt(invoiceStartId) - 1 || 0}, để hóa đơn tiếp theo có ID = {invoiceStartId || 0}
            </p>
          </div>

          <Button 
            onClick={handleSetInvoiceCounter}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? 'Đang thiết lập...' : 'Thiết lập Counter'}
          </Button>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">📋 Hướng dẫn sử dụng</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-700">
          <ol className="list-decimal list-inside space-y-2">
            <li>Kiểm tra trạng thái counter hiện tại ở phía trên</li>
            <li>Nhập ID mà bạn muốn cho hóa đơn tiếp theo (ví dụ: 595)</li>
            <li>Click &quot;Thiết lập Counter&quot; và xác nhận</li>
            <li>Từ giờ, mỗi hóa đơn mới sẽ có ID tăng dần từ số bạn vừa đặt</li>
          </ol>
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-blue-800 text-xs">
              💡 <strong>Lưu ý:</strong> Sau khi thiết lập, bạn nên tạo thử một hóa đơn để kiểm tra ID có đúng không.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

