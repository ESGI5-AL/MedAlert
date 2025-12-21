import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { ChevronDown, ChevronUp, AlertTriangle, Users, Calendar } from 'lucide-react';
import type { MedicineWithAlerts } from '../types/alerts.types';

interface AlertCardProps {
  medicine: MedicineWithAlerts;
}

export const AlertCard: React.FC<AlertCardProps> = ({ medicine }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getSeverityColor = (severity: number): string => {
    if (severity >= 8) return 'bg-red-500';
    if (severity >= 5) return 'bg-orange-500';
    return 'bg-yellow-500';
  };

  const getSeverityLabel = (severity: number): string => {
    if (severity >= 8) return 'Critique';
    if (severity >= 5) return 'Modéré';
    return 'Léger';
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Card className={medicine.hasAlert ? 'border-red-500 border-2' : ''}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {medicine.hasAlert && (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              )}
              <CardTitle className="text-lg">{medicine.medicineName}</CardTitle>
            </div>
            <div className="flex gap-2 text-sm text-muted-foreground">
              <Badge variant="outline" className="font-mono">
                {medicine.medicineId}
              </Badge>
              {medicine.hasAlert && (
                <Badge variant="destructive">
                  Alerte active
                </Badge>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-red-600">
              {medicine.validatedReports}
            </div>
            <div className="text-xs text-muted-foreground">
              rapports validés
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium">{medicine.totalReports}</div>
              <div className="text-xs text-muted-foreground">Total signalements</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium">
                {medicine.validatedReports} / {medicine.totalReports}
              </div>
              <div className="text-xs text-muted-foreground">Validés par médecins</div>
            </div>
          </div>
        </div>

        {medicine.sideEffects.length > 0 && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-2" />
                  Masquer les détails
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-2" />
                  Voir les {medicine.sideEffects.length} effet{medicine.sideEffects.length > 1 ? 's' : ''} secondaire{medicine.sideEffects.length > 1 ? 's' : ''}
                </>
              )}
            </Button>

            {isExpanded && (
              <div className="mt-4 space-y-3">
                {medicine.sideEffects.map((effect) => (
                  <div
                    key={effect.reportId}
                    className="p-3 border rounded-lg bg-muted/50"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          Rapport #{effect.reportId}
                        </Badge>
                        {effect.isValidated && effect.severity > 0 && (
                          <div className="flex items-center gap-1">
                            <div
                              className={`w-2 h-2 rounded-full ${getSeverityColor(effect.severity)}`}
                            />
                            <span className="text-xs font-medium">
                              {getSeverityLabel(effect.severity)} ({effect.severity}/10)
                            </span>
                          </div>
                        )}
                      </div>
                      {effect.isValidated ? (
                        <Badge variant="default" className="text-xs">
                          Validé
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          En attente
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-1 text-sm">
                      <div>
                        <span className="font-medium">Symptôme:</span>{' '}
                        <span className="text-muted-foreground">{effect.symptom}</span>
                      </div>
                      <div>
                        <span className="font-medium">Patient:</span>{' '}
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">
                          {formatAddress(effect.patientAddress)}
                        </code>
                      </div>
                      <div>
                        <span className="font-medium">Date:</span>{' '}
                        <span className="text-muted-foreground">
                          {formatDate(effect.reportDate)}
                        </span>
                      </div>
                      {effect.isValidated && effect.validatedByDoctor !== '0x0000000000000000000000000000000000000000' && (
                        <div>
                          <span className="font-medium">Validé par:</span>{' '}
                          <code className="text-xs bg-muted px-1 py-0.5 rounded">
                            {formatAddress(effect.validatedByDoctor)}
                          </code>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
