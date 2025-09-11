// Utility Functions
export function stm(format) {
  const now = new Date();
  if (format === 't') {
    return now.toISOString().split('T')[0]; // YYYY-MM-DD format
  }
  return now;
}

export function stQrl(key, value) {
  const params = new URLSearchParams(window.location.search);
  params.set(key, value);
  window.history.replaceState({}, '', `?${params.toString()}`);
}

export function gtQrl(key) {
  const params = new URLSearchParams(window.location.search);
  return params.get(key);
}

export function prosesDataSJ(url, params, callback) {
  // Make API call to process SJ data
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params)
  })
  .then(response => response.json())
  .then(data => {
    if (typeof callback === 'function') {
      callback(data);
    }
  })
  .catch(error => {
    console.error('Error processing SJ data:', error);
    if (typeof callback === 'function') {
      callback({ error: 'Failed to load data' });
    }
  });
}