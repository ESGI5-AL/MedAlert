export interface MedicineRecord {
  medicineId: string;
  medicineName: string;
  purchaseDate: number;
  quantity: number;
  hasAlerts: boolean;
  alertCount: number;
  isValidatedAlert: boolean;
}

export interface PatientSideEffectReport {
  reportId: number;
  medicineId: string;
  medicineName: string;
  symptom: string;
  reportDate: number;
  isValidated: boolean;
  validatedByDoctor: string;
  severity: number;
  isActive: boolean;
}
