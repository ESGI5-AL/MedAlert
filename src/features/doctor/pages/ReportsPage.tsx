/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from "react";
import { SidebarLayout } from "@/shared/layouts/Sidebar";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import {
  User,
  Clock,
  Search,
  RotateCcw,
  Stethoscope,
  ChevronRight,
} from "lucide-react";
import { useWeb3 } from "@/contexts/Web3Context";
import { toast } from "sonner";
import type { SideEffectReport } from "../types/doctor.types";
import { ValidationModal } from "../components/ValidationModal";
import { EmptyState } from "../components/EmptyState";

const ReportsPage: React.FC = () => {
  const { medAlertContract, account } = useWeb3();

  const [pendingReports, setPendingReports] = useState<SideEffectReport[]>([]);
  const [myHistory, setMyHistory] = useState<SideEffectReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedReport, setSelectedReport] = useState<SideEffectReport | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchReports = async () => {
    if (!medAlertContract || !account) return;
    setLoading(true);
    try {
      const medicineFilter = medAlertContract.filters.MedicineAdded();
      const medicineEvents = await medAlertContract.queryFilter(medicineFilter, 0, "latest");

      const medicineNames = new Map<string, string>();
      for (const event of medicineEvents) {
        if (!('args' in event)) continue;
        const args = event.args;
        if (!medicineNames.has(args.medicineId)) {
          medicineNames.set(args.medicineId, args.medicineName);
        }
      }

      const filter = medAlertContract.filters.SideEffectReported();
      const events = await medAlertContract.queryFilter(filter, 0, "latest");

      const pending: SideEffectReport[] = [];
      const history: SideEffectReport[] = [];

      for (const event of events) {
        if (!('args' in event)) {
          continue;
        }

        const args = event.args;
        const reportId = Number(args.reportId);

        try {
          const rawData = await medAlertContract.getSideEffectDetails(reportId);
          const medicineName = medicineNames.get(rawData.medicineId) || rawData.medicineId;

          const report: SideEffectReport = {
            id: reportId,
            patientAddress: rawData.patientAddress,
            medicineId: rawData.medicineId,
            medicineName: medicineName,
            symptom: rawData.symptom,
            date: new Date(Number(rawData.reportDate) * 1000),
            severity: Number(rawData.severity),
            isValidated: rawData.isValidated,
            validatedBy: rawData.validatedByDoctor || "",
          };

          if (!report.isValidated) {
            pending.push(report);
          } else {
            if (
              report.validatedBy &&
              account &&
              report.validatedBy.toLowerCase() === account.toLowerCase()
            ) {
              history.push(report);
            }
          }
        } catch (err) {
          console.error(`Error fetching report ${reportId}:`, err);
        }
      }

      setPendingReports(
        pending.sort((a, b) => b.date.getTime() - a.date.getTime())
      );
      setMyHistory(history.sort((a, b) => b.date.getTime() - a.date.getTime()));
    } catch (e) {
      toast.error("Synchro échouée");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [medAlertContract, account]);

  const filteredPending = useMemo(() => {
    return pendingReports.filter(
      (r) =>
        r.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.patientAddress.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [pendingReports, searchTerm]);

  const filteredHistory = useMemo(() => {
    return myHistory.filter(
      (r) =>
        r.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.patientAddress.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [myHistory, searchTerm]);

  const handleValidate = async (id: number, severity: number) => {
    if (!medAlertContract) return;
    setIsProcessing(true);
    try {
      const tx = await medAlertContract.validateSideEffect(id, severity);
      toast.info("Validation en cours...");
      await tx.wait();
      toast.success("Validé avec succès !");
      setIsModalOpen(false);

      await new Promise(resolve => setTimeout(resolve, 1000));
      fetchReports();
    } catch (e) {
      console.error(e);
      toast.error("Échec de la validation");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SidebarLayout
      role="doctor"
      breadcrumbs={[{ label: "Signalements", href: "/doctor/reports" }]}
    >
      <div className="space-y-6 h-full flex flex-col">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border shadow-sm">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
              <Stethoscope className="h-6 w-6 text-primary" />
              Gestion des Signalements
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Analysez les rapports d'effets secondaires en temps réel.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-100">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="pl-9 h-10 w-full rounded-md border border-input bg-gray-50/50 px-3 py-2 text-sm focus:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={fetchReports}
              disabled={loading}
              title="Actualiser"
            >
              <RotateCcw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="pending" className="w-full space-y-3">
          <div className="w-full flex flex-col items-center md:items-start">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-xl h-auto">
              <TabsTrigger
                value="pending"
                className="
                            rounded-lg py-2.5 text-sm font-medium text-muted-foreground transition-all
                            data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm
                            flex items-center justify-center gap-2
                        "
              >
                En attente
                {pendingReports.length > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary animate-in zoom-in">
                    {pendingReports.length}
                  </span>
                )}
              </TabsTrigger>

              <TabsTrigger
                value="history"
                className="
                            rounded-lg py-2.5 text-sm font-medium text-muted-foreground transition-all
                            data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm
                            flex items-center justify-center gap-2
                        "
              >
                Historique
                {myHistory.length > 0 && (
                  <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 text-[10px] font-bold text-gray-600">
                    {myHistory.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="min-h-[500px]">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-48 rounded-xl border bg-gray-100/50 animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <>
                <TabsContent
                  value="pending"
                  className="outline-none animate-in fade-in duration-300"
                >
                  {filteredPending.length === 0 ? (
                    <EmptyState
                      title={searchTerm ? "Aucun résultat" : "Tout est à jour"}
                      message={
                        searchTerm
                          ? "Essayez une autre recherche."
                          : "Vous avez traité toutes les demandes."
                      }
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      {filteredPending.map((report) => (
                        <Card
                          key={report.id}
                          className="group hover:border-primary transition-all duration-300 flex flex-col h-full shadow-sm hover:shadow-md bg-white"
                        >
                          <CardContent className="flex flex-col h-full">
                            <div className="flex justify-between items-start mb-3">
                              <Badge
                                variant="outline"
                                className="font-mono text-[10px] text-gray-500 bg-gray-50"
                              >
                                #{report.id}
                              </Badge>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />{" "}
                                {report.date.toLocaleDateString()}
                              </span>
                            </div>

                            <div className="mb-4">
                              <h3
                                className="font-bold text-gray-900 text-lg line-clamp-1"
                                title={report.medicineName}
                              >
                                {report.medicineName}
                              </h3>
                              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                <User className="h-3 w-3" />
                                <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">
                                  {report.patientAddress.substring(0, 12)}...
                                </span>
                              </div>
                            </div>

                            <div className="flex-1 bg-violet-50/50 border border-violet-100 rounded-lg p-3 mb-4 relative">
                              <span className="text-[10px] uppercase font-bold text-violet-400 absolute top-2 right-2">
                                Symptôme
                              </span>
                              <p className="text-sm text-gray-800 italic leading-relaxed pt-3 line-clamp-3">
                                "{report.symptom}"
                              </p>
                            </div>

                            <Button
                              onClick={() => {
                                setSelectedReport(report);
                                setIsModalOpen(true);
                              }}
                              className="w-52 mx-auto bg-white text-gray-900 border border-gray-200 hover:bg-primary hover:text-white hover:border-primary transition-colors"
                            >
                              Examiner{" "}
                              <ChevronRight className="ml-1 h-4 w-4 opacity-50" />
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent
                  value="history"
                  className="mt-0 outline-none animate-in fade-in duration-300"
                >
                  {filteredHistory.length === 0 ? (
                    <EmptyState
                      title="Historique vide"
                      message="Aucune validation effectuée par vous pour le moment."
                    />
                  ) : (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                      <div className="grid grid-cols-12 gap-4 bg-gray-200 p-4 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <div className="col-span-12 md:col-span-3">Dossier</div>
                        <div className="col-span-12 md:col-span-7">
                          Détails Cliniques
                        </div>
                        <div className="col-span-12 md:col-span-2 text-right">
                          Expertise
                        </div>
                      </div>

                      <div className="divide-y divide-gray-100">
                        {filteredHistory.map((report) => (
                          <div
                            key={report.id}
                            className="grid grid-cols-12 gap-6 p-6 hover:bg-gray-50 transition-colors items-start group"
                          >
                            <div className="col-span-12 md:col-span-3 space-y-3">
                              <div>
                                <h4 className="text-base font-bold text-gray-900 leading-tight">
                                  {report.medicineName}
                                </h4>
                                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                                  <Clock className="h-3.5 w-3.5" />
                                  {report.date.toLocaleDateString()}
                                </p>
                              </div>

                              <div className="bg-gray-100/50 rounded-md p-2 w-fit">
                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wide mb-0.5">
                                  Patient
                                </p>
                                <p className="text-xs font-mono text-gray-700 flex items-center gap-1.5">
                                  <User className="h-3 w-3" />
                                  {report.patientAddress.substring(0, 6)}...
                                  {report.patientAddress.substring(38)}
                                </p>
                              </div>
                            </div>

                            <div className="col-span-12 md:col-span-7">
                              <div className="relative pl-4 border-l-2 border-gray-200 group-hover:border-primary/30 transition-colors">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                                  Symptôme déclaré
                                </span>
                                <p className="text-sm text-gray-700 italic leading-relaxed">
                                  "{report.symptom}"
                                </p>
                              </div>
                            </div>

                            <div className="col-span-12 md:col-span-2 flex flex-col items-end justify-center h-full gap-2">
                              <div className="text-right">
                                <span className="text-[10px] text-gray-400 font-semibold uppercase block mb-1">
                                  Gravité
                                </span>
                                <span
                                  className={`
                            text-xl font-bold font-mono
                            ${
                              report.severity! >= 8
                                ? "text-red-600"
                                : report.severity! >= 5
                                ? "text-orange-600"
                                : "text-green-600"
                            }
                        `}
                                >
                                  {report.severity}/10
                                </span>
                              </div>

                              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1 max-w-[80px]">
                                <div
                                  className={`h-full rounded-full ${
                                    report.severity! >= 8
                                      ? "bg-red-500"
                                      : report.severity! >= 5
                                      ? "bg-orange-500"
                                      : "bg-green-500"
                                  }`}
                                  style={{
                                    width: `${(report.severity! / 10) * 100}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
              </>
            )}
          </div>
        </Tabs>

        <ValidationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onValidate={handleValidate}
          report={selectedReport}
          isProcessing={isProcessing}
        />
      </div>
    </SidebarLayout>
  );
};

export default ReportsPage;
