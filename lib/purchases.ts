import Purchases, {
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
} from 'react-native-purchases';
import { Platform } from 'react-native';

// RevenueCat API Keys
// TODO: Replace with your actual keys from https://app.revenuecat.com/
const REVENUECAT_APPLE_KEY = 'appl_YOUR_KEY_HERE';
const REVENUECAT_GOOGLE_KEY = 'goog_YOUR_KEY_HERE';

export interface SubscriptionPackage {
  identifier: string;
  product: {
    identifier: string;
    title: string;
    description: string;
    price_string: string;
  };
}

class PurchaseService {
  private initialized = false;

  /**
   * Initialize RevenueCat SDK
   */
  async initialize(userId?: string): Promise<void> {
    if (this.initialized) return;

    try {
      const apiKey = Platform.OS === 'ios' ? REVENUECAT_APPLE_KEY : REVENUECAT_GOOGLE_KEY;
      
      Purchases.configure({
        apiKey,
        appUserID: userId,
      });

      // Enable debug logs in development
      if (__DEV__) {
        Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
      }

      this.initialized = true;
      console.log('✅ RevenueCat initialized');
    } catch (error) {
      console.error('❌ RevenueCat initialization failed:', error);
      throw error;
    }
  }

  /**
   * Get available subscription offerings
   */
  async getOfferings(): Promise<PurchasesOffering | null> {
    try {
      const offerings = await Purchases.getOfferings();
      
      if (offerings.current) {
        console.log('✅ Offerings loaded:', offerings.current.availablePackages.length);
        return offerings.current;
      }
      
      console.warn('⚠️ No current offering found');
      return null;
    } catch (error) {
      console.error('❌ Error loading offerings:', error);
      return null;
    }
  }

  /**
   * Purchase a package
   */
  async purchasePackage(pkg: PurchasesPackage): Promise<CustomerInfo> {
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      console.log('✅ Purchase successful');
      return customerInfo;
    } catch (error: any) {
      if (error.userCancelled) {
        console.log('ℹ️ User cancelled purchase');
      } else {
        console.error('❌ Purchase error:', error);
      }
      throw error;
    }
  }

  /**
   * Restore purchases
   */
  async restorePurchases(): Promise<CustomerInfo> {
    try {
      const customerInfo = await Purchases.restorePurchases();
      console.log('✅ Purchases restored');
      return customerInfo;
    } catch (error) {
      console.error('❌ Restore error:', error);
      throw error;
    }
  }

  /**
   * Check if user has active Pro subscription
   */
  async checkProStatus(): Promise<boolean> {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      
      // Check if user has access to "pro" entitlement
      const isPro = customerInfo.entitlements.active['pro'] !== undefined;
      
      console.log(`✅ Pro status: ${isPro}`);
      return isPro;
    } catch (error) {
      console.error('❌ Error checking Pro status:', error);
      return false;
    }
  }

  /**
   * Get customer info
   */
  async getCustomerInfo(): Promise<CustomerInfo> {
    try {
      return await Purchases.getCustomerInfo();
    } catch (error) {
      console.error('❌ Error getting customer info:', error);
      throw error;
    }
  }

  /**
   * Identify user (after sign in)
   */
  async identifyUser(userId: string): Promise<void> {
    try {
      await Purchases.logIn(userId);
      console.log('✅ User identified:', userId);
    } catch (error) {
      console.error('❌ Error identifying user:', error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logoutUser(): Promise<void> {
    try {
      await Purchases.logOut();
      console.log('✅ User logged out from RevenueCat');
    } catch (error) {
      console.error('❌ Error logging out:', error);
      throw error;
    }
  }
}

export const purchaseService = new PurchaseService();

/**
 * Helper to format offering packages for display
 */
export function formatOffering(offering: PurchasesOffering): {
  monthly: SubscriptionPackage | null;
  annual: SubscriptionPackage | null;
} {
  const monthly = offering.availablePackages.find(
    (pkg) => pkg.identifier === '$rc_monthly' || pkg.packageType === 'MONTHLY'
  );

  const annual = offering.availablePackages.find(
    (pkg) => pkg.identifier === '$rc_annual' || pkg.packageType === 'ANNUAL'
  );

  return {
    monthly: monthly
      ? {
          identifier: monthly.identifier,
          product: {
            identifier: monthly.product.identifier,
            title: monthly.product.title,
            description: monthly.product.description,
            price_string: monthly.product.priceString,
          },
        }
      : null,
    annual: annual
      ? {
          identifier: annual.identifier,
          product: {
            identifier: annual.product.identifier,
            title: annual.product.title,
            description: annual.product.description,
            price_string: annual.product.priceString,
          },
        }
      : null,
  };
}

/**
 * Calculate savings percentage for annual vs monthly
 */
export function calculateSavings(monthlyPrice: number, annualPrice: number): number {
  const monthlyYearlyCost = monthlyPrice * 12;
  const savings = ((monthlyYearlyCost - annualPrice) / monthlyYearlyCost) * 100;
  return Math.round(savings);
}
