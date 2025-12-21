import React, { useState, useEffect } from 'react';
import { SidebarLayout } from '@/shared/layouts/Sidebar';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { RefreshCw, AlertTriangle, ShieldAlert, TrendingUp } from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';
import { AlertCard } from '../components/AlertCard';
import type { MedicineWithAlerts, SideEffectDetail } from '../types/alerts.types';
import { toast } from 'sonner';
import seedData from '../../../../../../seedData.json';

const AlertsPage: React.FC = () => {
  const { medAlertContract, account } = useWeb3();

  const [medicinesWithAlerts, setMedicinesWithAlerts] = useState<MedicineWithAlerts[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [alertThreshold, setAlertThreshold] = useState(3);

  const fetchAlerts = async () => {
    if (!medAlertContract || !account) {
      setIsLoading(false);
      return;
    }

    try {
      setIsRefreshing(true);

      const threshold = await medAlertContract.getAlertThreshold();
      setAlertThreshold(Number(threshold));

      const alertFilter = medAlertContract.filters.AlertTriggered();
      const alertEvents = await medAlertContract.queryFilter(alertFilter, 0, 'latest');

      const medicinesData: MedicineWithAlerts[] = [];

      for (const medicine of seedData.medicines) {
        try {
          const reportIds = await medAlertContract.getSideEffectsByMedicine(medicine.medicineId);
          const validatedCount = await medAlertContract.getValidatedReportCount(medicine.medicineId);
          const sideEffects: SideEffectDetail[] = [];

          for (const reportId of reportIds) {
            try {
              const sideEffect = await medAlertContract.getSideEffectDetails(reportId);

              sideEffects.push({
                reportId: Number(sideEffect.reportId),
                patientAddress: sideEffect.patientAddress,
                medicineId: sideEffect.medicineId,
                symptom: sideEffect.symptom,
                reportDate: Number(sideEffect.reportDate),
                isValidated: sideEffect.isValidated,
                validatedByDoctor: sideEffect.validatedByDoctor,
                severity: Number(sideEffect.severity),
                isActive: sideEffect.isActive,
              });
            } catch (err) {
              console.error(`Error fetching side effect ${reportId}:`, err);
            }
          }

          const hasAlert = alertEvents.some(event => {
            if ('args' in event && event.args) {
              return event.args[0] === medicine.medicineId;
            }
            return false;
          });

          if (reportIds.length > 0) {
            medicinesData.push({
              medicineId: medicine.medicineId,
              medicineName: medicine.name,
              totalReports: reportIds.length,
              validatedReports: Number(validatedCount),
              hasAlert,
              sideEffects: sideEffects.sort((a, b) => b.reportDate - a.reportDate),
            });
          }
        } catch (err) {
          console.error(`Error processing medicine ${medicine.medicineId}:`, err);
        }
      }

      medicinesData.sort((a, b) => {
        if (a.hasAlert && !b.hasAlert) return -1;
        if (!a.hasAlert && b.hasAlert) return 1;
        return b.validatedReports - a.validatedReports;
      });

      setMedicinesWithAlerts(medicinesData);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast.error('Erreur lors du chargement des alertes');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [medAlertContract, account]);

  const handleRefresh = () => {
    fetchAlerts();
    toast.success('Alertes actualisées');
  };

  const totalReports = medicinesWithAlerts.reduce((sum, m) => sum + m.totalReports, 0);
  const totalValidated = medicinesWithAlerts.reduce((sum, m) => sum + m.validatedReports, 0);
  const activeAlerts = medicinesWithAlerts.filter(m => m.hasAlert).length;

  if (isLoading) {
    return (
      <SidebarLayout
        role="pharmacist"
        breadcrumbs={[
          { label: 'Dashboard', href: '/pharmacy' },
          { label: 'Alertes', href: '/pharmacy/alerts' },
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
        { label: 'Alertes', href: '/pharmacy/alerts' },
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Alertes médicaments</h2>
            <p className="text-muted-foreground">
              Surveillance des effets secondaires signalés
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alertes actives</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{activeAlerts}</div>
              <p className="text-xs text-muted-foreground">
                Médicaments sous surveillance
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total signalements</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalReports}</div>
              <p className="text-xs text-muted-foreground">
                Effets secondaires signalés
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rapports validés</CardTitle>
              <ShieldAlert className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalValidated}</div>
              <p className="text-xs text-muted-foreground">
                Confirmés par médecins
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Seuil d'alerte</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{alertThreshold}</div>
              <p className="text-xs text-muted-foreground">
                Rapports validés requis
              </p>
            </CardContent>
          </Card>
        </div>

        {medicinesWithAlerts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <ShieldAlert className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun signalement</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Aucun effet secondaire n'a été signalé pour les médicaments que vous avez délivrés.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Médicaments avec signalements ({medicinesWithAlerts.length})
              </h3>
            </div>

            <div className="space-y-4">
              {medicinesWithAlerts.map((medicine) => (
                <AlertCard key={medicine.medicineId} medicine={medicine} />
              ))}
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};

export default AlertsPage;
