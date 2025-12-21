export interface SaleRecord {
  patientAddress: string;
  medicineId: string;
  medicineName: string;
  quantity: number;
  timestamp: number;
  transactionHash: string;
  blockNumber: number;
}

export interface Medicine {
  medicineId: string;
  name: string;
  description: string;
}
