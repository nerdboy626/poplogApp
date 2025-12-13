export const fetchWithAuth = async (url, options = {}, auth) => {
  const token = auth.user?.token;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    auth.logout("expired");
    throw new Error("No token or token is expired.");
  }

  return response;
};
