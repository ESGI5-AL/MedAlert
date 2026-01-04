import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { FileText, Calendar, CheckCircle, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import type { PatientSideEffectReport } from '../types/patient.types';

interface MyReportsTabProps {
  reports: PatientSideEffectReport[];
  isLoading: boolean;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const MyReportsTab: React.FC<MyReportsTabProps> = ({
  reports,
  isLoading,
  onRefresh,
  isRefreshing,
}) => {
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
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

  const getSeverityLabel = (severity: number): string => {
    if (severity >= 8) return 'Critique';
    if (severity >= 5) return 'Modéré';
    return 'Léger';
  };

  const formatAddress = (address: string): string => {
    if (address === '0x0000000000000000000000000000000000000000') {
      return 'Non validé';
    }
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (reports.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucun signalement</h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-4">
            Vous n'avez pas encore signalé d'effet secondaire. Utilisez l'onglet "Signaler"
            si vous ressentez des symptômes inhabituels.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </CardContent>
      </Card>
    );
  }

  const validatedReports = reports.filter(r => r.isValidated).length;
  const pendingReports = reports.filter(r => !r.isValidated).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Mes signalements ({reports.length})
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total signalements
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.length}</div>
            <p className="text-xs text-muted-foreground">
              Effets secondaires signalés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Validés
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{validatedReports}</div>
            <p className="text-xs text-muted-foreground">
              Confirmés par médecins
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              En attente
            </CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingReports}</div>
            <p className="text-xs text-muted-foreground">
              En cours de validation
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          Historique des signalements
        </h3>

        {reports.map((report) => (
          <Card key={report.reportId} className={!report.isValidated ? 'border-orange-200' : ''}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">{report.medicineName}</CardTitle>
                    <Badge variant="outline" className="font-mono text-xs">
                      {report.medicineId}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {formatDate(report.reportDate)}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant="outline" className="text-xs">
                    Rapport #{report.reportId}
                  </Badge>
                  {report.isValidated ? (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Validé
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1">
                      <Clock className="h-3 w-3" />
                      En attente
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Symptôme signalé:</h4>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                  {report.symptom}
                </p>
              </div>

              {report.isValidated && report.severity > 0 && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-2">Évaluation médicale:</h4>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Sévérité:</span>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${getSeverityColor(report.severity)}`}
                        />
                        <span className="font-medium">
                          {getSeverityLabel(report.severity)} ({report.severity}/10)
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Validé par:</span>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {formatAddress(report.validatedByDoctor)}
                      </code>
                    </div>
                  </div>

                  {report.severity >= 5 && (
                    <Card className="mt-3 border-amber-200 bg-amber-50 dark:bg-amber-950">
                      <CardContent className="pt-4 pb-4">
                        <div className="flex gap-3">
                          <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-amber-800 dark:text-amber-200">
                            {report.severity >= 8
                              ? 'Effet secondaire critique. Consultez votre médecin dès que possible.'
                              : 'Effet secondaire modéré. Surveillez votre état et consultez si les symptômes persistent.'}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {!report.isValidated && (
                <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex gap-3">
                      <Clock className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        Votre signalement est enregistré et en attente de validation par un médecin.
                        Vous serez notifié une fois la validation effectuée.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
