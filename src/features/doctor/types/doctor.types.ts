export interface SideEffectReport {
  id: number;
  patientAddress: string;
  medicineId: string;
  medicineName: string;
  symptom: string;
  date: Date;
  severity?: number;
  isValidated: boolean;
  validatedBy?: string;
}

export interface IPropsStatCard {
  title: string;
  value: number | string;
  subtitle: string;
  icon: React.ReactNode;
  bg: string;
}

export interface IPropsCustomCard {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  trend: string;
  trendColor: string;
  loading: boolean;
}
