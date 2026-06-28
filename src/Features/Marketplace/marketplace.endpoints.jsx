import { BASEURL } from '../../constants/api.constant';

export const marketplaceEndpoints = {
  FILTERS: `${BASEURL}/marketplace/filters`,
  LISTINGS: `${BASEURL}/marketplace/listings`,
  LISTING: (id) => `${BASEURL}/marketplace/listings/${id}`,
  IMPORT: (id) => `${BASEURL}/marketplace/listings/${id}/import`,
  PURCHASE: (id) => `${BASEURL}/marketplace/listings/${id}/purchase`,
  LIBRARY: `${BASEURL}/marketplace/library`,
  ADMIN_LISTINGS: `${BASEURL}/marketplace/admin/listings`,
  ADMIN_LISTINGS_GENERATE: `${BASEURL}/marketplace/admin/listings/generate`,
  ADMIN_STATS: `${BASEURL}/marketplace/admin/stats`,
  ADMIN_WORKSPACE: `${BASEURL}/marketplace/admin/workspace`,
  ADMIN_LISTING: (id) => `${BASEURL}/marketplace/admin/listings/${id}`,
  ADMIN_LISTING_RESYNC: (id) => `${BASEURL}/marketplace/admin/listings/${id}/resync`,
  ADMIN_LISTING_DUPLICATE: (id) => `${BASEURL}/marketplace/admin/listings/${id}/duplicate`,
};
