'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { InvoiceForm } from '@/components/InvoiceForm';
import { invoiceService } from '@/lib/invoiceService';
import { Invoice } from '@/types/models';

export default function EditInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    const loadInvoice = async () => {
      const id = parseInt(params.id as string);
      const foundInvoice = await invoiceService.getById(id);
      if (foundInvoice) {
        setInvoice(foundInvoice);
      } else {
        router.push('/invoices');
      }
    };
    loadInvoice();
  }, [params.id, router]);

  if (!invoice) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return <InvoiceForm invoice={invoice} />;
}

