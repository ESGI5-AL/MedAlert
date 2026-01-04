import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import {
  Loader2,
  Activity,
  User,
  Pill,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import type { SideEffectReport } from "../types/doctor.types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onValidate: (id: number, severity: number) => Promise<void>;
  report: SideEffectReport | null;
  isProcessing: boolean;
}

export const ValidationModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onValidate,
  report,
  isProcessing,
}) => {
  const [severity, setSeverity] = useState(5);

  if (!report) return null;

  const handleValidate = () => onValidate(report.id, severity);

  const getSeverityColor = (val: number) => {
    if (val >= 8) return "text-red-600";
    if (val >= 5) return "text-orange-600";
    return "text-green-600";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[750px] p-0 overflow-hidden gap-0">
        <DialogHeader className="p-6 bg-gray-50 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl text-gray-800">
            <Activity className="h-5 w-5 text-primary" /> Validation Clinique
            <Badge variant="outline" className="ml-auto">
              #{report.id}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Certification de l'exactitude médicale.
          </DialogDescription>
        </DialogHeader>

        <div className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Médicament suspecté
                </span>
                <div className="flex items-center gap-2 text-lg font-bold text-gray-900">
                  <div className="p-1.5 bg-blue-50 text-primary rounded-md">
                    <Pill className="h-4 w-4" />
                  </div>
                  {report.medicineName}
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Patient ID
                </span>
                <div className="mt-1">
                  <Badge
                    variant="outline"
                    className="font-mono text-xs text-gray-600 bg-gray-50"
                  >
                    <User className="h-3 w-3 mr-1 opacity-50" />
                    {report.patientAddress.substring(0, 6)}...
                    {report.patientAddress.substring(38)}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="relative bg-gray-50/80 border-l-4 border-primary/30 rounded-r-lg p-4">
              <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest absolute top-2 right-2">
                Symptôme rapporté
              </span>
              <p className="text-sm text-gray-800 italic leading-relaxed pt-2">
                "{report.symptom}"
              </p>
            </div>
          </div>

          <hr className="border-gray-100" />

          <div className="space-y-8">
            <div className="flex justify-between items-end">
              <div>
                <Label className="text-base font-semibold text-gray-900">
                  Estimation de la gravité
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Impact clinique sur le patient
                </p>
              </div>
              <div
                className={`text-3xl font-bold transition-colors duration-300 ${getSeverityColor(
                  severity
                )}`}
              >
                {severity}
                <span className="text-lg text-gray-400 font-medium">/10</span>
              </div>
            </div>

            <div className="relative">
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={severity}
                onChange={(e) => setSeverity(Number(e.target.value))}
                className="w-full h-3 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-current focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/20"
                style={{
                  accentColor:
                    severity >= 8
                      ? "#dc2626"
                      : severity >= 5
                      ? "#ea580c"
                      : "#16a34a",
                }}
              />

              <div className="flex justify-between mt-2 text-[10px] uppercase font-bold tracking-widest text-gray-400">
                <span
                  className={
                    severity < 5 ? "text-green-600 transition-colors" : ""
                  }
                >
                  Bénin
                </span>
                <span
                  className={
                    severity >= 5 && severity < 8
                      ? "text-orange-600 transition-colors"
                      : ""
                  }
                >
                  Modéré
                </span>
                <span
                  className={
                    severity >= 8 ? "text-red-600 transition-colors" : ""
                  }
                >
                  Urgence Vitale
                </span>
              </div>
            </div>

            {severity >= 8 && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300 bg-red-50 border border-red-100 rounded-lg p-3 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-red-700">
                    Alerte Prioritaire Déclenchée
                  </p>
                  <p className="text-xs text-red-600 mt-0.5 leading-snug">
                    Une notification immédiate sera envoyée à la pharmacie et au
                    laboratoire fabricant.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="p-6 bg-gray-50 border-t">
          <Button variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button
            onClick={handleValidate}
            disabled={isProcessing}
            className={severity >= 8 ? "bg-red-600 hover:bg-red-700" : ""}
          >
            {isProcessing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" /> Valider
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
