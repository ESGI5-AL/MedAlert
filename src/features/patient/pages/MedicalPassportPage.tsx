import React, { useState, useEffect } from 'react';
import { SidebarLayout } from '@/shared/layouts/Sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { FileHeart, Pill, FileText, AlertCircle } from 'lucide-react';
import { useWeb3 } from '@/contexts/Web3Context';
import { MedicineHistoryTab } from '../components/MedicineHistoryTab';
import { ReportSideEffectTab } from '../components/ReportSideEffectTab';
import { MyReportsTab } from '../components/MyReportsTab';
import type { MedicineRecord, PatientSideEffectReport } from '../types/patient.types';
import { toast } from 'sonner';
import seedData from '../../../../seedData.json';

const MedicalPassportPage: React.FC = () => {
  const { medAlertContract, account } = useWeb3();

  const [medicines, setMedicines] = useState<MedicineRecord[]>([]);
  const [reports, setReports] = useState<PatientSideEffectReport[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMedicineHistory = async () => {
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

      setMedicines(medicineRecords);
      setActiveAlerts(alerts);
    } catch (error) {
      console.error('Error fetching medicine history:', error);
      toast.error('Erreur lors du chargement de l\'historique');
    }
  };

  const fetchMyReports = async () => {
    if (!medAlertContract || !account) {
      return;
    }

    try {
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

      setReports(reportsList);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Erreur lors du chargement des signalements');
    }
  };

  const fetchAllData = async () => {
    setIsLoading(true);
    await Promise.all([
      fetchMedicineHistory(),
      fetchMyReports(),
    ]);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAllData();
  }, [medAlertContract, account]);

  const handleReportSubmitted = () => {
    fetchAllData();
  };

  return (
    <SidebarLayout
      role="patient"
      breadcrumbs={[
        { label: 'Dashboard', href: '/patient' },
        { label: 'Passeport Médical', href: '/patient/passport' },
      ]}
    >
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <FileHeart className="h-8 w-8 text-primary" />
            <h2 className="text-2xl font-bold tracking-tight">Passeport Médical</h2>
          </div>
          <p className="text-muted-foreground">
            Consultez votre historique de médicaments et signalez des effets secondaires
          </p>
        </div>

        <Tabs defaultValue="history" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="history" className="gap-2">
              <Pill className="h-4 w-4" />
              Historique
            </TabsTrigger>
            <TabsTrigger value="report" className="gap-2">
              <AlertCircle className="h-4 w-4" />
              Signaler
            </TabsTrigger>
            <TabsTrigger value="my-reports" className="gap-2">
              <FileText className="h-4 w-4" />
              Mes signalements
              {reports.length > 0 && (
                <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                  {reports.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="space-y-4">
            <MedicineHistoryTab
              medicines={medicines}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="report" className="space-y-4">
            <ReportSideEffectTab
              medicines={medicines}
              onReportSubmitted={handleReportSubmitted}
            />
          </TabsContent>

          <TabsContent value="my-reports" className="space-y-4">
            <MyReportsTab
              reports={reports}
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>
      </div>
    </SidebarLayout>
  );
};

export default MedicalPassportPage;
