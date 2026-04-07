// ============================================================
// VENTURESTACK - REVENUECAT (IN-APP PURCHASES)
// ============================================================

import Purchases, {
  PurchasesOffering,
  CustomerInfo,
} from 'react-native-purchases';
import { Platform } from 'react-native';
import { ENV } from '../env';

let isConfigured = false;

export async function configureRevenueCat(userId?: string): Promise<void> {
  if (isConfigured) return;

  try {
    Purchases.configure({
      apiKey: ENV.REVENUECAT_API_KEY,
      appUserID: userId || undefined,
    });
    isConfigured = true;
  } catch (error) {
    console.error('RevenueCat configuration failed:', error);
  }
}

export async function checkProAccess(): Promise<boolean> {
  try {
    const customerInfo: CustomerInfo = await Purchases.getCustomerInfo();
    return (
      customerInfo.entitlements.active[ENV.REVENUECAT_ENTITLEMENT_ID] !== undefined
    );
  } catch {
    return false;
  }
}

export async function getOfferings(): Promise<PurchasesOffering | null> {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  } catch (error) {
    console.error('Failed to fetch offerings:', error);
    return null;
  }
}

export async function purchasePackage(pkg: any): Promise<boolean> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return (
      customerInfo.entitlements.active[ENV.REVENUECAT_ENTITLEMENT_ID] !== undefined
    );
  } catch (error: any) {
    if (!error.userCancelled) {
      console.error('Purchase failed:', error);
    }
    return false;
  }
}

export async function restorePurchases(): Promise<boolean> {
  try {
    const customerInfo = await Purchases.restorePurchases();
    return (
      customerInfo.entitlements.active[ENV.REVENUECAT_ENTITLEMENT_ID] !== undefined
    );
  } catch {
    return false;
  }
}

// Free tier limits
export const FREE_TIER_LIMITS = {
  maxVentures: 2,
  hasScorecard: false,
  hasTaxCenter: false,
  hasExport: false,
  hasReceipts: true,
  hasTimeTracking: true,
};

export const PRO_TIER = {
  maxVentures: Infinity,
  hasScorecard: true,
  hasTaxCenter: true,
  hasExport: true,
  hasReceipts: true,
  hasTimeTracking: true,
};
