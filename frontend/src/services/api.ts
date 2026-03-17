const BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('auth_token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> || {})
  };

  // Attach the token to bypass browser cookie blockers!
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers,
    ...options,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data as T;
}

// Auth
export const api = {
  auth: {
    register: (name: string, email: string, password: string) =>
      request('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) }),

    login: (email: string, password: string) =>
      request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

    me: () => request<{ user: { name: string; email: string; picture?: string } }>('/auth/me'),

    logout: () => request('/auth/logout', { method: 'POST' }),

    googleUrl: () => request<{ url: string }>('/auth/google/url'),
  },

  trains: {
    search: (from: string, to: string, date: string) =>
      request<{ trains: import('../types').Train[] }>(`/trains/search?from=${from}&to=${to}&date=${date}`),

    smartSearch: (from: string, to: string, date: string) =>
      request<{ results: import('../types').TrainSearchResult[] }>(`/trains/smart-search?from=${from}&to=${to}&date=${date}`),

    getById: (id: string) =>
      request<{ train: import('../types').Train }>(`/trains/${id}`),
  },

  seats: {
    // 👇 The updated method signature that accepts the station indexes
    getByTrainAndDate: (trainId: string, date: string, fromIndex?: number, toIndex?: number) =>
      request<{ seats: import('../types').Seat[]; byCoach: Record<string, import('../types').Seat[]> }>(
        `/seats?trainId=${trainId}&date=${date}&fromIndex=${fromIndex}&toIndex=${toIndex}`
      ),
  },

  bookings: {
    confirm: (payload: {
      seatIds: string[];
      socketId: string;
      trainId: string;
      trainName: string;
      trainNumber: string;
      journeyDate: string;
      fromStationId: string;
      fromStationIndex: number;
      toStationId: string;
      toStationIndex: number;
    }) => request('/bookings/confirm', { method: 'POST', body: JSON.stringify(payload) }),

    getMyBookings: () =>
      request<{ bookings: import('../types').Booking[] }>('/bookings'),

    cancel: (bookingId: string) =>
      request('/bookings/cancel', { method: 'POST', body: JSON.stringify({ bookingId }) }),
  },
};

export default api;