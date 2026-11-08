import { mockFetch, apiFetch, USE_MOCK } from './client';

const TOKEN_STORAGE_KEY = 'floodwatch_token';
const USERS_STORAGE_KEY = 'floodwatch_users';

const SEED_USERS = [
  {
    id: 'usr-admin-1',
    email: 'admin@floodwatch.test',
    password: 'Admin@123',
    name: 'Disaster Management Officer',
    role: 'admin',
    district_id: 1, // Kolhapur
    created_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'usr-citizen-1',
    email: 'citizen@floodwatch.test',
    password: 'Citizen@123',
    name: 'Ramesh Patil',
    role: 'citizen',
    district_id: 1, // Kolhapur
    created_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
  },
];

function getUsers() {
  const stored = localStorage.getItem(USERS_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(SEED_USERS));
    return SEED_USERS;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return SEED_USERS;
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

function generateFakeJwt(user) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      district_id: user.district_id,
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 3600,
    })
  );
  const signature = btoa('mock-secret-signature-floodwatch');
  return `${header}.${payload}.${signature}`;
}

function parseFakeJwt(token) {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(atob(parts[1]));
  } catch (err) {
    return null;
  }
}

/**
 * Log in with email and password
 */
export async function login(email, password) {
  if (!USE_MOCK) {
    const res = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem(TOKEN_STORAGE_KEY, res.token);
    return res;
  }

  return mockFetch(() => {
    const users = getUsers();
    const user = users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
    );

    if (!user) {
      throw new Error('Invalid email or password. Please verify your credentials.');
    }

    const token = generateFakeJwt(user);
    localStorage.setItem(TOKEN_STORAGE_KEY, token);

    const { password: _, ...safeUser } = user;
    return { token, user: safeUser };
  }, 200);
}

/**
 * Register a new user
 */
export async function register({ email, password, name, role = 'citizen', district_id = 1 }) {
  if (!USE_MOCK) {
    const res = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name,
        email,
        password,
        role,
        district_id: Number(district_id) || 1,
      }),
    });
    localStorage.setItem(TOKEN_STORAGE_KEY, res.token);
    return res;
  }

  return mockFetch(() => {
    const users = getUsers();
    const existing = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const newUser = {
      id: `usr-${Date.now()}`,
      email: email.trim(),
      password,
      name: name.trim(),
      role: role === 'admin' ? 'admin' : 'citizen',
      district_id: Number(district_id) || 1,
      created_at: new Date().toISOString(),
    };

    users.push(newUser);
    saveUsers(users);

    const token = generateFakeJwt(newUser);
    localStorage.setItem(TOKEN_STORAGE_KEY, token);

    const { password: _, ...safeUser } = newUser;
    return { token, user: safeUser };
  }, 220);
}

/**
 * Logout and clear session
 */
export async function logout() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  return Promise.resolve(true);
}

/**
 * Get current authenticated user profile
 */
export async function getMe() {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (!token) return null;

  if (!USE_MOCK) {
    try {
      return await apiFetch('/auth/me');
    } catch (err) {
      return null;
    }
  }

  return mockFetch(() => {
    const claims = parseFakeJwt(token);
    if (!claims) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      return null;
    }

    const users = getUsers();
    const user = users.find((u) => u.id === claims.sub);
    if (!user) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      return null;
    }

    const { password: _, ...safeUser } = user;
    return safeUser;
  }, 100);
}

export function getStoredToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}
