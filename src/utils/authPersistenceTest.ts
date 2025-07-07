/**
 * Auth Persistence Test Script
 * 
 * Script untuk testing manual auth persistence.
 * Jalankan di browser console untuk debugging.
 */

export const AuthPersistenceTest = {
  /**
   * Test 1: Basic localStorage operations
   */  testLocalStorage() {
    console.log('=== Test 1: localStorage Operations ===');
    
    // Clear first
    localStorage.removeItem('user_data');
    
    // Set test data
    const testUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      business_name: 'Test Business'
    };
    
    localStorage.setItem('user_data', JSON.stringify(testUser));
    
    // Check retrieval
    const retrievedUser = localStorage.getItem('user_data');
      console.log('✅ Set user:', testUser);
    console.log('✅ Retrieved user:', JSON.parse(retrievedUser || '{}'));
    
    return !!retrievedUser;
  },

  /**
   * Test 2: AuthService operations
   */
  async testAuthService() {
    console.log('=== Test 2: AuthService Operations ===');
    
    try {
      const { AuthService } = await import('../services/authService');
      
      // Test getStoredToken
      const token = AuthService.getStoredToken();
      console.log('getStoredToken():', token);
      
      // Test getStoredUser  
      const user = AuthService.getStoredUser();
      console.log('getStoredUser():', user);
      
      // Test isAuthenticated
      const isAuth = AuthService.isAuthenticated();
      console.log('isAuthenticated():', isAuth);
      
      return { token, user, isAuth };
    } catch (error) {
      console.error('❌ AuthService test failed:', error);
      return null;
    }
  },

  /**
   * Test 3: Redux integration
   */
  async testReduxIntegration() {
    console.log('=== Test 3: Redux Integration ===');
    
    try {
      // This would need to be called from a component with access to store
      console.log('ℹ️ Redux test needs to be run from component context');
      console.log('ℹ️ Check Redux DevTools for auth slice state');
    } catch (error) {
      console.error('❌ Redux test failed:', error);
    }
  },

  /**
   * Full test sequence
   */
  async runAllTests() {
    console.log('🚀 Starting Auth Persistence Tests...');
    
    const test1Result = this.testLocalStorage();
    console.log('Test 1 Result:', test1Result ? '✅ PASS' : '❌ FAIL');
    
    const test2Result = await this.testAuthService();
    console.log('Test 2 Result:', test2Result ? '✅ PASS' : '❌ FAIL');
    
    await this.testReduxIntegration();
    
    console.log('🏁 Tests completed. Check logs above for details.');
    
    if (test1Result && test2Result) {
      console.log('✅ Basic auth persistence should work');
      console.log('💡 If still having issues, check:');
      console.log('   1. Backend response includes token field');
      console.log('   2. No errors in AuthInitializer');
      console.log('   3. Redux state updates correctly');
    } else {
      console.log('❌ Basic auth persistence has issues');
      console.log('💡 Check localStorage permissions and implementation');
    }
  }
};

// Make available globally
(window as any).AuthPersistenceTest = AuthPersistenceTest;

export default AuthPersistenceTest;
