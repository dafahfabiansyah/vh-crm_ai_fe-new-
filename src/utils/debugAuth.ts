/**
 * Debug utilities untuk localStorage dan authentication
 */

export const DebugAuth = {  /**
   * Check localStorage contents
   */
  checkLocalStorage() {
    console.log('=== LocalStorage Debug ===');
    console.log('user_data:', localStorage.getItem('user_data'));
    
    try {
      const userData = localStorage.getItem('user_data');
      if (userData) {
        console.log('user_data parsed:', JSON.parse(userData));
      }
    } catch (error) {
      console.log('Error parsing user_data:', error);
    }
    console.log('========================');
  },

  /**
   * Clear localStorage
   */
  clearLocalStorage() {
    localStorage.removeItem('user_data');
    console.log('LocalStorage cleared');
  },

  /**
   * Manually set test data
   */
  setTestAuth() {
    const testUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      business_name: 'Test Business',
      access_token: 'test-token-123'
    };

    localStorage.setItem('user_data', JSON.stringify(testUser));
    console.log('Test auth data set');
    this.checkLocalStorage();
  },

  /**
   * Test authentication flow
   */
  testAuthFlow() {
    console.log('=== Testing Auth Flow ===');
    
    // Import AuthService
    import('../services/authService').then(({ AuthService }) => {
      console.log('1. Checking getStoredToken():', AuthService.getStoredToken());
      console.log('2. Checking getStoredUser():', AuthService.getStoredUser());
      console.log('3. Checking isAuthenticated():', AuthService.isAuthenticated());
    });
  }
};

// Make it available globally for debugging in browser console
(window as any).DebugAuth = DebugAuth;

export default DebugAuth;
