/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { SidebarLayout } from "@/shared/layouts/Sidebar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  AlertTriangle,
  Activity,
  Download,
  ShieldAlert,
  Stethoscope,
  Clock,
  Pill,
} from "lucide-react";
import { useWeb3 } from "@/contexts/Web3Context";
import seedData from "../../../../seedData.json";
import { SeverityBarChart } from "../components/SeverityChart";
import { StatCard } from "../components/StatCard";

const AlertsPage: React.FC = () => {
  const { medAlertContract, account } = useWeb3();
  const [, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalCritical: 0,
    mostReportedMed: "N/A",
    distribution: [0, 0, 0], // [Bénin, Modéré, Critique]
  });

  const [criticalAlerts, setCriticalAlerts] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!medAlertContract) return;
      try {
        const filter = medAlertContract.filters.SideEffectReported();
        const events = await medAlertContract.queryFilter(filter, 0, "latest");

        let dist = [0, 0, 0];
        const medCounts: Record<string, number> = {};
        const alerts = [];

        for (const event of events) {
          if ("args" in event) {
            const id = Number((event as any).args[0]);
            const d = await medAlertContract.getSideEffectDetails(id);

            if (d[5]) {
              const severity = Number(d[7]);
              const medId = d[2];

              if (severity < 5) dist[0]++;
              else if (severity < 8) dist[1]++;
              else dist[2]++;

              medCounts[medId] = (medCounts[medId] || 0) + 1;

              if (severity >= 8) {
                const medName =
                  seedData.medicines.find((m) => m.medicineId === medId)
                    ?.name || medId;
                alerts.push({
                  id,
                  medName,
                  symptom: d[3],
                  severity,
                  date: new Date(Number(d[4]) * 1000),
                  validator: d[6],
                  location: "Paris, FR", // Mock location
                });
              }
            }
          }
        }

        const mostReported = Object.entries(medCounts).sort(
          (a, b) => b[1] - a[1]
        )[0];
        const mostReportedName = mostReported
          ? seedData.medicines.find((m) => m.medicineId === mostReported[0])
              ?.name
          : "Aucun";

        setStats({
          totalCritical: dist[2],
          mostReportedMed: mostReportedName || "N/A",
          distribution: dist,
        });

        setCriticalAlerts(alerts.reverse());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [medAlertContract]);

  return (
    <SidebarLayout
      role="doctor"
      breadcrumbs={[{ label: "Centre d'Alertes", href: "/doctor/alerts" }]}
    >
      <div className="space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
              <ShieldAlert className="h-6 w-6 text-red-600" />
              Surveillance Réseau
            </h1>
            <p className="text-muted-foreground mt-1">
              Analyse globale des tendances et alertes de pharmacovigilance.
            </p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Export Rapport
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Alertes Critiques Actives"
            value={stats.totalCritical}
            subtitle="Cas d'urgence vitale signalés"
            icon={<AlertTriangle className="text-red-600" />}
            bg="bg-red-50"
          />
          <StatCard
            title="Molécule sous surveillance"
            value={stats.mostReportedMed}
            subtitle="Plus fort taux de signalement"
            icon={<Activity className="text-orange-600" />}
            bg="bg-orange-50"
          />
          <StatCard
            title="Total Validations Réseau"
            value={stats.distribution.reduce((a, b) => a + b, 0)}
            subtitle="Dossiers traités par la communauté"
            icon={<Stethoscope className="text-blue-600" />}
            bg="bg-blue-50"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="border-gray-200 shadow-sm h-full">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-gray-900">
                Gravité des effets
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <SeverityBarChart distribution={stats.distribution} />
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Activity className="h-5 w-5 text-red-500 animate-pulse" />
                Flux d'Urgence Réseau
              </h2>
              <Badge
                variant="outline"
                className="text-red-600 bg-red-50 border-red-100"
              >
                {criticalAlerts.length} cas prioritaires
              </Badge>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="grid grid-cols-12 gap-4 bg-gray-50/80 p-3 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <div className="col-span-4">Molécule & Date</div>
                <div className="col-span-5">Motif de l'alerte</div>
                <div className="col-span-3 text-right">Validé par</div>
              </div>

              <div className="divide-y divide-gray-100">
                {criticalAlerts.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 italic">
                    Aucun signalement critique sur le réseau. Tout est calme.
                  </div>
                ) : (
                  criticalAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="grid grid-cols-12 gap-4 p-4 hover:bg-red-50/10 transition-colors items-center group"
                    >
                      <div className="col-span-4 space-y-1">
                        <div className="font-bold text-gray-900 flex items-center gap-2">
                          <Pill className="h-4 w-4 text-gray-400" />
                          {alert.medName}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          {alert.date.toLocaleDateString()}
                          <span>•</span>
                          <span className="font-mono">#{alert.id}</span>
                        </div>
                      </div>

                      <div className="col-span-5">
                        <div className="bg-red-50 border border-red-100 rounded-lg p-2 relative">
                          <p className="text-sm text-red-900 font-medium italic line-clamp-2">
                            "{alert.symptom}"
                          </p>
                        </div>
                      </div>

                      <div className="col-span-3 flex flex-col items-end gap-1">
                        <Badge className="bg-red-600 hover:bg-red-700 text-white border-none">
                          Gravité {alert.severity}/10
                        </Badge>
                        <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-1">
                          <Stethoscope className="h-3 w-3" />
                          {account &&
                          alert.validator.toLowerCase() ===
                            account.toLowerCase()
                            ? "Vous"
                            : `${alert.validator.substring(0, 6)}...`}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default AlertsPage;
