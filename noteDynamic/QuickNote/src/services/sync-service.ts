/**
 * Sync Service for QuickNote Mobile App
 * Integrates with sync-server for note synchronization
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure your sync server URL here
const SYNC_SERVER_URL = process.env.SYNC_SERVER_URL || 'http://localhost:3000';
const API_VERSION = 'api/v1';

// Storage keys
const SYNC_CONFIG_KEY = '@quicknote_sync_config';
const AUTH_TOKENS_KEY = '@quicknote_auth_tokens';
const LAST_SYNC_KEY = '@quicknote_last_sync';

// Types
export interface SyncConfig {
  userId: string;
  deviceId: string;
  webSessionId?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  expiresAt: number;
}

export interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  deviceType: 'ios' | 'android' | 'web';
  pushToken?: string;
}

export interface NoteChange {
  id: string;
  table: 'notes';
  recordId: string;
  action: 'create' | 'update' | 'delete';
  data?: Record<string, unknown>;
  checksum?: string;
  sequence?: number;
  createdAt?: string;
}

export interface PullResponse {
  success: boolean;
  data?: {
    changes: NoteChange[];
    cursor: string | null;
    hasMore: boolean;
    checkpoint: string;
  };
  error?: string;
}

export interface PushResponse {
  success: boolean;
  data?: {
    accepted: string[];
    rejected: Array<{ id: string; reason: string }>;
    conflicts: Array<{
      recordId: string;
      serverData: Record<string, unknown>;
      clientData: Record<string, unknown>;
    }>;
    nextCheckpoint: string;
  };
  error?: string;
}

export interface SyncStatusResponse {
  success: boolean;
  data?: {
    lastSyncAt: string | null;
    pendingChanges: number;
    totalNotes: number;
    deviceCount: number;
  };
  error?: string;
}

// Utility functions
export const generateDeviceId = (): string => {
  return `mobile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const generateNoteId = (): string => {
  return `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Token management
export const saveAuthTokens = async (tokens: AuthTokens): Promise<void> => {
  try {
    await AsyncStorage.setItem(AUTH_TOKENS_KEY, JSON.stringify(tokens));
  } catch (error) {
    console.error('Error saving auth tokens:', error);
    throw error;
  }
};

export const getAuthTokens = async (): Promise<AuthTokens | null> => {
  try {
    const tokens = await AsyncStorage.getItem(AUTH_TOKENS_KEY);
    return tokens ? JSON.parse(tokens) : null;
  } catch (error) {
    console.error('Error getting auth tokens:', error);
    return null;
  }
};

export const clearAuthTokens = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(AUTH_TOKENS_KEY);
  } catch (error) {
    console.error('Error clearing auth tokens:', error);
    throw error;
  }
};

// Sync config management
export const saveSyncConfig = async (config: SyncConfig): Promise<void> => {
  try {
    await AsyncStorage.setItem(SYNC_CONFIG_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Error saving sync config:', error);
    throw error;
  }
};

export const getSyncConfig = async (): Promise<SyncConfig | null> => {
  try {
    const config = await AsyncStorage.getItem(SYNC_CONFIG_KEY);
    return config ? JSON.parse(config) : null;
  } catch (error) {
    console.error('Error getting sync config:', error);
    return null;
  }
};

export const clearSyncConfig = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(SYNC_CONFIG_KEY);
  } catch (error) {
    console.error('Error clearing sync config:', error);
    throw error;
  }
};

// Last sync timestamp
export const saveLastSyncTime = async (timestamp: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(LAST_SYNC_KEY, timestamp);
  } catch (error) {
    console.error('Error saving last sync time:', error);
  }
};

export const getLastSyncTime = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(LAST_SYNC_KEY);
  } catch (error) {
    console.error('Error getting last sync time:', error);
    return null;
  }
};

// API helper with token refresh
const getHeaders = async (includeAuth = true): Promise<HeadersInit> => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const tokens = await getAuthTokens();
    if (tokens?.accessToken) {
      headers['Authorization'] = `Bearer ${tokens.accessToken}`;
    }
  }

  return headers;
};

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  return response.json();
};

// Authentication
export const registerUser = async (
  email: string,
  password: string,
  deviceInfo: DeviceInfo,
  displayName?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch(`${SYNC_SERVER_URL}/${API_VERSION}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, deviceInfo, displayName }),
    });

    const data = await handleResponse<{ success: boolean; data?: { tokens: AuthTokens }; error?: string }>(response);

    if (data.success && data.data) {
      const tokens: AuthTokens = {
        ...data.data.tokens,
        expiresAt: Date.now() + data.data.tokens.expiresIn * 1000,
      };
      await saveAuthTokens(tokens);
      await saveSyncConfig({
        userId: '', // Will be updated after login
        deviceId: deviceInfo.deviceId,
      });
      return { success: true };
    }

    return { success: false, error: data.error || 'Registration failed' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Registration failed';
    console.error('Error registering user:', message);
    return { success: false, error: message };
  }
};

export const loginUser = async (
  email: string,
  password: string,
  deviceInfo: DeviceInfo
): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch(`${SYNC_SERVER_URL}/${API_VERSION}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, deviceInfo }),
    });

    const data = await handleResponse<{ success: boolean; data?: { user: { id: string }; tokens: AuthTokens }; error?: string }>(response);

    if (data.success && data.data) {
      const tokens: AuthTokens = {
        ...data.data.tokens,
        expiresAt: Date.now() + data.data.tokens.expiresIn * 1000,
      };
      await saveAuthTokens(tokens);
      await saveSyncConfig({
        userId: data.data.user.id,
        deviceId: deviceInfo.deviceId,
      });
      return { success: true };
    }

    return { success: false, error: data.error || 'Login failed' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed';
    console.error('Error logging in:', message);
    return { success: false, error: message };
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    const tokens = await getAuthTokens();
    if (tokens?.refreshToken) {
      await fetch(`${SYNC_SERVER_URL}/${API_VERSION}/auth/logout`, {
        method: 'POST',
        headers: await getHeaders(),
        body: JSON.stringify({ refreshToken: tokens.refreshToken }),
      }).catch(() => {});
    }
  } catch (error) {
    console.error('Error logging out:', error);
  } finally {
    await clearAuthTokens();
    await clearSyncConfig();
  }
};

export const refreshAuthToken = async (): Promise<boolean> => {
  try {
    const tokens = await getAuthTokens();
    if (!tokens?.refreshToken) {
      return false;
    }

    const config = await getSyncConfig();

    const response = await fetch(`${SYNC_SERVER_URL}/${API_VERSION}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        refreshToken: tokens.refreshToken,
        deviceId: config?.deviceId,
      }),
    });

    const data = await handleResponse<{ success: boolean; data?: { tokens: AuthTokens }; error?: string }>(response);

    if (data.success && data.data) {
      const newTokens: AuthTokens = {
        ...data.data.tokens,
        expiresAt: Date.now() + data.data.tokens.expiresIn * 1000,
      };
      await saveAuthTokens(newTokens);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return false;
  }
};

// Sync operations
export const pullChanges = async (
  lastSyncAt?: string,
  cursor?: string,
  limit = 100
): Promise<PullResponse> => {
  try {
    const response = await fetch(`${SYNC_SERVER_URL}/${API_VERSION}/sync/pull`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify({ lastSyncAt, cursor, limit }),
    });

    return handleResponse<PullResponse>(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Pull failed';
    console.error('Error pulling changes:', message);
    return { success: false, error: message };
  }
};

export const pushChanges = async (
  changes: NoteChange[],
  checkpoint?: string
): Promise<PushResponse> => {
  try {
    const config = await getSyncConfig();
    const response = await fetch(`${SYNC_SERVER_URL}/${API_VERSION}/sync/push`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify({
        changes,
        checkpoint,
        deviceId: config?.deviceId,
      }),
    });

    return handleResponse<PushResponse>(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Push failed';
    console.error('Error pushing changes:', message);
    return { success: false, error: message };
  }
};

export const getSyncStatus = async (): Promise<SyncStatusResponse> => {
  try {
    const response = await fetch(`${SYNC_SERVER_URL}/${API_VERSION}/sync/status`, {
      method: 'GET',
      headers: await getHeaders(),
    });

    return handleResponse<SyncStatusResponse>(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get sync status';
    console.error('Error getting sync status:', message);
    return { success: false, error: message };
  }
};

export const resolveConflicts = async (
  conflicts: Array<{
    recordId: string;
    table: string;
    resolution: 'client_wins' | 'server_wins' | 'merge';
    mergedData?: Record<string, unknown>;
  }>
): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch(`${SYNC_SERVER_URL}/${API_VERSION}/sync/resolve`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify({ conflicts }),
    });

    const data = await handleResponse<{ success: boolean; error?: string }>(response);
    return { success: data.success, error: data.error };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to resolve conflicts';
    console.error('Error resolving conflicts:', message);
    return { success: false, error: message };
  }
};

// QR Authentication (for linking mobile to web session)
export const authenticateWithQR = async (
  sessionId: string,
  userId: string,
  deviceId: string
): Promise<boolean> => {
  try {
    const response = await fetch(`${SYNC_SERVER_URL}/${API_VERSION}/auth/qr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'authenticate',
        sessionId,
        userId,
        deviceInfo: `Mobile Device ${deviceId}`,
      }),
    });

    const data = await handleResponse<{ success: boolean }>(response);
    return data.success;
  } catch (error) {
    console.error('Error authenticating with QR:', error);
    return false;
  }
};

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  const tokens = await getAuthTokens();
  if (!tokens) return false;

  // Check if token is expired
  if (Date.now() >= tokens.expiresAt) {
    // Try to refresh
    const refreshed = await refreshAuthToken();
    return refreshed;
  }

  return true;
};

// Export a combined sync function that handles pull/push
export interface SyncResult {
  success: boolean;
  pulledChanges: number;
  pushedChanges: number;
  conflicts: number;
  error?: string;
}

export const performSync = async (
  localChanges: NoteChange[],
  onProgress?: (message: string) => void
): Promise<SyncResult> => {
  const result: SyncResult = {
    success: false,
    pulledChanges: 0,
    pushedChanges: 0,
    conflicts: 0,
  };

  try {
    // Check authentication
    const isAuth = await isAuthenticated();
    if (!isAuth) {
      result.error = 'Not authenticated';
      return result;
    }

    onProgress?.('Pulling changes from server...');

    // Pull changes from server
    const lastSync = await getLastSyncTime();
    const pullResult = await pullChanges(lastSync);

    if (!pullResult.success) {
      result.error = pullResult.error || 'Failed to pull changes';
      return result;
    }

    if (pullResult.data) {
      result.pulledChanges = pullResult.data.changes.length;

      // Update last sync time
      if (pullResult.data.checkpoint) {
        await saveLastSyncTime(pullResult.data.checkpoint);
      }
    }

    onProgress?.('Pushing local changes...');

    // Push local changes
    if (localChanges.length > 0) {
      const pushResult = await pushChanges(localChanges);

      if (!pushResult.success) {
        result.error = pushResult.error || 'Failed to push changes';
        return result;
      }

      result.pushedChanges = pushResult.data?.accepted.length || 0;
      result.conflicts = pushResult.data?.conflicts.length || 0;

      // Handle conflicts if any
      if (result.conflicts > 0 && pushResult.data?.conflicts) {
        onProgress?.(`Found ${result.conflicts} conflicts - manual resolution required`);

        // Auto-resolve with client wins for now
        const conflictResolutions = pushResult.data.conflicts.map((c) => ({
          recordId: c.recordId,
          table: 'notes',
          resolution: 'client_wins' as const,
        }));

        await resolveConflicts(conflictResolutions);
      }
    }

    result.success = true;
    onProgress?.('Sync completed successfully');
  } catch (error) {
    result.error = error instanceof Error ? error.message : 'Sync failed';
    onProgress?.(`Sync failed: ${result.error}`);
  }

  return result;
};
