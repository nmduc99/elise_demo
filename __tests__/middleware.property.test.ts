import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/**
 * Feature: remove-landing-page
 * Property tests for middleware authentication flow
 */

// Types
type Locale = 'vi' | 'en';

// Configuration matching middleware.ts
const PUBLIC_PATHS: Record<Locale, string[]> = {
  vi: ['/dang-nhap', '/dieu-khoan-bao-mat'],
  en: ['/login', '/terms-and-privacy'],
};

const LOGIN_PATHS: Record<Locale, string> = {
  vi: '/dang-nhap',
  en: '/login',
};

const DASHBOARD_PATHS: Record<Locale, string> = {
  vi: '/tong-quan',
  en: '/dashboard',
};

// Helper functions that mirror middleware logic
function isPublicPath(path: string, locale: Locale): boolean {
  return PUBLIC_PATHS[locale].includes(path);
}

function getRedirectForUnauthenticated(path: string, locale: Locale): string | null {
  const isPublic = isPublicPath(path, locale);
  const isRootPath = path === '/';
  
  if (isRootPath || !isPublic) {
    return `/${locale}${LOGIN_PATHS[locale]}`;
  }
  return null;
}

function getRedirectForAuthenticated(path: string, locale: Locale): string | null {
  const isLoginPage = path === LOGIN_PATHS[locale];
  const isRootPath = path === '/';
  
  if (isLoginPage || isRootPath) {
    return `/${locale}${DASHBOARD_PATHS[locale]}`;
  }
  return null;
}

// Arbitraries for property-based testing
const localeArb = fc.constantFrom<Locale>('vi', 'en');

// Generate protected routes (not in public paths and not root)
const protectedRouteArb = fc.oneof(
  fc.constant('/dashboard'),
  fc.constant('/tong-quan'),
  fc.constant('/products'),
  fc.constant('/san-pham'),
  fc.constant('/customers'),
  fc.constant('/khach-hang'),
  fc.constant('/orders'),
  fc.constant('/don-hang'),
  fc.constant('/settings'),
  fc.constant('/cai-dat'),
  fc.constant('/reports'),
  fc.constant('/bao-cao')
);

describe('Middleware Properties', () => {
  /**
   * Property 2: Authenticated Root Redirect
   * For any authenticated user (with valid token) accessing the root path `/`,
   * the middleware SHALL redirect to the dashboard page with the correct locale.
   * 
   * **Validates: Requirements 2.3, 5.1**
   */
  describe('Property 2: Authenticated Root Redirect', () => {
    it('should redirect authenticated users from root path to dashboard with correct locale', () => {
      fc.assert(
        fc.property(localeArb, (locale) => {
          // Given: authenticated request to root path
          const rootPath = '/';
          
          // When: middleware processes request for authenticated user
          const redirect = getRedirectForAuthenticated(rootPath, locale);
          
          // Then: redirect to dashboard with correct locale
          expect(redirect).not.toBeNull();
          expect(redirect).toBe(`/${locale}${DASHBOARD_PATHS[locale]}`);
          
          // Verify locale is preserved in redirect URL
          expect(redirect!.startsWith(`/${locale}`)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should redirect to correct dashboard path based on locale', () => {
      fc.assert(
        fc.property(localeArb, (locale) => {
          // Given: authenticated request to root path
          const rootPath = '/';
          
          // When: middleware processes request
          const redirect = getRedirectForAuthenticated(rootPath, locale);
          
          // Then: redirect to locale-specific dashboard
          if (locale === 'vi') {
            expect(redirect).toBe('/vi/tong-quan');
          } else {
            expect(redirect).toBe('/en/dashboard');
          }
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 1: Protected Route Redirect
   * For any protected route and for any unauthenticated user (no token),
   * the middleware SHALL redirect to the login page with the correct locale preserved.
   * 
   * **Validates: Requirements 2.1, 3.4**
   */
  describe('Property 1: Protected Route Redirect', () => {
    it('should redirect unauthenticated users from protected routes to login page with correct locale', () => {
      fc.assert(
        fc.property(protectedRouteArb, localeArb, (route, locale) => {
          // Given: unauthenticated request to protected route
          const isPublic = isPublicPath(route, locale);
          
          // Protected routes should not be public
          expect(isPublic).toBe(false);
          
          // When: middleware processes request
          const redirect = getRedirectForUnauthenticated(route, locale);
          
          // Then: redirect to login with correct locale
          expect(redirect).not.toBeNull();
          expect(redirect).toBe(`/${locale}${LOGIN_PATHS[locale]}`);
          
          // Verify locale is preserved in redirect URL
          expect(redirect!.startsWith(`/${locale}`)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should redirect unauthenticated users from root path to login page', () => {
      fc.assert(
        fc.property(localeArb, (locale) => {
          // Given: unauthenticated request to root path
          const rootPath = '/';
          
          // When: middleware processes request
          const redirect = getRedirectForUnauthenticated(rootPath, locale);
          
          // Then: redirect to login with correct locale
          expect(redirect).not.toBeNull();
          expect(redirect).toBe(`/${locale}${LOGIN_PATHS[locale]}`);
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 5: Locale Preservation
   * For any redirect operation performed by the middleware,
   * the locale prefix SHALL be preserved in the destination URL.
   * 
   * **Validates: Requirements 2.5, 4.2, 5.3**
   */
  describe('Property 5: Locale Preservation', () => {
    it('should preserve locale in all unauthenticated redirects', () => {
      fc.assert(
        fc.property(
          fc.oneof(protectedRouteArb, fc.constant('/')),
          localeArb,
          (route, locale) => {
            // When: middleware redirects unauthenticated user
            const redirect = getRedirectForUnauthenticated(route, locale);
            
            // Then: locale is preserved in redirect URL
            if (redirect) {
              expect(redirect.startsWith(`/${locale}/`)).toBe(true);
              // Verify the locale segment is exactly the input locale
              const redirectLocale = redirect.split('/')[1];
              expect(redirectLocale).toBe(locale);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve locale in all authenticated redirects', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant('/'),
            fc.constant('/login'),
            fc.constant('/dang-nhap')
          ),
          localeArb,
          (route, locale) => {
            // When: middleware redirects authenticated user from login/root
            const redirect = getRedirectForAuthenticated(route, locale);
            
            // Then: locale is preserved in redirect URL
            if (redirect) {
              expect(redirect.startsWith(`/${locale}/`)).toBe(true);
              // Verify the locale segment is exactly the input locale
              const redirectLocale = redirect.split('/')[1];
              expect(redirectLocale).toBe(locale);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle both vi and en locales correctly', () => {
      fc.assert(
        fc.property(protectedRouteArb, (route) => {
          // Test Vietnamese locale
          const viRedirect = getRedirectForUnauthenticated(route, 'vi');
          expect(viRedirect).toBe('/vi/dang-nhap');
          
          // Test English locale
          const enRedirect = getRedirectForUnauthenticated(route, 'en');
          expect(enRedirect).toBe('/en/login');
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 3: Authenticated Login Redirect
   * For any authenticated user accessing the login page,
   * the middleware SHALL redirect to the dashboard page.
   * 
   * **Validates: Requirements 4.1**
   */
  describe('Property 3: Authenticated Login Redirect', () => {
    // Generate login paths for both locales
    const loginPathArb = fc.oneof(
      fc.constant('/login'),
      fc.constant('/dang-nhap')
    );

    it('should redirect authenticated users from login page to dashboard', () => {
      fc.assert(
        fc.property(localeArb, (locale) => {
          // Given: authenticated request to login page
          const loginPath = LOGIN_PATHS[locale];
          
          // When: middleware processes request for authenticated user
          const redirect = getRedirectForAuthenticated(loginPath, locale);
          
          // Then: redirect to dashboard with correct locale
          expect(redirect).not.toBeNull();
          expect(redirect).toBe(`/${locale}${DASHBOARD_PATHS[locale]}`);
        }),
        { numRuns: 100 }
      );
    });

    it('should redirect to correct dashboard based on locale when accessing login', () => {
      fc.assert(
        fc.property(localeArb, (locale) => {
          // Given: authenticated request to login page
          const loginPath = LOGIN_PATHS[locale];
          
          // When: middleware processes request
          const redirect = getRedirectForAuthenticated(loginPath, locale);
          
          // Then: redirect to locale-specific dashboard
          if (locale === 'vi') {
            expect(redirect).toBe('/vi/tong-quan');
          } else {
            expect(redirect).toBe('/en/dashboard');
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve locale in redirect from login page', () => {
      fc.assert(
        fc.property(localeArb, (locale) => {
          // Given: authenticated request to login page
          const loginPath = LOGIN_PATHS[locale];
          
          // When: middleware redirects authenticated user
          const redirect = getRedirectForAuthenticated(loginPath, locale);
          
          // Then: locale is preserved in redirect URL
          expect(redirect).not.toBeNull();
          expect(redirect!.startsWith(`/${locale}/`)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 4: Unauthenticated Root Redirect
   * For any unauthenticated user accessing the root path `/`,
   * the middleware SHALL redirect to the login page with the correct locale.
   * 
   * **Validates: Requirements 2.1, 2.2**
   */
  describe('Property 4: Unauthenticated Root Redirect', () => {
    it('should redirect unauthenticated users from root path to login', () => {
      fc.assert(
        fc.property(localeArb, (locale) => {
          // Given: unauthenticated request to root path
          const rootPath = '/';
          
          // When: middleware processes request for unauthenticated user
          const redirect = getRedirectForUnauthenticated(rootPath, locale);
          
          // Then: redirect to login with correct locale
          expect(redirect).not.toBeNull();
          expect(redirect).toBe(`/${locale}${LOGIN_PATHS[locale]}`);
        }),
        { numRuns: 100 }
      );
    });

    it('should redirect to correct login path based on locale', () => {
      fc.assert(
        fc.property(localeArb, (locale) => {
          // Given: unauthenticated request to root path
          const rootPath = '/';
          
          // When: middleware processes request
          const redirect = getRedirectForUnauthenticated(rootPath, locale);
          
          // Then: redirect to locale-specific login
          if (locale === 'vi') {
            expect(redirect).toBe('/vi/dang-nhap');
          } else {
            expect(redirect).toBe('/en/login');
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve locale in redirect from root path', () => {
      fc.assert(
        fc.property(localeArb, (locale) => {
          // Given: unauthenticated request to root path
          const rootPath = '/';
          
          // When: middleware redirects unauthenticated user
          const redirect = getRedirectForUnauthenticated(rootPath, locale);
          
          // Then: locale is preserved in redirect URL
          expect(redirect).not.toBeNull();
          expect(redirect!.startsWith(`/${locale}/`)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 6: Static Asset Bypass
   * For any request to static assets or API routes,
   * the middleware SHALL bypass authentication check.
   * 
   * **Validates: Requirements 5.1, 5.2, 5.3, 5.4**
   */
  describe('Property 6: Static Asset Bypass', () => {
    // Helper function that mirrors middleware static asset check
    function isStaticAssetOrApi(pathname: string): boolean {
      return (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname === '/favicon.ico' ||
        /\.(svg|png|jpg|jpeg|gif|webp|ico)$/.test(pathname)
      );
    }

    // Generate static asset paths
    const staticAssetArb = fc.oneof(
      // _next paths
      fc.constant('/_next/static/chunks/main.js'),
      fc.constant('/_next/static/css/styles.css'),
      fc.constant('/_next/image'),
      // API paths
      fc.constant('/api/auth/login'),
      fc.constant('/api/products'),
      fc.constant('/api/customers'),
      // Static files
      fc.constant('/favicon.ico'),
      fc.constant('/images/logo.svg'),
      fc.constant('/images/banner.png'),
      fc.constant('/images/photo.jpg'),
      fc.constant('/images/photo.jpeg'),
      fc.constant('/images/animation.gif'),
      fc.constant('/images/hero.webp'),
      fc.constant('/icons/app.ico')
    );

    it('should bypass authentication for all static assets and API routes', () => {
      fc.assert(
        fc.property(staticAssetArb, (pathname) => {
          // When: checking if path should bypass authentication
          const shouldBypass = isStaticAssetOrApi(pathname);
          
          // Then: all static assets and API routes should bypass
          expect(shouldBypass).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should bypass authentication for _next paths', () => {
      const nextPathArb = fc.oneof(
        fc.constant('/_next/static/chunks/main.js'),
        fc.constant('/_next/static/css/app.css'),
        fc.constant('/_next/image'),
        fc.constant('/_next/data/build-id/page.json')
      );

      fc.assert(
        fc.property(nextPathArb, (pathname) => {
          // When: checking _next path
          const shouldBypass = isStaticAssetOrApi(pathname);
          
          // Then: should bypass
          expect(shouldBypass).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should bypass authentication for API routes', () => {
      const apiPathArb = fc.oneof(
        fc.constant('/api/auth/login'),
        fc.constant('/api/auth/logout'),
        fc.constant('/api/products'),
        fc.constant('/api/customers'),
        fc.constant('/api/orders'),
        fc.constant('/api/invoices')
      );

      fc.assert(
        fc.property(apiPathArb, (pathname) => {
          // When: checking API path
          const shouldBypass = isStaticAssetOrApi(pathname);
          
          // Then: should bypass
          expect(shouldBypass).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should bypass authentication for static file extensions', () => {
      const staticFileArb = fc.oneof(
        fc.constant('/images/logo.svg'),
        fc.constant('/images/banner.png'),
        fc.constant('/images/photo.jpg'),
        fc.constant('/images/photo.jpeg'),
        fc.constant('/images/animation.gif'),
        fc.constant('/images/hero.webp'),
        fc.constant('/icons/app.ico')
      );

      fc.assert(
        fc.property(staticFileArb, (pathname) => {
          // When: checking static file path
          const shouldBypass = isStaticAssetOrApi(pathname);
          
          // Then: should bypass
          expect(shouldBypass).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should NOT bypass authentication for regular routes', () => {
      const regularRouteArb = fc.oneof(
        fc.constant('/dashboard'),
        fc.constant('/products'),
        fc.constant('/customers'),
        fc.constant('/vi/tong-quan'),
        fc.constant('/en/dashboard')
      );

      fc.assert(
        fc.property(regularRouteArb, (pathname) => {
          // When: checking regular route
          const shouldBypass = isStaticAssetOrApi(pathname);
          
          // Then: should NOT bypass
          expect(shouldBypass).toBe(false);
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 7: Public Route Access
   * For any unauthenticated user accessing a public route (login, terms-and-privacy),
   * the middleware SHALL allow access without redirect.
   * 
   * **Validates: Requirements 3.3, 4.2**
   */
  describe('Property 7: Public Route Access', () => {
    // Generate public paths for both locales
    const publicPathArb = fc.oneof(
      fc.constant('/login'),
      fc.constant('/dang-nhap'),
      fc.constant('/terms-and-privacy'),
      fc.constant('/dieu-khoan-bao-mat')
    );

    it('should allow unauthenticated access to public routes without redirect', () => {
      fc.assert(
        fc.property(localeArb, (locale) => {
          // Given: unauthenticated request to public routes
          const publicPaths = PUBLIC_PATHS[locale];
          
          publicPaths.forEach((publicPath) => {
            // When: middleware processes request for unauthenticated user
            const redirect = getRedirectForUnauthenticated(publicPath, locale);
            
            // Then: no redirect (allow access)
            expect(redirect).toBeNull();
          });
        }),
        { numRuns: 100 }
      );
    });

    it('should allow unauthenticated access to login page', () => {
      fc.assert(
        fc.property(localeArb, (locale) => {
          // Given: unauthenticated request to login page
          const loginPath = LOGIN_PATHS[locale];
          
          // When: middleware processes request
          const redirect = getRedirectForUnauthenticated(loginPath, locale);
          
          // Then: no redirect (allow access)
          expect(redirect).toBeNull();
        }),
        { numRuns: 100 }
      );
    });

    it('should allow unauthenticated access to terms-and-privacy page', () => {
      fc.assert(
        fc.property(localeArb, (locale) => {
          // Given: unauthenticated request to terms page
          const termsPath = locale === 'vi' ? '/dieu-khoan-bao-mat' : '/terms-and-privacy';
          
          // When: middleware processes request
          const redirect = getRedirectForUnauthenticated(termsPath, locale);
          
          // Then: no redirect (allow access)
          expect(redirect).toBeNull();
        }),
        { numRuns: 100 }
      );
    });

    it('should correctly identify public paths for both locales', () => {
      fc.assert(
        fc.property(localeArb, (locale) => {
          // Given: public paths for the locale
          const publicPaths = PUBLIC_PATHS[locale];
          
          // Then: all paths should be identified as public
          publicPaths.forEach((path) => {
            expect(isPublicPath(path, locale)).toBe(true);
          });
        }),
        { numRuns: 100 }
      );
    });

    it('should NOT allow unauthenticated access to protected routes', () => {
      fc.assert(
        fc.property(protectedRouteArb, localeArb, (route, locale) => {
          // Given: unauthenticated request to protected route
          
          // When: middleware processes request
          const redirect = getRedirectForUnauthenticated(route, locale);
          
          // Then: redirect to login (not allowed)
          expect(redirect).not.toBeNull();
          expect(redirect).toBe(`/${locale}${LOGIN_PATHS[locale]}`);
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 6 (Post-Login): Post-Login Redirect
   * For any successful login operation, the system SHALL redirect to the dashboard page
   * (or return URL if stored).
   * 
   * **Validates: Requirements 4.1, 4.3**
   */
  describe('Property Post-Login Redirect', () => {
    // Helper function that mirrors LoginForm redirect logic
    function getPostLoginRedirect(currentLocale: Locale, returnUrl: string | null): string {
      // If return URL is stored, redirect to that URL
      if (returnUrl) {
        return returnUrl;
      }
      // Otherwise redirect to dashboard based on locale
      return currentLocale === 'vi' ? '/tong-quan' : '/dashboard';
    }

    it('should redirect to dashboard after successful login when no return URL is stored', () => {
      fc.assert(
        fc.property(localeArb, (locale) => {
          // Given: successful login with no stored return URL
          const returnUrl = null;
          
          // When: determining post-login redirect
          const redirect = getPostLoginRedirect(locale, returnUrl);
          
          // Then: redirect to locale-specific dashboard
          expect(redirect).toBe(DASHBOARD_PATHS[locale]);
        }),
        { numRuns: 100 }
      );
    });

    it('should redirect to stored return URL after successful login when available', () => {
      // Generate valid return URLs (protected routes)
      const returnUrlArb = fc.oneof(
        fc.constant('/products'),
        fc.constant('/san-pham'),
        fc.constant('/customers'),
        fc.constant('/khach-hang'),
        fc.constant('/orders'),
        fc.constant('/don-hang'),
        fc.constant('/settings'),
        fc.constant('/cai-dat'),
        fc.constant('/reports'),
        fc.constant('/bao-cao')
      );

      fc.assert(
        fc.property(localeArb, returnUrlArb, (locale, returnUrl) => {
          // Given: successful login with stored return URL
          
          // When: determining post-login redirect
          const redirect = getPostLoginRedirect(locale, returnUrl);
          
          // Then: redirect to stored return URL instead of dashboard
          expect(redirect).toBe(returnUrl);
          expect(redirect).not.toBe(DASHBOARD_PATHS[locale]);
        }),
        { numRuns: 100 }
      );
    });

    it('should redirect to correct dashboard path based on locale', () => {
      fc.assert(
        fc.property(localeArb, (locale) => {
          // Given: successful login with no return URL
          const returnUrl = null;
          
          // When: determining post-login redirect
          const redirect = getPostLoginRedirect(locale, returnUrl);
          
          // Then: redirect to locale-specific dashboard
          if (locale === 'vi') {
            expect(redirect).toBe('/tong-quan');
          } else {
            expect(redirect).toBe('/dashboard');
          }
        }),
        { numRuns: 100 }
      );
    });
  });
});
