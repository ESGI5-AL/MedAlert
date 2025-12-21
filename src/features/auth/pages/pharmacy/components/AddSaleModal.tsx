import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '@/contexts/Web3Context';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { toast } from 'sonner';
import seedData from '../../../../../../seedData.json';
import { Loader2 } from 'lucide-react';

const MEDICINES = seedData.medicines;

interface AddSaleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaleAdded: () => void;
}

export const AddSaleModal: React.FC<AddSaleModalProps> = ({
  open,
  onOpenChange,
  onSaleAdded,
}) => {
  const { medAlertContract } = useWeb3();

  const [patientAddress, setPatientAddress] = useState('');
  const [selectedMedicine, setSelectedMedicine] = useState('');
  const [quantity, setQuantity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errors, setErrors] = useState({
    patientAddress: '',
    medicine: '',
    quantity: '',
  });

  const validateForm = (): boolean => {
    const newErrors = {
      patientAddress: '',
      medicine: '',
      quantity: '',
    };

    if (!patientAddress.trim()) {
      newErrors.patientAddress = 'L\'adresse du patient est requise';
    } else if (!ethers.isAddress(patientAddress)) {
      newErrors.patientAddress = 'Adresse Ethereum invalide';
    }

    if (!selectedMedicine) {
      newErrors.medicine = 'Veuillez sélectionner un médicament';
    }

    if (!quantity.trim()) {
      newErrors.quantity = 'La quantité est requise';
    } else if (isNaN(Number(quantity)) || Number(quantity) <= 0) {
      newErrors.quantity = 'La quantité doit être supérieure à 0';
    } else if (!Number.isInteger(Number(quantity))) {
      newErrors.quantity = 'La quantité doit être un nombre entier';
    }

    setErrors(newErrors);
    return !newErrors.patientAddress && !newErrors.medicine && !newErrors.quantity;
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
      const medicine = MEDICINES.find(m => m.medicineId === selectedMedicine);
      if (!medicine) {
        toast.error('Médicament introuvable');
        return;
      }

      const tx = await medAlertContract.addMedicine(
        patientAddress,
        medicine.medicineId,
        medicine.name,
        BigInt(quantity)
      );

      toast.info('Transaction soumise. En attente de confirmation...');

      const receipt = await tx.wait();

      toast.success(`Médicament ajouté avec succès ! Transaction : ${receipt.hash.slice(0, 10)}...`);

      setPatientAddress('');
      setSelectedMedicine('');
      setQuantity('');
      setErrors({ patientAddress: '', medicine: '', quantity: '' });

      onOpenChange(false);
      onSaleAdded();

    } catch (error: any) {
      console.error('Error adding medicine:', error);

      let errorMessage = 'Échec de l\'ajout du médicament';

      if (error.reason) {
        errorMessage = error.reason;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (!isSubmitting) {
      setPatientAddress('');
      setSelectedMedicine('');
      setQuantity('');
      setErrors({ patientAddress: '', medicine: '', quantity: '' });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ajouter une nouvelle délivrance</DialogTitle>
          <DialogDescription>
            Enregistrez une nouvelle délivrance de médicament à un patient
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="patientAddress">
                Adresse du patient <span className="text-red-500">*</span>
              </Label>
              <Input
                id="patientAddress"
                placeholder="0x..."
                value={patientAddress}
                onChange={(e) => {
                  setPatientAddress(e.target.value);
                  setErrors({ ...errors, patientAddress: '' });
                }}
                disabled={isSubmitting}
                className={errors.patientAddress ? 'border-red-500' : ''}
              />
              {errors.patientAddress && (
                <p className="text-sm text-red-500">{errors.patientAddress}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="medicine">
                Médicament <span className="text-red-500">*</span>
              </Label>
              <Select
                value={selectedMedicine}
                onValueChange={(value) => {
                  setSelectedMedicine(value);
                  setErrors({ ...errors, medicine: '' });
                }}
                disabled={isSubmitting}
              >
                <SelectTrigger className={errors.medicine ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Sélectionnez un médicament" />
                </SelectTrigger>
                <SelectContent>
                  {MEDICINES.map((medicine) => (
                    <SelectItem key={medicine.medicineId} value={medicine.medicineId}>
                      <div className="flex flex-col">
                        <span className="font-medium">{medicine.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {medicine.description}
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

            <div className="grid gap-2">
              <Label htmlFor="quantity">
                Quantité <span className="text-red-500">*</span>
              </Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                step="1"
                placeholder="Entrez la quantité"
                value={quantity}
                onChange={(e) => {
                  setQuantity(e.target.value);
                  setErrors({ ...errors, quantity: '' });
                }}
                disabled={isSubmitting}
                className={errors.quantity ? 'border-red-500' : ''}
              />
              {errors.quantity && (
                <p className="text-sm text-red-500">{errors.quantity}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                'Enregistrer'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
