import { SidebarLayout } from '@/shared/layouts/Sidebar';
import React, { useState, useEffect } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import {
  Pill,
  AlertTriangle,
  FileHeart,
  TrendingUp,
  Calendar,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { MedicineRecord, PatientSideEffectReport } from '../types/patient.types';
import seedData from '../../../../seedData.json';

interface DashboardStats {
  totalMedicines: number;
  totalQuantity: number;
  activeAlerts: number;
  myReports: number;
  validatedReports: number;
  recentMedicines: MedicineRecord[];
  recentReports: PatientSideEffectReport[];
}

const PatientDashboard: React.FC = () => {
  const { account, medAlertContract } = useWeb3();
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStats>({
    totalMedicines: 0,
    totalQuantity: 0,
    activeAlerts: 0,
    myReports: 0,
    validatedReports: 0,
    recentMedicines: [],
    recentReports: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    if (!medAlertContract || !account) {
      setIsLoading(false);
      return;
    }

    try {
      const medicineHistory = await medAlertContract.getMyMedicineHistory();
      const alerts = await medAlertContract.getMyActiveAlerts();

      const medicineRecords: MedicineRecord[] = medicineHistory.map((med: any) => ({
        medicineId: med.medicineId,
        medicineName: med.medicineName,
        purchaseDate: Number(med.purchaseDate),
        quantity: Number(med.quantity),
        hasAlerts: alerts.includes(med.medicineId),
        alertCount: Number(med.alertCount),
        isValidatedAlert: med.isValidatedAlert,
      }));

      medicineRecords.sort((a, b) => b.purchaseDate - a.purchaseDate);

      const totalQuantity = medicineRecords.reduce((sum, m) => sum + m.quantity, 0);

      const filter = medAlertContract.filters.SideEffectReported(null, account);
      const events = await medAlertContract.queryFilter(filter, 0, 'latest');

      const reportsList: PatientSideEffectReport[] = [];

      for (const event of events) {
        try {
          if (!('args' in event)) continue;
          const args = event.args;
          const reportId = Number(args[0]);
          const reportDetails = await medAlertContract.getSideEffectDetails(reportId);
          const medicine = seedData.medicines.find(m => m.medicineId === reportDetails.medicineId);

          reportsList.push({
            reportId: Number(reportDetails.reportId),
            medicineId: reportDetails.medicineId,
            medicineName: medicine?.name || reportDetails.medicineId,
            symptom: reportDetails.symptom,
            reportDate: Number(reportDetails.reportDate),
            isValidated: reportDetails.isValidated,
            validatedByDoctor: reportDetails.validatedByDoctor,
            severity: Number(reportDetails.severity),
            isActive: reportDetails.isActive,
          });
        } catch (err) {
          console.error('Error fetching report details:', err);
        }
      }

      reportsList.sort((a, b) => b.reportDate - a.reportDate);

      const validatedCount = reportsList.filter(r => r.isValidated).length;

      setStats({
        totalMedicines: medicineRecords.length,
        totalQuantity: totalQuantity,
        activeAlerts: alerts.length,
        myReports: reportsList.length,
        validatedReports: validatedCount,
        recentMedicines: medicineRecords.slice(0, 3),
        recentReports: reportsList.slice(0, 3),
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
    return new Date(timestamp * 1000).toLocaleDateString('fr-FR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSeverityColor = (severity: number): string => {
    if (severity >= 8) return 'bg-red-500';
    if (severity >= 5) return 'bg-orange-500';
    return 'bg-yellow-500';
  };

  if (isLoading) {
    return (
      <SidebarLayout
        role="patient"
        breadcrumbs={[
          { label: 'Dashboard', href: '/patient' },
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
      role="patient"
      breadcrumbs={[
        { label: 'Dashboard', href: '/patient' },
      ]}
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tableau de bord patient</h2>
          <p className="text-muted-foreground">
            Vue d'ensemble de votre santé et de vos médicaments
          </p>
        </div>

        {stats.activeAlerts > 0 && (
          <Card className="border-red-500 bg-red-50 dark:bg-red-950">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="h-6 w-6 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-900 dark:text-red-100 text-lg">
                    ⚠️ Alerte de Sécurité: {stats.activeAlerts} médicament{stats.activeAlerts > 1 ? 's' : ''} concerné{stats.activeAlerts > 1 ? 's' : ''}
                  </h3>
                  <p className="text-sm text-red-800 dark:text-red-200 mt-2">
                    Certains médicaments de votre historique ont déclenché des alertes de sécurité suite à des signalements d'effets secondaires validés par des médecins.
                  </p>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="mt-3"
                    onClick={() => navigate('/patient/passport')}
                  >
                    Consulter mon passeport médical
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Médicaments
              </CardTitle>
              <Pill className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMedicines}</div>
              <p className="text-xs text-muted-foreground">
                Dans votre historique
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Quantité
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalQuantity}</div>
              <p className="text-xs text-muted-foreground">
                Unités totales
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

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Signalements
              </CardTitle>
              <FileHeart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.myReports}</div>
              <p className="text-xs text-muted-foreground">
                Effets signalés
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Validés
              </CardTitle>
              <ShieldAlert className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.validatedReports}</div>
              <p className="text-xs text-muted-foreground">
                Par des médecins
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Médicaments récents</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/patient/passport')}
                >
                  Voir tout
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {stats.recentMedicines.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-8">
                  Aucun médicament dans votre historique
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.recentMedicines.map((medicine, index) => (
                    <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0">
                      <div className="flex items-center gap-3 flex-1">
                        <Pill className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{medicine.medicineName}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(medicine.purchaseDate)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant="outline">{medicine.quantity}x</Badge>
                        {medicine.hasAlerts && (
                          <Badge variant="destructive" className="gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Alerte
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Mes signalements récents</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/patient/passport')}
                >
                  Voir tout
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {stats.recentReports.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-8">
                  Aucun signalement effectué
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.recentReports.map((report) => (
                    <div key={report.reportId} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-sm">{report.medicineName}</div>
                        {report.isValidated ? (
                          <Badge variant="default" className="text-xs">Validé</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">En attente</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {report.symptom}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(report.reportDate)}
                        </span>
                        {report.isValidated && report.severity > 0 && (
                          <div className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${getSeverityColor(report.severity)}`} />
                            <span className="text-xs font-medium">{report.severity}/10</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Actions rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              <Button
                variant="outline"
                className="w-full justify-start h-auto py-4"
                onClick={() => navigate('/patient/passport')}
              >
                <div className="flex items-center gap-3">
                  <FileHeart className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Passeport Médical</div>
                    <div className="text-xs text-muted-foreground">
                      Consultez votre historique complet
                    </div>
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start h-auto py-4"
                onClick={() => navigate('/patient/passport')}
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Signaler un effet</div>
                    <div className="text-xs text-muted-foreground">
                      Déclarez un effet secondaire
                    </div>
                  </div>
                </div>
              </Button>

              {stats.activeAlerts > 0 && (
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto py-4 border-red-500"
                  onClick={() => navigate('/patient/passport')}
                >
                  <div className="flex items-center gap-3">
                    <ShieldAlert className="h-5 w-5 text-red-500" />
                    <div className="text-left">
                      <div className="font-medium text-red-600">
                        Voir les alertes ({stats.activeAlerts})
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Médicaments sous surveillance
                      </div>
                    </div>
                  </div>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <FileHeart className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  Votre santé, vos données
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Toutes vos données médicales sont stockées de manière sécurisée et transparente sur la blockchain.
                  Vous seul avez accès à votre historique complet et vous pouvez contribuer à améliorer la
                  sécurité médicale en signalant les effets secondaires.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
};

export default PatientDashboard;
