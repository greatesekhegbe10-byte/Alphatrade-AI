import { NewsEvent } from '../../types';

export const MOCK_NEWS_EVENTS: NewsEvent[] = [
  { id: '1', title: 'NFP - Non-Farm Payrolls', impact: 'HIGH', time: Date.now() + 3600000, currency: 'USD', forecast: '200K', previous: '185K' },
  { id: '2', title: 'CPI - Consumer Price Index', impact: 'HIGH', time: Date.now() + 7200000, currency: 'GBP', forecast: '3.1%', previous: '3.4%' },
  { id: '3', title: 'ECB Press Conference', impact: 'HIGH', time: Date.now() + 10800000, currency: 'EUR' },
  { id: '4', title: 'Retail Sales m/m', impact: 'MEDIUM', time: Date.now() + 15000000, currency: 'USD', forecast: '0.4%', previous: '0.2%' }
];

export const getNextHighImpactEvent = (currency?: string): NewsEvent | undefined => {
  const now = Date.now();
  return MOCK_NEWS_EVENTS
    .filter(e => e.time > now && e.impact === 'HIGH' && (!currency || e.currency === currency))
    .sort((a, b) => a.time - b.time)[0];
};
