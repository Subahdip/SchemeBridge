/**
 * Shared Application State Management via sessionStorage for SchemeBridge
 * Enables multi-page session persistence across standalone HTML & React pages.
 */

const ASSESSMENT_KEY = 'schemebridge_assessment';
const SCHEME_KEY = 'schemebridge_matched_scheme';

const AppState = {
  /**
   * Save user eligibility assessment inputs to sessionStorage
   * @param {Object} data - { income, loanAmount, purpose, projectType, educationLevel }
   */
  saveAssessment: function(data) {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        const payload = {
          ...data,
          timestamp: new Date().toISOString()
        };
        sessionStorage.setItem(ASSESSMENT_KEY, JSON.stringify(payload));
        return true;
      } catch (err) {
        console.error('[AppState] Error saving assessment:', err);
        return false;
      }
    }
    return false;
  },

  /**
   * Retrieve saved assessment data from sessionStorage
   * @returns {Object|null} The assessment object or null if not found
   */
  getAssessment: function() {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        const raw = sessionStorage.getItem(ASSESSMENT_KEY);
        return raw ? JSON.parse(raw) : null;
      } catch (err) {
        console.error('[AppState] Error reading assessment:', err);
        return null;
      }
    }
    return null;
  },

  /**
   * Save matched scheme results to sessionStorage
   * @param {Object} scheme - Matched scheme details (interestRate, govtShare, etc.)
   */
  saveScheme: function(scheme) {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        const payload = {
          ...scheme,
          timestamp: new Date().toISOString()
        };
        sessionStorage.setItem(SCHEME_KEY, JSON.stringify(payload));
        return true;
      } catch (err) {
        console.error('[AppState] Error saving scheme:', err);
        return false;
      }
    }
    return false;
  },

  /**
   * Retrieve matched scheme data from sessionStorage
   * @returns {Object|null} The matched scheme object or null if not found
   */
  getScheme: function() {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        const raw = sessionStorage.getItem(SCHEME_KEY);
        return raw ? JSON.parse(raw) : null;
      } catch (err) {
        console.error('[AppState] Error reading scheme:', err);
        return null;
      }
    }
    return null;
  },

  /**
   * Check whether the user has completed an assessment
   * @returns {boolean}
   */
  hasAssessment: function() {
    const data = this.getAssessment();
    return Boolean(data && data.income && data.loanAmount);
  },

  /**
   * Check whether the user has a matched scheme stored
   * @returns {boolean}
   */
  hasScheme: function() {
    const scheme = this.getScheme();
    return Boolean(scheme && scheme.schemeName);
  },

  /**
   * Clear all application assessment and scheme data (for reset)
   */
  clear: function() {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        sessionStorage.removeItem(ASSESSMENT_KEY);
        sessionStorage.removeItem(SCHEME_KEY);
        return true;
      } catch (err) {
        console.error('[AppState] Error clearing state:', err);
        return false;
      }
    }
    return false;
  }
};

// Expose to window for direct browser script inclusion
if (typeof window !== 'undefined') {
  window.AppState = AppState;
}
