/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { SidebarLayout } from "@/shared/layouts/Sidebar";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import {
  Activity,
  FileText,
  AlertCircle,
  ArrowRight,
  Clock,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { useWeb3 } from "@/contexts/Web3Context";
import { useNavigate } from "react-router-dom";
import seedData from "../../../../seedData.json";
import { CustomCard } from "../components/CustomCard";

const DoctorDashboard: React.FC = () => {
  const { medAlertContract, account } = useWeb3();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    pending: 0,
    myTotal: 0,
    critical: 0,
    totalNetwork: 0,
  });

  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!medAlertContract || !account) return;
      try {
        const filter = medAlertContract.filters.SideEffectReported();
        const events = await medAlertContract.queryFilter(filter, 0, "latest");

        let pending = 0;
        let myTotal = 0;
        let critical = 0;
        const activity = [];

        const recentEvents = events.slice().reverse().slice(0, 50);

        for (const event of recentEvents) {
          if ("args" in event) {
            const id = Number((event as any).args[0]);
            const d = await medAlertContract.getSideEffectDetails(id);

            const isVal = d[5];
            const validator = d[6] || "";
            const severity = Number(d[7]);

            if (!isVal) {
              pending++;
            } else {
              if (severity >= 8) critical++;

              if (validator.toLowerCase() === account.toLowerCase()) {
                myTotal++;

                if (activity.length < 5) {
                  const medName =
                    seedData.medicines.find((m) => m.medicineId === d[2])
                      ?.name || d[2];
                  activity.push({
                    id,
                    medName,
                    severity,
                    date: new Date(Number(d[4]) * 1000),
                    patientName: `Patient ${d[1].substring(0, 6)}...`,
                  });
                }
              }
            }
          }
        }

        setStats({
          pending,
          myTotal,
          critical,
          totalNetwork: events.length,
        });
        setRecentActivity(activity);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [medAlertContract, account]);

  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <SidebarLayout
      role="doctor"
      breadcrumbs={[{ label: "Tableau de bord", href: "/doctor" }]}
    >
      <div className="space-y-8 max-w-7xl mx-auto">
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Bonjour, Docteur
            </h1>
            <p className="text-muted-foreground mt-2 text-lg flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="capitalize">{today}</span>
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => navigate("/doctor/reports")}
              className="h-12 px-6 text-base shadow-md shadow-primary/20"
            >
              Traiter les signalements <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <CustomCard
            label="En attente"
            value={stats.pending}
            icon={<Clock className="h-5 w-5 text-primary" />}
            trend="Prioritaire"
            trendColor="text-primary"
            loading={loading}
          />
          <CustomCard
            label="Mes Expertises"
            value={stats.myTotal}
            icon={<FileText className="h-5 w-5 text-blue-600" />}
            trend="+12% ce mois"
            trendColor="text-green-600"
            loading={loading}
          />
          <CustomCard
            label="Alertes Critiques"
            value={stats.critical}
            icon={<AlertCircle className="h-5 w-5 text-red-600" />}
            trend="Réseau Global"
            trendColor="text-gray-500"
            loading={loading}
          />
          <CustomCard
            label="Total Réseau"
            value={stats.totalNetwork}
            icon={<Activity className="h-5 w-5 text-emerald-600" />}
            trend="Signalements reçus"
            trendColor="text-gray-500"
            loading={loading}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Accès Rapide</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div
                onClick={() => navigate("/doctor/reports")}
                className="group bg-white p-6 rounded-xl border border-gray-200 hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <FileText className="h-24 w-24 text-primary" />
                </div>
                <div className="relative z-10">
                  <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                    <FileText className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Examiner les dossiers
                  </h3>
                  <p className="text-sm text-gray-500 mt-2 mb-4">
                    Vous avez{" "}
                    <span className="font-bold text-primary">
                      {stats.pending} dossiers
                    </span>{" "}
                    en attente de validation médicale.
                  </p>
                  <span className="text-sm font-semibold text-primary flex items-center group-hover:translate-x-1 transition-transform">
                    Commencer <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                </div>
              </div>

              <div
                onClick={() => navigate("/doctor/alerts")}
                className="group bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-400/50 hover:shadow-lg transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <TrendingUp className="h-24 w-24 text-blue-600" />
                </div>
                <div className="relative z-10">
                  <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                    <Activity className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Statistiques Réseau
                  </h3>
                  <p className="text-sm text-gray-500 mt-2 mb-4">
                    Visualisez la répartition des effets secondaires et les
                    alertes de pharmacovigilance.
                  </p>
                  <span className="text-sm font-semibold text-blue-600 flex items-center group-hover:translate-x-1 transition-transform">
                    Voir l'analyse <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                Vos dernières validations
              </h2>
            </div>

            <Card className="border-none shadow-sm bg-gray-50/50">
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-6 space-y-4">
                    <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />
                    <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />
                    <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />
                  </div>
                ) : recentActivity.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-20" />
                    Aucune activité récente.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {recentActivity.map((act) => (
                      <div
                        key={act.id}
                        className="p-4 flex items-center gap-3 hover:bg-white transition-colors"
                      >
                        <div
                          className={`
                                            h-2 w-2 rounded-full shrink-0
                                            ${
                                              act.severity >= 8
                                                ? "bg-red-500"
                                                : act.severity >= 5
                                                ? "bg-orange-500"
                                                : "bg-green-500"
                                            }
                                        `}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 truncate">
                            {act.medName}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {act.patientName}
                          </p>
                        </div>
                        <span className="text-xs font-mono text-gray-400">
                          {act.date.toLocaleDateString(undefined, {
                            day: "2-digit",
                            month: "2-digit",
                          })}
                        </span>
                      </div>
                    ))}
                    <div
                      className="p-3 text-center text-xs font-medium text-primary cursor-pointer hover:underline border-t border-gray-100"
                      onClick={() => navigate("/doctor/reports")}
                    >
                      Voir tout l'historique
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default DoctorDashboard;
