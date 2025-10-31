export interface District {
    id: string;
    districtId: string;
    name: string;
    state: string;
    latitude?: number;
    longitude?: number;
}

export interface PerformanceData {
  id: string;
  districtId: string;
  month: number;
  year: number;
  totalHouseholds: number;
  totalWorkers: number;
  personDays: number;
  womenParticipation: number;
  scstParticipation: number;
  totalFunds: number;
  fundsUtilized: number;
}

export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface LocationData {
    district: string;
    state: string;
    latitude: number;
    longitude: number;
}

export interface ChartData {
    month: number;
    monthName?: string;
    [key: string]: number | string | undefined;
}
