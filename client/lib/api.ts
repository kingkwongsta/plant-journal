export const fetchWithLogging = async (url: string, options?: RequestInit) => {
  const startTime = performance.now();
  console.log(`[API Call Start] ${options?.method || 'GET'} ${url}`);

  try {
    const response = await fetch(url, options);
    const endTime = performance.now();
    const duration = endTime - startTime;

    if (response.ok) {
      console.log(`[API Call Success] ${options?.method || 'GET'} ${url} - Status: ${response.status} (${duration.toFixed(2)}ms)`);
    } else {
      console.error(`[API Call Failed] ${options?.method || 'GET'} ${url} - Status: ${response.status} (${duration.toFixed(2)}ms)`);
    }

    return response;
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    console.error(`[API Call Error] ${options?.method || 'GET'} ${url} - (${duration.toFixed(2)}ms)`, error);
    throw error;
  }
};
