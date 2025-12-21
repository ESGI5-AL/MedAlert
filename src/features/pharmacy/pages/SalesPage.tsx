import React, { useState, useEffect } from 'react';
import { SidebarLayout } from '@/shared/layouts/Sidebar';
import { Button } from '@/shared/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';
import { AddSaleModal } from '../components/AddSaleModal';
import { SalesHistoryTable } from '../components/SalesHistoryTable';
import type { SaleRecord } from '../types/pharmacy.types';
import { toast } from 'sonner';

const SalesPage: React.FC = () => {
  const { medAlertContract, account } = useWeb3();

  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchSales = async () => {
    if (!medAlertContract || !account) {
      setIsLoading(false);
      return;
    }

    try {
      setIsRefreshing(true);

      const filter = medAlertContract.filters.MedicineAdded();
      const events = await medAlertContract.queryFilter(filter, 0, 'latest');
      const salesData: SaleRecord[] = [];

      for (const event of events) {
        const tx = await event.getTransaction();

        if (tx.from.toLowerCase() === account.toLowerCase()) {
          const block = await event.getBlock();

          if (!('args' in event)) continue;
          const args = event.args;

          salesData.push({
            patientAddress: args.patientAddress,
            medicineId: args.medicineId,
            medicineName: args.medicineName,
            quantity: Number(args[3]),
            timestamp: block.timestamp,
            transactionHash: event.transactionHash,
            blockNumber: event.blockNumber,
          });
        }
      }

      salesData.sort((a, b) => b.timestamp - a.timestamp);

      setSales(salesData);
    } catch (error) {
      console.error('Error fetching sales:', error);
      toast.error('Erreur lors du chargement des délivrances');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [medAlertContract, account]);

  const handleSaleAdded = () => {
    fetchSales();
  };

  const handleRefresh = () => {
    fetchSales();
    toast.success('Liste actualisée');
  };

  return (
    <SidebarLayout
      role="pharmacist"
      breadcrumbs={[
        { label: 'Dashboard', href: '/pharmacy' },
        { label: 'Délivrances', href: '/pharmacy/sales' },
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Gestion des délivrances</h2>
            <p className="text-muted-foreground">
              Enregistrez et consultez l'historique des médicaments délivrés
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter une délivrance
            </Button>
          </div>
        </div>

        <SalesHistoryTable sales={sales} isLoading={isLoading} />

        <AddSaleModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          onSaleAdded={handleSaleAdded}
        />
      </div>
    </SidebarLayout>
  );
};

export default SalesPage;
