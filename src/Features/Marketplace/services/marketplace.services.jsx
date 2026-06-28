import api from '../../../shared/api/axios.instance';
import { unwrapData } from '../../../shared/utils/formatters';
import { marketplaceEndpoints } from '../marketplace.endpoints';

export const getMarketplaceFilters = async () =>
  unwrapData(await api.get(marketplaceEndpoints.FILTERS));

export const listMarketplaceListings = async (params = {}) =>
  unwrapData(await api.get(marketplaceEndpoints.LISTINGS, { params }));

export const getMarketplaceListing = async (id) =>
  unwrapData(await api.get(marketplaceEndpoints.LISTING(id)));

export const importMarketplaceListing = async (id, organizationId) =>
  unwrapData(
    await api.post(marketplaceEndpoints.IMPORT(id), { organizationId })
  );

export const purchaseMarketplaceListing = async (id, organizationId) =>
  unwrapData(
    await api.post(marketplaceEndpoints.PURCHASE(id), { organizationId })
  );

export const listMarketplaceLibrary = async (params = {}) =>
  unwrapData(await api.get(marketplaceEndpoints.LIBRARY, { params }));

export const listAdminMarketplaceListings = async (params = {}) =>
  unwrapData(await api.get(marketplaceEndpoints.ADMIN_LISTINGS, { params }));

export const getAdminMarketplaceStats = async () =>
  unwrapData(await api.get(marketplaceEndpoints.ADMIN_STATS));

export const getAdminMarketplaceWorkspace = async () =>
  unwrapData(await api.get(marketplaceEndpoints.ADMIN_WORKSPACE));

export const getAdminMarketplaceListing = async (id) =>
  unwrapData(await api.get(marketplaceEndpoints.ADMIN_LISTING(id)));

export const createAdminMarketplaceListing = async (payload) =>
  unwrapData(await api.post(marketplaceEndpoints.ADMIN_LISTINGS, payload));

export const generateAdminMarketplaceListing = async (payload) =>
  unwrapData(await api.post(marketplaceEndpoints.ADMIN_LISTINGS_GENERATE, payload));

export const updateAdminMarketplaceListing = async (id, payload) =>
  unwrapData(await api.patch(marketplaceEndpoints.ADMIN_LISTING(id), payload));

export const resyncAdminMarketplaceListing = async (id) =>
  unwrapData(await api.post(marketplaceEndpoints.ADMIN_LISTING_RESYNC(id)));

export const duplicateAdminMarketplaceListing = async (id) =>
  unwrapData(await api.post(marketplaceEndpoints.ADMIN_LISTING_DUPLICATE(id)));

export const archiveAdminMarketplaceListing = async (id) =>
  unwrapData(await api.delete(marketplaceEndpoints.ADMIN_LISTING(id)));
