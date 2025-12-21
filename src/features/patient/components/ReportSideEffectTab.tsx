import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { AlertCircle, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useWeb3 } from '@/contexts/Web3Context';
import type { MedicineRecord } from '../types/patient.types';

interface ReportSideEffectTabProps {
  medicines: MedicineRecord[];
  onReportSubmitted: () => void;
}

export const ReportSideEffectTab: React.FC<ReportSideEffectTabProps> = ({
  medicines,
  onReportSubmitted,
}) => {
  const { medAlertContract } = useWeb3();

  const [selectedMedicineId, setSelectedMedicineId] = useState('');
  const [symptom, setSymptom] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errors, setErrors] = useState({
    medicine: '',
    symptom: '',
  });

  const uniqueMedicines = medicines.reduce((acc, current) => {
    const exists = acc.find(item => item.medicineId === current.medicineId);
    if (!exists) {
      acc.push(current);
    }
    return acc;
  }, [] as MedicineRecord[]);

  const validateForm = (): boolean => {
    const newErrors = {
      medicine: '',
      symptom: '',
    };

    if (!selectedMedicineId) {
      newErrors.medicine = 'Veuillez sélectionner un médicament';
    }

    if (!symptom.trim()) {
      newErrors.symptom = 'Veuillez décrire le symptôme';
    } else if (symptom.trim().length < 10) {
      newErrors.symptom = 'La description doit contenir au moins 10 caractères';
    }

    setErrors(newErrors);
    return !newErrors.medicine && !newErrors.symptom;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!medAlertContract) {
      toast.error('Contrat non initialisé');
      return;
    }

    setIsSubmitting(true);

    try {
      const tx = await medAlertContract.reportSideEffect(
        selectedMedicineId,
        symptom.trim()
      );

      toast.info('Transaction soumise. En attente de confirmation...');

      toast.success('Effet secondaire signalé avec succès!');

      setSelectedMedicineId('');
      setSymptom('');
      setErrors({ medicine: '', symptom: '' });

      onReportSubmitted();

    } catch (error: any) {
      console.error('Error reporting side effect:', error);

      let errorMessage = 'Échec du signalement';

      if (error.reason) {
        errorMessage = error.reason;
      } else if (error.message) {
        if (error.message.includes('You don\'t have this medicine')) {
          errorMessage = 'Vous ne possédez pas ce médicament';
        } else {
          errorMessage = error.message;
        }
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (uniqueMedicines.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucun médicament disponible</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Vous devez d'abord acheter un médicament en pharmacie avant de pouvoir signaler un effet secondaire.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <FileText className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                Pourquoi signaler un effet secondaire ?
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Votre signalement aide à détecter les effets indésirables des médicaments et à protéger
                d'autres patients. Un médecin validera votre signalement pour garantir la fiabilité des données.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Signaler un effet secondaire</CardTitle>
          <CardDescription>
            Décrivez l'effet secondaire que vous avez ressenti après la prise d'un médicament
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="medicine">
                Médicament concerné <span className="text-red-500">*</span>
              </Label>
              <Select
                value={selectedMedicineId}
                onValueChange={(value) => {
                  setSelectedMedicineId(value);
                  setErrors({ ...errors, medicine: '' });
                }}
                disabled={isSubmitting}
              >
                <SelectTrigger className={errors.medicine ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Sélectionnez un médicament" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueMedicines.map((medicine) => (
                    <SelectItem key={medicine.medicineId} value={medicine.medicineId}>
                      <div className="flex flex-col">
                        <span className="font-medium">{medicine.medicineName}</span>
                        <span className="text-xs text-muted-foreground">
                          ID: {medicine.medicineId}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.medicine && (
                <p className="text-sm text-red-500">{errors.medicine}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="symptom">
                Description du symptôme <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="symptom"
                placeholder="Décrivez précisément le symptôme ressenti (ex: maux de tête, nausées, éruption cutanée...)"
                value={symptom}
                onChange={(e) => {
                  setSymptom(e.target.value);
                  setErrors({ ...errors, symptom: '' });
                }}
                disabled={isSubmitting}
                rows={5}
                className={errors.symptom ? 'border-red-500' : ''}
              />
              <p className="text-xs text-muted-foreground">
                Minimum 10 caractères. Soyez aussi précis que possible.
              </p>
              {errors.symptom && (
                <p className="text-sm text-red-500">{errors.symptom}</p>
              )}
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  'Signaler l\'effet secondaire'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                Important
              </h3>
              <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
                <li>• Si vous ressentez un effet grave, consultez immédiatement un médecin</li>
                <li>• Votre signalement sera enregistré sur la blockchain de manière permanente</li>
                <li>• Un médecin devra valider votre signalement pour qu'il soit comptabilisé</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
