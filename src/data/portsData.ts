import { PortMetadata } from '../types';

export const VERIFIED_PORTS: PortMetadata[] = [
  { port: 'Shanghai', country: 'China', region: 'Asia', avg_throughput_teu_mn: 95.0, records_count: 313 },
  { port: 'Singapore', country: 'Singapore', region: 'Asia', avg_throughput_teu_mn: 40.0, records_count: 313 },
  { port: 'Ningbo', country: 'China', region: 'Asia', avg_throughput_teu_mn: 30.0, records_count: 313 },
  { port: 'Shenzhen', country: 'China', region: 'Asia', avg_throughput_teu_mn: 28.0, records_count: 313 },
  { port: 'Qingdao', country: 'China', region: 'Asia', avg_throughput_teu_mn: 24.0, records_count: 313 },
  { port: 'Busan', country: 'SouthKorea', region: 'Asia', avg_throughput_teu_mn: 22.0, records_count: 313 },
  { port: 'Guangzhou', country: 'China', region: 'Asia', avg_throughput_teu_mn: 22.0, records_count: 313 },
  { port: 'Hong Kong', country: 'China', region: 'Asia', avg_throughput_teu_mn: 18.0, records_count: 313 },
  { port: 'Dubai (Jebel Ali)', country: 'UAE', region: 'MiddleEast', avg_throughput_teu_mn: 15.0, records_count: 313 },
  { port: 'Rotterdam', country: 'Netherlands', region: 'Europe', avg_throughput_teu_mn: 14.0, records_count: 313 },
  { port: 'Antwerp', country: 'Belgium', region: 'Europe', avg_throughput_teu_mn: 12.0, records_count: 313 },
  { port: 'Los Angeles', country: 'USA', region: 'NorthAmerica', avg_throughput_teu_mn: 12.0, records_count: 313 },
  { port: 'Long Beach', country: 'USA', region: 'NorthAmerica', avg_throughput_teu_mn: 11.0, records_count: 313 },
  { port: 'Tanjung Pelepas', country: 'Malaysia', region: 'Asia', avg_throughput_teu_mn: 10.0, records_count: 313 },
  { port: 'Hamburg', country: 'Germany', region: 'Europe', avg_throughput_teu_mn: 9.0, records_count: 313 },
  { port: 'Laem Chabang', country: 'Thailand', region: 'Asia', avg_throughput_teu_mn: 8.0, records_count: 313 },
  { port: 'New York', country: 'USA', region: 'NorthAmerica', avg_throughput_teu_mn: 7.0, records_count: 313 },
  { port: 'Tanjung Priok', country: 'Indonesia', region: 'Asia', avg_throughput_teu_mn: 7.0, records_count: 313 },
  { port: 'Colombo', country: 'SriLanka', region: 'Asia', avg_throughput_teu_mn: 7.0, records_count: 313 },
  { port: 'Felixstowe', country: 'UK', region: 'Europe', avg_throughput_teu_mn: 4.0, records_count: 313 },
];

export const PORT_BENCHMARKS: Record<string, { avg: number; std: number; min: number; max: number; count: number }> = {
  'Shanghai': { avg: 115.68, std: 87.46, min: 31.5, max: 436.8, count: 313 },
  'Singapore': { avg: 76.54, std: 59.32, min: 27.6, max: 353.4, count: 313 },
  'Ningbo': { avg: 65.42, std: 48.71, min: 16.5, max: 257.2, count: 313 },
  'Shenzhen': { avg: 54.81, std: 39.65, min: 16.4, max: 259.3, count: 313 },
  'Qingdao': { avg: 49.37, std: 38.12, min: 14.8, max: 278.0, count: 313 },
  'Busan': { avg: 43.19, std: 34.25, min: 12.5, max: 207.6, count: 313 },
  'Guangzhou': { avg: 46.85, std: 37.19, min: 13.2, max: 228.5, count: 313 },
  'Hong Kong': { avg: 34.62, std: 28.91, min: 8.9, max: 161.3, count: 313 },
  'Dubai (Jebel Ali)': { avg: 31.84, std: 24.52, min: 9.7, max: 138.6, count: 313 },
  'Rotterdam': { avg: 27.95, std: 21.64, min: 7.5, max: 115.6, count: 313 },
  'Antwerp': { avg: 26.43, std: 20.31, min: 7.6, max: 100.0, count: 313 },
  'Los Angeles': { avg: 22.84, std: 19.45, min: 7.2, max: 125.0, count: 313 },
  'Long Beach': { avg: 20.76, std: 17.29, min: 6.4, max: 95.0, count: 313 },
  'Tanjung Pelepas': { avg: 20.15, std: 16.82, min: 6.6, max: 108.3, count: 313 },
  'Hamburg': { avg: 19.34, std: 15.67, min: 4.8, max: 78.0, count: 313 },
  'Laem Chabang': { avg: 17.21, std: 14.53, min: 5.3, max: 82.0, count: 313 },
  'New York': { avg: 14.89, std: 13.71, min: 4.0, max: 86.4, count: 313 },
  'Tanjung Priok': { avg: 13.72, std: 12.45, min: 4.0, max: 82.8, count: 313 },
  'Colombo': { avg: 14.15, std: 12.98, min: 4.2, max: 70.4, count: 313 },
  'Felixstowe': { avg: 7.82, std: 6.94, min: 1.9, max: 41.6, count: 313 },
};

// Trained model weights extracted directly from regressor.joblib & classifier.joblib
export const MODEL_CONSTANTS = {
  quantiles: {
    low_thr: 1.24,
    high_thr: 2.90,
  },
  numMean: [19.750355956336023, 20.475557664926434, 0.9204019933554819, 497.0799003322259, 2020.5320360702422, 6.462743236829615, 26.431419079259612],
  numScale: [19.521527275376812, 27.970868390337973, 0.11659444904859484, 586.749842113816, 1.145882119019032, 3.4661441632267778, 15.178120416312117],
  regressionIntercept: 41.423300712703664,
  regressionCoef: [
    // Cat features (37)
    -0.02207234, 0.02955403, 0.00334512, 0.00610131, -0.00846048, -0.0276507, -0.00634897, -0.01346637,
    -0.02206554, 0.05593246, -0.07284837, 0.01617465, 0.03911455, 0.02458989, 0.03393354, -0.0238112,
    0.01624451, 0.02395524, -0.0212411, -0.03098021, -0.02207234, 0.01502068, -0.00634897, -0.03098021,
    -0.0212411, 0.03393354, 0.02395524, 0.02955403, 0.00334512, -0.02206554, 0.00610131, -0.00846048,
    -0.00074126, -0.00241179, -0.00294826, 0.00610131, -0.00074126,
    // Num features (7)
    0.01007712, 0.08666398, 0.00471397, 48.79948002, 0.000981, 0.01963589, -0.0152872
  ],
  catFeatureNames: [
    "port_Antwerp", "port_Busan", "port_Colombo", "port_Dubai (Jebel Ali)", "port_Felixstowe",
    "port_Guangzhou", "port_Hamburg", "port_Hong Kong", "port_Laem Chabang", "port_Long Beach",
    "port_Los Angeles", "port_New York", "port_Ningbo", "port_Qingdao", "port_Rotterdam",
    "port_Shanghai", "port_Shenzhen", "port_Singapore", "port_Tanjung Pelepas", "port_Tanjung Priok",
    "country_Belgium", "country_China", "country_Germany", "country_Indonesia", "country_Malaysia",
    "country_Netherlands", "country_Singapore", "country_SouthKorea", "country_SriLanka", "country_Thailand",
    "country_UAE", "country_UK", "country_USA", "region_Asia", "region_Europe", "region_MiddleEast", "region_NorthAmerica"
  ]
};
