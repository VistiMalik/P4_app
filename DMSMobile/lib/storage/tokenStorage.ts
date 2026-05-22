import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "dmsmobile.accessToken";

export async function saveAccessToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
}

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function deleteAccessToken(): Promise<void> {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
}
