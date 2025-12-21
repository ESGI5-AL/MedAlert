import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Pill, AlertTriangle, Calendar, Package } from 'lucide-react';
import type { MedicineRecord } from '../types/patient.types';

interface MedicineHistoryTabProps {
  medicines: MedicineRecord[];
  isLoading: boolean;
}

export const MedicineHistoryTab: React.FC<MedicineHistoryTabProps> = ({
  medicines,
  isLoading,
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

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (medicines.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Pill className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucun médicament enregistré</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Votre historique de médicaments apparaîtra ici une fois que vous aurez effectué un achat en pharmacie.
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalMedicines = medicines.length;
  const totalQuantity = medicines.reduce((sum, m) => sum + m.quantity, 0);
  const medicinesWithAlerts = medicines.filter(m => m.hasAlerts).length;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Médicaments différents
            </CardTitle>
            <Pill className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMedicines}</div>
            <p className="text-xs text-muted-foreground">
              Dans votre historique
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Quantité totale
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuantity}</div>
            <p className="text-xs text-muted-foreground">
              Unités achetées
            </p>
          </CardContent>
        </Card>

        <Card className={medicinesWithAlerts > 0 ? 'border-red-500' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Alertes actives
            </CardTitle>
            <AlertTriangle className={`h-4 w-4 ${medicinesWithAlerts > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${medicinesWithAlerts > 0 ? 'text-red-600' : ''}`}>
              {medicinesWithAlerts}
            </div>
            <p className="text-xs text-muted-foreground">
              Médicaments concernés
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historique complet</CardTitle>
          <p className="text-sm text-muted-foreground">
            Liste de tous les médicaments qui vous ont été délivrés
          </p>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Médicament</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead className="text-right">Quantité</TableHead>
                  <TableHead>Date d'achat</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {medicines.map((medicine, index) => (
                  <TableRow key={`${medicine.medicineId}-${index}`}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Pill className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{medicine.medicineName}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {medicine.medicineId}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {medicine.quantity}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(medicine.purchaseDate)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {medicine.hasAlerts ? (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Alerte active
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Normal</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {medicinesWithAlerts > 0 && (
        <Card className="border-red-500 bg-red-50 dark:bg-red-950">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 dark:text-red-100">
                  Attention : {medicinesWithAlerts} médicament{medicinesWithAlerts > 1 ? 's' : ''} sous alerte
                </h3>
                <p className="text-sm text-red-800 dark:text-red-200 mt-1">
                  Certains médicaments de votre historique ont déclenché des alertes de sécurité.
                  Consultez l'onglet "Mes signalements" pour plus de détails ou contactez votre médecin.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
