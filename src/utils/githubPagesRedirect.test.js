import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/**
 * Tests for GitHub Pages SPA redirect mechanism
 *
 * This tests the redirect logic implemented in:
 * - public/404.html: Captures 404 URLs and redirects to index with encoded path
 * - index.html: Decodes the path and restores the URL using History API
 */
describe('GitHub Pages SPA Redirect Mechanism', () => {
  let originalLocation;
  let originalHistory;

  beforeEach(() => {
    originalLocation = window.location;
    originalHistory = window.history;

    // Mock window.location
    delete window.location;
    window.location = {
      protocol: 'https:',
      hostname: 'xmerr.github.io',
      port: '',
      pathname: '/Square-Gardener/',
      search: '',
      hash: '',
      href: 'https://xmerr.github.io/Square-Gardener/',
    };

    // Mock window.history
    window.history = {
      replaceState: vi.fn(),
    };
  });

  afterEach(() => {
    window.location = originalLocation;
    window.history = originalHistory;
  });

  describe('404.html redirect logic', () => {
    // This simulates the logic in public/404.html
    const build404Redirect = (pathname, search = '', hash = '') => {
      const pathSegmentsToKeep = 1;
      const protocol = 'https:';
      const hostname = 'xmerr.github.io';
      const port = '';

      const redirect =
        protocol + '//' + hostname + (port ? ':' + port : '') +
        pathname.split('/').slice(0, pathSegmentsToKeep + 1).join('/') + '/?/' +
        pathname.slice(1).split('/').slice(pathSegmentsToKeep).join('/').replace(/&/g, '~and~') +
        (search ? '&' + search.slice(1).replace(/&/g, '~and~') : '') +
        hash;

      return redirect;
    };

    it('should redirect /Square-Gardener/my-garden to /?/my-garden', () => {
      const redirect = build404Redirect('/Square-Gardener/my-garden');
      expect(redirect).toBe('https://xmerr.github.io/Square-Gardener/?/my-garden');
    });

    it('should redirect /Square-Gardener/planner to /?/planner', () => {
      const redirect = build404Redirect('/Square-Gardener/planner');
      expect(redirect).toBe('https://xmerr.github.io/Square-Gardener/?/planner');
    });

    it('should redirect /Square-Gardener/watering to /?/watering', () => {
      const redirect = build404Redirect('/Square-Gardener/watering');
      expect(redirect).toBe('https://xmerr.github.io/Square-Gardener/?/watering');
    });

    it('should redirect /Square-Gardener/calendar to /?/calendar', () => {
      const redirect = build404Redirect('/Square-Gardener/calendar');
      expect(redirect).toBe('https://xmerr.github.io/Square-Gardener/?/calendar');
    });

    it('should preserve hash fragments', () => {
      const redirect = build404Redirect('/Square-Gardener/my-garden', '', '#section');
      expect(redirect).toBe('https://xmerr.github.io/Square-Gardener/?/my-garden#section');
    });

    it('should encode ampersands in path', () => {
      const redirect = build404Redirect('/Square-Gardener/path&with&amps');
      expect(redirect).toBe('https://xmerr.github.io/Square-Gardener/?/path~and~with~and~amps');
    });

    it('should preserve and encode query strings', () => {
      const redirect = build404Redirect('/Square-Gardener/my-garden', '?param=value');
      expect(redirect).toBe('https://xmerr.github.io/Square-Gardener/?/my-garden&param=value');
    });

    it('should encode ampersands in query strings', () => {
      const redirect = build404Redirect('/Square-Gardener/my-garden', '?param1=val1&param2=val2');
      expect(redirect).toBe('https://xmerr.github.io/Square-Gardener/?/my-garden&param1=val1~and~param2=val2');
    });
  });

  describe('index.html redirect restoration logic', () => {
    // This simulates the logic in index.html
    const restoreRedirect = (location) => {
      if (location.search && location.search[1] === '/') {
        const decoded = location.search.slice(1).split('&').map(s =>
          s.replace(/~and~/g, '&')
        ).join('?');

        let pathname = location.pathname;
        if (pathname.endsWith('/')) {
          pathname = pathname.slice(0, -1);
        }

        return pathname + decoded + location.hash;
      }
      return null;
    };

    it('should restore /my-garden from /?/my-garden', () => {
      window.location.pathname = '/Square-Gardener/';
      window.location.search = '?/my-garden';

      const restored = restoreRedirect(window.location);
      expect(restored).toBe('/Square-Gardener/my-garden');
    });

    it('should restore /planner from /?/planner', () => {
      window.location.pathname = '/Square-Gardener/';
      window.location.search = '?/planner';

      const restored = restoreRedirect(window.location);
      expect(restored).toBe('/Square-Gardener/planner');
    });

    it('should restore /watering from /?/watering', () => {
      window.location.pathname = '/Square-Gardener/';
      window.location.search = '?/watering';

      const restored = restoreRedirect(window.location);
      expect(restored).toBe('/Square-Gardener/watering');
    });

    it('should restore /calendar from /?/calendar', () => {
      window.location.pathname = '/Square-Gardener/';
      window.location.search = '?/calendar';

      const restored = restoreRedirect(window.location);
      expect(restored).toBe('/Square-Gardener/calendar');
    });

    it('should handle pathname without trailing slash', () => {
      window.location.pathname = '/Square-Gardener';
      window.location.search = '?/my-garden';

      const restored = restoreRedirect(window.location);
      expect(restored).toBe('/Square-Gardener/my-garden');
    });

    it('should handle pathname with trailing slash', () => {
      window.location.pathname = '/Square-Gardener/';
      window.location.search = '?/my-garden';

      const restored = restoreRedirect(window.location);
      expect(restored).toBe('/Square-Gardener/my-garden');
    });

    it('should preserve hash fragments', () => {
      window.location.pathname = '/Square-Gardener/';
      window.location.search = '?/my-garden';
      window.location.hash = '#section';

      const restored = restoreRedirect(window.location);
      expect(restored).toBe('/Square-Gardener/my-garden#section');
    });

    it('should decode ampersands from path', () => {
      window.location.pathname = '/Square-Gardener/';
      window.location.search = '?/path~and~with~and~amps';

      const restored = restoreRedirect(window.location);
      expect(restored).toBe('/Square-Gardener/path&with&amps');
    });

    it('should restore query strings', () => {
      window.location.pathname = '/Square-Gardener/';
      window.location.search = '?/my-garden&param=value';

      const restored = restoreRedirect(window.location);
      expect(restored).toBe('/Square-Gardener/my-garden?param=value');
    });

    it('should decode ampersands in query strings', () => {
      window.location.pathname = '/Square-Gardener/';
      window.location.search = '?/my-garden&param1=val1~and~param2=val2';

      const restored = restoreRedirect(window.location);
      expect(restored).toBe('/Square-Gardener/my-garden?param1=val1&param2=val2');
    });

    it('should return null when search does not start with ?/', () => {
      window.location.pathname = '/Square-Gardener/';
      window.location.search = '?param=value';

      const restored = restoreRedirect(window.location);
      expect(restored).toBeNull();
    });

    it('should return null when search is empty', () => {
      window.location.pathname = '/Square-Gardener/';
      window.location.search = '';

      const restored = restoreRedirect(window.location);
      expect(restored).toBeNull();
    });
  });

  describe('Full redirect flow integration', () => {
    it('should correctly handle full redirect flow for /my-garden', () => {
      // Step 1: User visits /Square-Gardener/my-garden (404)
      const pathname = '/Square-Gardener/my-garden';

      // Step 2: 404.html redirects to /?/my-garden
      const pathSegmentsToKeep = 1;
      const redirectUrl =
        'https://' + 'xmerr.github.io' +
        pathname.split('/').slice(0, pathSegmentsToKeep + 1).join('/') + '/?/' +
        pathname.slice(1).split('/').slice(pathSegmentsToKeep).join('/');

      expect(redirectUrl).toBe('https://xmerr.github.io/Square-Gardener/?/my-garden');

      // Step 3: index.html receives /?/my-garden and decodes it
      window.location.pathname = '/Square-Gardener/';
      window.location.search = '?/my-garden';

      const decoded = window.location.search.slice(1).split('&').map(s =>
        s.replace(/~and~/g, '&')
      ).join('?');

      let finalPathname = window.location.pathname;
      if (finalPathname.endsWith('/')) {
        finalPathname = finalPathname.slice(0, -1);
      }

      const restoredPath = finalPathname + decoded;
      expect(restoredPath).toBe('/Square-Gardener/my-garden');
    });

    it('should correctly handle full redirect flow for /planner with hash', () => {
      // Step 1: User visits /Square-Gardener/planner#section (404)
      const pathname = '/Square-Gardener/planner';
      const hash = '#section';

      // Step 2: 404.html redirects to /?/planner#section
      const pathSegmentsToKeep = 1;
      const redirectUrl =
        'https://' + 'xmerr.github.io' +
        pathname.split('/').slice(0, pathSegmentsToKeep + 1).join('/') + '/?/' +
        pathname.slice(1).split('/').slice(pathSegmentsToKeep).join('/') +
        hash;

      expect(redirectUrl).toBe('https://xmerr.github.io/Square-Gardener/?/planner#section');

      // Step 3: index.html receives /?/planner#section and decodes it
      window.location.pathname = '/Square-Gardener/';
      window.location.search = '?/planner';
      window.location.hash = '#section';

      const decoded = window.location.search.slice(1).split('&').map(s =>
        s.replace(/~and~/g, '&')
      ).join('?');

      let finalPathname = window.location.pathname;
      if (finalPathname.endsWith('/')) {
        finalPathname = finalPathname.slice(0, -1);
      }

      const restoredPath = finalPathname + decoded + window.location.hash;
      expect(restoredPath).toBe('/Square-Gardener/planner#section');
    });
  });
});
