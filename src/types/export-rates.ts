
export interface DHLExportRate {
  weight: number;
  zone1: number;
  zone2: number;
  zone3: number;
  zone4: number;
  zone5: number;
  zone6: number;
  zone7: number;
  zone8: number;
}

export interface DHLExportRatesDocument {
  list: DHLExportRate[];
}
