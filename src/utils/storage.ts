import {
  Product,
  Order,
  BlacklistEntry,
  Customer,
  SubAgent,
  BrandSettings,
  CampaignRecord,
} from "../types/groupbuy";
import {
  INITIAL_BRAND_SETTINGS,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_BLACKLIST,
  INITIAL_CUSTOMERS,
  INITIAL_SUB_AGENTS,
  INITIAL_CAMPAIGNS,
} from "../data/initialData";

const STORAGE_KEYS = {
  BRAND: "groupbuy_brand_settings",
  PRODUCTS: "groupbuy_products",
  ORDERS: "groupbuy_orders",
  BLACKLIST: "groupbuy_blacklist",
  CUSTOMERS: "groupbuy_customers",
  SUB_AGENTS: "groupbuy_sub_agents",
  CAMPAIGNS: "groupbuy_campaigns",
};

export const DATA_CHANGE_EVENT = "groupbuy_data_changed";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function notifyChange(key: string) {
  if (isBrowser()) {
    window.dispatchEvent(new CustomEvent(DATA_CHANGE_EVENT, { detail: { key } }));
  }
}

// Brand Settings
export function getStoredBrandSettings(): BrandSettings {
  if (!isBrowser()) return INITIAL_BRAND_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BRAND);
    return raw ? { ...INITIAL_BRAND_SETTINGS, ...JSON.parse(raw) } : INITIAL_BRAND_SETTINGS;
  } catch {
    return INITIAL_BRAND_SETTINGS;
  }
}

export function saveStoredBrandSettings(settings: BrandSettings): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEYS.BRAND, JSON.stringify(settings));
    notifyChange(STORAGE_KEYS.BRAND);
  } catch (e) {
    console.error("Failed to save brand settings", e);
  }
}

// Products
export function getStoredProducts(): Product[] {
  if (!isBrowser()) return INITIAL_PRODUCTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return raw ? JSON.parse(raw) : INITIAL_PRODUCTS;
  } catch {
    return INITIAL_PRODUCTS;
  }
}

export function saveStoredProducts(products: Product[]): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    notifyChange(STORAGE_KEYS.PRODUCTS);
  } catch (e) {
    console.error("Failed to save products", e);
  }
}

// Orders
export function getStoredOrders(): Order[] {
  if (!isBrowser()) return INITIAL_ORDERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return raw ? JSON.parse(raw) : INITIAL_ORDERS;
  } catch {
    return INITIAL_ORDERS;
  }
}

export function saveStoredOrders(orders: Order[]): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    notifyChange(STORAGE_KEYS.ORDERS);
  } catch (e) {
    console.error("Failed to save orders", e);
  }
}

// Blacklist
export function getStoredBlacklist(): BlacklistEntry[] {
  if (!isBrowser()) return INITIAL_BLACKLIST;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BLACKLIST);
    return raw ? JSON.parse(raw) : INITIAL_BLACKLIST;
  } catch {
    return INITIAL_BLACKLIST;
  }
}

export function saveStoredBlacklist(blacklist: BlacklistEntry[]): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEYS.BLACKLIST, JSON.stringify(blacklist));
    notifyChange(STORAGE_KEYS.BLACKLIST);
  } catch (e) {
    console.error("Failed to save blacklist", e);
  }
}

// Customers
export function getStoredCustomers(): Customer[] {
  if (!isBrowser()) return INITIAL_CUSTOMERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    return raw ? JSON.parse(raw) : INITIAL_CUSTOMERS;
  } catch {
    return INITIAL_CUSTOMERS;
  }
}

export function saveStoredCustomers(customers: Customer[]): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    notifyChange(STORAGE_KEYS.CUSTOMERS);
  } catch (e) {
    console.error("Failed to save customers", e);
  }
}

// Sub Agents
export function getStoredSubAgents(): SubAgent[] {
  if (!isBrowser()) return INITIAL_SUB_AGENTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUB_AGENTS);
    return raw ? JSON.parse(raw) : INITIAL_SUB_AGENTS;
  } catch {
    return INITIAL_SUB_AGENTS;
  }
}

export function saveStoredSubAgents(agents: SubAgent[]): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEYS.SUB_AGENTS, JSON.stringify(agents));
    notifyChange(STORAGE_KEYS.SUB_AGENTS);
  } catch (e) {
    console.error("Failed to save sub agents", e);
  }
}

// Campaigns
export function getStoredCampaigns(): CampaignRecord[] {
  if (!isBrowser()) return INITIAL_CAMPAIGNS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CAMPAIGNS);
    return raw ? JSON.parse(raw) : INITIAL_CAMPAIGNS;
  } catch {
    return INITIAL_CAMPAIGNS;
  }
}

export function saveStoredCampaigns(campaigns: CampaignRecord[]): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEYS.CAMPAIGNS, JSON.stringify(campaigns));
    notifyChange(STORAGE_KEYS.CAMPAIGNS);
  } catch (e) {
    console.error("Failed to save campaigns", e);
  }
}

// Reset all to defaults
export function resetAllDataToDefault(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(STORAGE_KEYS.BRAND);
  localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
  localStorage.removeItem(STORAGE_KEYS.ORDERS);
  localStorage.removeItem(STORAGE_KEYS.BLACKLIST);
  localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
  localStorage.removeItem(STORAGE_KEYS.SUB_AGENTS);
  localStorage.removeItem(STORAGE_KEYS.CAMPAIGNS);
  notifyChange("all");
}

// Aliases
export const loadBrandSettings = getStoredBrandSettings;
export const saveBrandSettings = saveStoredBrandSettings;
export const loadProducts = getStoredProducts;
export const saveProducts = saveStoredProducts;
export const loadOrders = getStoredOrders;
export const saveOrders = saveStoredOrders;
export const loadBlacklist = getStoredBlacklist;
export const saveBlacklist = saveStoredBlacklist;
export const loadCustomers = getStoredCustomers;
export const saveCustomers = saveStoredCustomers;
export const loadSubAgents = getStoredSubAgents;
export const saveSubAgents = saveStoredSubAgents;
export const loadCampaigns = getStoredCampaigns;
export const saveCampaigns = saveStoredCampaigns;
export const resetToInitialData = resetAllDataToDefault;

