// lib/api/auth/shared/api-fetch
type ApiFetchBaseOptions = RequestInit & {
  auth?: boolean;
  refreshPath?: string;
  accessTokenStorageKey: string;
  authUserStorageKey: string;
};

export async function apiFetchBase(
  input: string,
  options: ApiFetchBaseOptions,
): Promise<Response> {
  const {
    auth = false,
    refreshPath,
    accessTokenStorageKey,
    authUserStorageKey,
    headers,
    ...rest
  } = options;

  const finalHeaders = new Headers(headers);

  if (auth) {
    const accessToken = localStorage.getItem(accessTokenStorageKey);
    if (accessToken) {
      finalHeaders.set("Authorization", `Bearer ${accessToken}`);
    }
  }

  let response = await fetch(input, {
    ...rest,
    headers: finalHeaders,
    credentials: "include",
  });

  if (auth && response.status === 401 && refreshPath) {
    const refreshRes = await fetch(refreshPath, {
      method: "POST",
      credentials: "include",
    });

    const refreshData = await refreshRes.json().catch(() => null);

    if (!refreshRes.ok || !refreshData?.ok || !refreshData?.accessToken) {
      localStorage.removeItem(accessTokenStorageKey);
      localStorage.removeItem(authUserStorageKey);
      return response;
    }

    localStorage.setItem(accessTokenStorageKey, refreshData.accessToken);
    finalHeaders.set("Authorization", `Bearer ${refreshData.accessToken}`);

    response = await fetch(input, {
      ...rest,
      headers: finalHeaders,
      credentials: "include",
    });
  }

  return response;
}