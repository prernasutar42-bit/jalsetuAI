import { mockFetch, apiFetch, USE_MOCK } from './client';

const INITIAL_ALERTS = [
  {
    id: 'alt-101',
    district_id: 1,
    district_name: 'Kolhapur',
    level: 'severe',
    message: 'High flood risk in Kolhapur until 6 am. Move vehicles to higher ground. Radhanagari dam discharge active at 48,500 cusecs.',
    time: '12 min ago',
    timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    source: 'District Disaster Control Room, Kolhapur',
  },
  {
    id: 'alt-102',
    district_id: 3,
    district_name: 'Gadchiroli',
    level: 'severe',
    message: 'Wainganga backwaters flooding low causeways. Bhamragad taluka road access temporarily restricted. Emergency boats stationed.',
    time: '28 min ago',
    timestamp: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
    source: 'Collectorate Control Room, Gadchiroli',
  },
  {
    id: 'alt-103',
    district_id: 2,
    district_name: 'Ratnagiri',
    level: 'severe',
    message: 'Kajali river nearing critical threshold at Mirya creek. Fishermen and coastal residents advised to secure marine vessels.',
    time: '45 min ago',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    source: 'IMD Coastal Warning Bulletin',
  },
  {
    id: 'alt-104',
    district_id: 4,
    district_name: 'Raigad',
    level: 'high',
    message: 'Kundalika river discharge elevated near Roha. Avoid non-essential vehicular movement along low-lying river bank bypasses.',
    time: '1 hr ago',
    timestamp: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
    source: 'Sub-Divisional Magistrate, Mangaon',
  },
  {
    id: 'alt-105',
    district_id: 6,
    district_name: 'Mumbai Suburban',
    level: 'high',
    message: 'High tide of 4.3 m anticipated at 14:15. Sluggish stormwater runoff expected in Kurla, Sion, and Milan subway corridors.',
    time: '2 hrs ago',
    timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    source: 'BMC Disaster Management Department',
  },
  {
    id: 'alt-106',
    district_id: 9,
    district_name: 'Thane',
    level: 'high',
    message: 'Ulhas river above warning mark at Badlapur bridge. NDRF company prepositioned for rapid low-ground evacuation.',
    time: '3 hrs ago',
    timestamp: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    source: 'Thane District Disaster Cell',
  },
  {
    id: 'alt-107',
    district_id: 10,
    district_name: 'Sangli',
    level: 'high',
    message: 'Krishna river level rising at Irwin bridge. Riverside grain godowns and market shops advised to shift goods to upper levels.',
    time: '4 hrs ago',
    timestamp: new Date(Date.now() - 240 * 60 * 1000).toISOString(),
    source: 'CWC Flood Forecast Division',
  },
  {
    id: 'alt-108',
    district_id: 16,
    district_name: 'Pune',
    level: 'moderate',
    message: 'Khadakwasla dam outflow maintained at 28,000 cusecs into Mutha river. Riverside pedestrian walkways closed to public.',
    time: '5 hrs ago',
    timestamp: new Date(Date.now() - 300 * 60 * 1000).toISOString(),
    source: 'Irrigation Dept, Pune Division',
  },
];

let alertsStore = [...INITIAL_ALERTS];

export async function getAlerts() {
  if (!USE_MOCK) {
    return await apiFetch('/alerts');
  }

  return mockFetch(() => [...alertsStore], 150);
}

export async function createAlert({ district_id, district_name, level, message }) {
  if (!USE_MOCK) {
    return await apiFetch('/admin/alerts', {
      method: 'POST',
      body: JSON.stringify({
        district_id: Number(district_id),
        district_name,
        level,
        message,
      }),
    });
  }

  return mockFetch(() => {
    const newAlert = {
      id: `alt-${Date.now()}`,
      district_id: Number(district_id),
      district_name,
      level,
      message,
      time: 'Just now',
      timestamp: new Date().toISOString(),
      source: 'State Disaster Emergency Broadcast (Manual)',
    };
    alertsStore = [newAlert, ...alertsStore];
    return newAlert;
  }, 220);
}
