import { useCallback, useEffect, useState } from 'react';
import { packageService } from '@/services/account-package.service';
import type { AccountPackage, AccountType, TypeWithPackages } from '@/types/index.type';

/**
 * Hook to fetch packages grouped by type (for homepage)
 */
export function usePackagesGroupedByType() {
  const [data, setData] = useState<TypeWithPackages[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await packageService.getPackagesGroupedByType();
      setData(result);
    } catch (err: unknown) {
      console.error('Failed to fetch packages:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch packages');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook to fetch single package by ID or Slug
 */
export function usePackage(idOrSlug: string) {
  const [pkg, setPackage] = useState<AccountPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!idOrSlug) {
      setPackage(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await packageService.getPackageById(idOrSlug);
      setPackage(result);
    } catch (err: unknown) {
      console.error('Failed to fetch package:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch package');
    } finally {
      setLoading(false);
    }
  }, [idOrSlug]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { pkg, loading, error, refetch: fetchData };
}

/**
 * Hook to fetch account types
 */
export function useAccountTypes() {
  const [types, setTypes] = useState<AccountType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await packageService.getAccountTypes();
      setTypes(result);
    } catch (err: unknown) {
      console.error('Failed to fetch account types:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch types');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { types, loading, error, refetch: fetchData };
}

/**
 * Hook to fetch accounts by package (for LIST mode pages)
 */
export function useAccountsByPackage(
  idOrSlug: string,
  params?: { page?: number; limit?: number; sort?: string }
) {
  const [data, setData] = useState<{
    package: AccountPackage | null;
    accounts: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>({
    package: null,
    accounts: [],
    pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!idOrSlug) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await packageService.getAccountsByPackage(idOrSlug, params);
      setData(result);
    } catch (err: unknown) {
      console.error('Failed to fetch accounts by package:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch accounts');
    } finally {
      setLoading(false);
    }
  }, [idOrSlug, params?.page, params?.limit, params?.sort, params]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...data, loading, error, refetch: fetchData };
}
