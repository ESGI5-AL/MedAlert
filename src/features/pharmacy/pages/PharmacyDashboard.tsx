import { SidebarLayout } from '@/shared/layouts/Sidebar';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Pill, Users, Package, AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import type { SaleRecord } from '../types/pharmacy.types';

interface DashboardStats {
  totalMedicinesDelivered: number;
  totalQuantity: number;
  uniquePatients: number;
  deliveriesToday: number;
  activeAlerts: number;
  recentSales: SaleRecord[];
}

const PharmacyDashboard: React.FC = () => {
  const { medAlertContract, account } = useWeb3();
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStats>({
    totalMedicinesDelivered: 0,
    totalQuantity: 0,
    uniquePatients: 0,
    deliveriesToday: 0,
    activeAlerts: 0,
    recentSales: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    if (!medAlertContract || !account) {
      setIsLoading(false);
      return;
    }

    try {
      const filter = medAlertContract.filters.MedicineAdded();
      const events = await medAlertContract.queryFilter(filter, 0, 'latest');

      const pharmacySales: SaleRecord[] = [];
      const patientSet = new Set<string>();
      let totalQuantity = 0;

      const now = Math.floor(Date.now() / 1000);
      const todayStart = now - (now % 86400);

      let deliveriesToday = 0;

      for (const event of events) {
        try {
          const tx = await event.getTransaction();

          if (tx.from.toLowerCase() === account.toLowerCase()) {
            const block = await event.getBlock();
            const eventLog = event as any;
            const args = eventLog.args;

            const quantity = Number(args[3]);
            const timestamp = Number(block.timestamp);

            pharmacySales.push({
              patientAddress: args[0] as string,
              medicineId: args[1] as string,
              medicineName: args[2] as string,
              quantity: quantity,
              timestamp: timestamp,
              transactionHash: event.transactionHash,
              blockNumber: event.blockNumber,
            });

            patientSet.add((args[0] as string).toLowerCase());

            totalQuantity += quantity;

            if (timestamp >= todayStart) {
              deliveriesToday++;
            }
          }
        } catch (err) {
          console.error('Error processing event:', err);
        }
      }

      pharmacySales.sort((a, b) => b.timestamp - a.timestamp);

      const alertFilter = medAlertContract.filters.AlertTriggered();
      const alertEvents = await medAlertContract.queryFilter(alertFilter, 0, 'latest');

      const alertedMedicines = new Set<string>();
      for (const event of alertEvents) {
        const eventLog = event as any;
        const args = eventLog.args;
        if (args && args[0]) {
          alertedMedicines.add(args[0] as string);
        }
      }

      setStats({
        totalMedicinesDelivered: pharmacySales.length,
        totalQuantity: totalQuantity,
        uniquePatients: patientSet.size,
        deliveriesToday: deliveriesToday,
        activeAlerts: alertedMedicines.size,
        recentSales: pharmacySales.slice(0, 5),
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [medAlertContract, account]);

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleString('fr-FR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isLoading) {
    return (
      <SidebarLayout
        role="pharmacist"
        breadcrumbs={[
          { label: 'Dashboard', href: '/pharmacy' },
        ]}
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout
      role="pharmacist"
      breadcrumbs={[
        { label: 'Dashboard', href: '/pharmacy' },
      ]}
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tableau de bord de la pharmacie</h2>
          <p className="text-muted-foreground">
            Vue d'ensemble de votre activité et des alertes
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Délivrances
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMedicinesDelivered}</div>
              <p className="text-xs text-muted-foreground">
                Total des délivrances
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Médicaments
              </CardTitle>
              <Pill className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalQuantity}</div>
              <p className="text-xs text-muted-foreground">
                Unités délivrées
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Patients
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.uniquePatients}</div>
              <p className="text-xs text-muted-foreground">
                Patients servis
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Aujourd'hui
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.deliveriesToday}</div>
              <p className="text-xs text-muted-foreground">
                Délivrances du jour
              </p>
            </CardContent>
          </Card>

          <Card className={stats.activeAlerts > 0 ? 'border-red-500' : ''}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Alertes
              </CardTitle>
              <AlertTriangle className={`h-4 w-4 ${stats.activeAlerts > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.activeAlerts > 0 ? 'text-red-600' : ''}`}>
                {stats.activeAlerts}
              </div>
              <p className="text-xs text-muted-foreground">
                Alertes actives
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => navigate('/pharmacy/sales')}
              >
                <Package className="mr-2 h-4 w-4" />
                Ajouter une délivrance
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => navigate('/pharmacy/sales')}
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Voir l'historique complet
              </Button>
              {stats.activeAlerts > 0 && (
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => navigate('/pharmacy/alerts')}
                >
                  <AlertTriangle className="mr-2 h-4 w-4 text-red-500" />
                  Consulter les alertes ({stats.activeAlerts})
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Délivrances récentes</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.recentSales.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  Aucune délivrance enregistrée
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.recentSales.map((sale, index) => (
                    <div key={index} className="flex items-center justify-between text-sm border-b pb-2 last:border-0">
                      <div className="flex-1">
                        <div className="font-medium">{sale.medicineName}</div>
                        <div className="text-xs text-muted-foreground">
                          Patient: {formatAddress(sale.patientAddress)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{sale.quantity}x</div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(sale.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                  {stats.recentSales.length === 5 && (
                    <Button
                      variant="link"
                      className="w-full text-xs p-0 h-auto"
                      onClick={() => navigate('/pharmacy/sales')}
                    >
                      Voir toutes les délivrances →
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {stats.activeAlerts > 0 && (
          <Card className="border-red-500 bg-red-50 dark:bg-red-950">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-900 dark:text-red-100">
                    {stats.activeAlerts} alerte{stats.activeAlerts > 1 ? 's' : ''} active{stats.activeAlerts > 1 ? 's' : ''}
                  </h3>
                  <p className="text-sm text-red-800 dark:text-red-200 mt-1">
                    Des médicaments que vous avez délivrés ont déclenché des alertes de sécurité.
                    Consultez la page des alertes pour plus de détails.
                  </p>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="mt-3"
                    onClick={() => navigate('/pharmacy/alerts')}
                  >
                    Consulter les alertes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </SidebarLayout>
  );
};

export default PharmacyDashboard;
