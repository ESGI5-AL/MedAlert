/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { SidebarLayout } from "@/shared/layouts/Sidebar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/shared/components/ui/card";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  ShieldCheck,
  Wallet,
  Store,
  History,
  User as UserIcon,
  AlertCircle,
  Stethoscope,
  Activity,
  FileText,
} from "lucide-react";
import { useWeb3 } from "@/contexts/Web3Context";
import { useSidebarContext } from "@/shared/contexts/SidebarContext";
import { useNavigate } from "react-router-dom";

const ProfilContent: React.FC = () => {
  const { medAlertContract, account } = useWeb3();
  const { user, getUserInitials } = useSidebarContext();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalSales: 0,
    uniquePatients: 0,
    isLoading: false,
  });

  useEffect(() => {
    if (!medAlertContract || !account || !user || user.role !== "pharmacist")
      return;

    setStats((prev) => ({ ...prev, isLoading: true }));
    try {
      const fetchStats = async () => {
        const filter = medAlertContract.filters.MedicineAdded();
        const events = await medAlertContract.queryFilter(filter, 0, "latest");

        let salesCount = 0;
        const patientsSet = new Set<string>();

        for (const event of events) {
          if ("args" in event) {
            const tx = await event.getTransaction();
            if (tx.from.toLowerCase() === account.toLowerCase()) {
              salesCount++;
              const args = (event as any).args;
              if (args && args[0]) patientsSet.add(args[0]);
            }
          }
        }
        setStats({
          totalSales: salesCount,
          uniquePatients: patientsSet.size,
          isLoading: false,
        });
      };
      fetchStats();
    } catch (e) {
      console.error(e);
      setStats((prev) => ({ ...prev, isLoading: false }));
    }
  }, [medAlertContract, account, user]);

  if (!user) return <div className="p-10 text-center">Chargement...</div>;

  const getRoleTheme = () => {
    switch (user.role) {
      case "pharmacist":
        return {
          icon: <Store className="h-6 w-6" />,
          emoji: "🏥",
          color: "bg-blue-100 text-blue-700",
        };
      case "doctor":
        return {
          icon: <Stethoscope className="h-6 w-6" />,
          emoji: "👨‍⚕️",
          color: "bg-indigo-100 text-indigo-700",
        };
      case "patient":
        return {
          icon: <UserIcon className="h-6 w-6" />,
          emoji: "💊",
          color: "bg-purple-100 text-purple-700",
        };
      default:
        return {
          icon: <ShieldCheck className="h-6 w-6" />,
          emoji: "🛡️",
          color: "bg-gray-100 text-gray-700",
        };
    }
  };
  const theme = getRoleTheme();

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* CARTE D'IDENTITÉ */}
      <div className="relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
        <div className="absolute top-0 right-0 opacity-5 p-4 transform translate-x-10 -translate-y-10">
          {React.cloneElement(theme.icon as React.ReactElement, {
            className: "h-64 w-64",
          })}
        </div>

        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
          <Avatar className="h-32 w-32 border-4 border-white shadow-xl bg-gray-50">
            <AvatarFallback className={`text-4xl font-bold ${theme.color}`}>
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-4 flex-1">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-2">
                {user.name} <span className="text-2xl ml-2">{theme.emoji}</span>
              </h1>
              <div className="flex flex-wrap gap-3">
                <Badge
                  className={`px-3 py-1 text-sm font-medium capitalize ${theme.color} border-none`}
                >
                  {theme.icon} <span className="ml-2">{user.role}</span>
                </Badge>
                <Badge
                  variant="outline"
                  className="px-3 py-1 text-sm text-green-600 border-green-200 bg-green-50"
                >
                  <ShieldCheck className="w-3 h-3 mr-1" /> Identité Vérifiée
                </Badge>
              </div>
            </div>

            <div className="bg-gray-50/80 p-3 rounded-lg border border-gray-100 w-fit">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">
                Adresse Wallet Publique
              </p>
              <div className="flex items-center gap-2 font-mono text-sm text-gray-600">
                <Wallet className="h-4 w-4 text-gray-400" /> {user.address}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENU SPÉCIFIQUE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-sm bg-gray-50/50">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" /> Tableau de bord{" "}
              {user.role}
            </CardTitle>
            <CardDescription>
              Vos indicateurs clés et statut en temps réel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {user.role === "pharmacist" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.isLoading ? "..." : stats.totalSales}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Médicaments délivrés
                  </p>
                </div>
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.isLoading ? "..." : stats.uniquePatients}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Patients uniques servis
                  </p>
                </div>
              </div>
            )}
            {user.role === "doctor" && (
              <div className="bg-white p-6 rounded-xl border border-indigo-100 shadow-sm flex items-start gap-4">
                <div className="p-4 bg-indigo-50 rounded-full">
                  <Stethoscope className="h-8 w-8 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Certification Médicale Active
                  </h3>
                  <p className="text-muted-foreground mt-1">
                    Vous etes autoriser à signer et valider les signalements.
                  </p>
                </div>
              </div>
            )}
            {user.role === "patient" && (
              <div className="grid gap-4">
                <div className="bg-white p-5 rounded-xl border shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                    <History className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">
                      Historique Blockchain
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Achats sécurisés.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm h-fit">
          <CardHeader>
            <CardTitle>Accès Rapide</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {user.role === "pharmacist" && (
              <>
                <Button
                  className="w-full justify-start h-12"
                  onClick={() => navigate("/pharmacy/sales")}
                >
                  <Store className="mr-3 h-5 w-5" /> Nouvelle Vente
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start h-12"
                  onClick={() => navigate("/pharmacy/alerts")}
                >
                  <AlertCircle className="mr-3 h-5 w-5 text-orange-500" /> Voir
                  Alertes
                </Button>
              </>
            )}
            {user.role === "doctor" && (
              <Button
                className="w-full justify-start h-12 bg-indigo-600 hover:bg-indigo-700"
                onClick={() => navigate("/doctor/reports")}
              >
                <FileText className="mr-3 h-5 w-5" /> Examiner les signalements
              </Button>
            )}
            {user.role === "patient" && (
              <Button
                className="w-full justify-start h-12 bg-purple-600 hover:bg-purple-700"
                onClick={() => navigate("/patient/passport")}
              >
                <History className="mr-3 h-5 w-5" /> Mon Passeport Médical
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const ProfilPage: React.FC = () => {
  const { role: web3Role } = useWeb3();

  // On convertit le rôle pour la Sidebar
  const getSidebarRole = (): "admin" | "patient" | "doctor" | "pharmacist" => {
    if (web3Role === "PHARMACY") return "pharmacist";
    if (web3Role === "DOCTOR") return "doctor";
    if (web3Role === "ADMIN") return "admin";
    return "patient"; // Par défaut
  };

  const currentRole = getSidebarRole();

  return (
    <SidebarLayout
      role={currentRole}
      breadcrumbs={[{ label: "Paramètres", href: "/profil" }]}
    >
      <ProfilContent />
    </SidebarLayout>
  );
};

export default ProfilPage;
