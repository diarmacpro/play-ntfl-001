export class utility {
  constructor() {
    // Initialize utility
  }

  // Get URL parameters
  gtParam() {
    const urlParams = new URLSearchParams(window.location.search);
    const params = {};
    for (const [key, value] of urlParams) {
      params[key] = value;
    }
    return params;
  }

  // Set URL parameters
  stParam(params) {
    const url = new URL(window.location);
    // Clear existing params
    url.search = '';
    
    // Add new params
    for (const [key, value] of Object.entries(params)) {
      if (value !== '' && value !== null && value !== undefined) {
        url.searchParams.set(key, value);
      }
    }
    
    window.history.pushState({}, '', url);
  }

  // Convert date time (placeholder implementation)

  // cvDtTm(dt) {
  //   if (!dt) return '-';
  //   try {
  //     const date = new Date(dt);
  //     return date.toLocaleString('id-ID');
  //   } catch (e) {
  //     return dt;
  //   }
  // }

  cvDtTm(dt) {
    if (!dt) return '-';
    try {
      const date = new Date(dt);
      return date.toLocaleString('id-ID', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    } catch (e) {
      return dt;
    }
  }


}