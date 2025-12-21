export interface AlertRecord {
  medicineId: string;
  medicineName: string;
  alertCount: number;
  triggeredAt: number;
  transactionHash: string;
  blockNumber: number;
}

export interface SideEffectDetail {
  reportId: number;
  patientAddress: string;
  medicineId: string;
  symptom: string;
  reportDate: number;
  isValidated: boolean;
  validatedByDoctor: string;
  severity: number;
  isActive: boolean;
}

export interface MedicineWithAlerts {
  medicineId: string;
  medicineName: string;
  totalReports: number;
  validatedReports: number;
  hasAlert: boolean;
  sideEffects: SideEffectDetail[];
}
