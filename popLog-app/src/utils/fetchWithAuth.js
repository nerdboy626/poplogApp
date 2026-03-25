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
    if (auth.isLoggedIn) {
      auth.logout("expired");
    }
  }

  console.log(response.status);

  return response;
};
