import "@testing-library/jest-native/extend-expect";

jest.mock("expo-secure-store");
jest.mock("react-native-ble-plx");

jest.mock("react-native-reanimated", () =>
  require("react-native-reanimated/mock")
);

jest.mock("expo-constants", () => ({
  expoConfig: {
    extra: {
      apiUrl: "https://example.com/api"
    }
  }
}));

jest.mock("@lib/api/auth", () => {
  const defaultUser = {
    id: "seed-user",
    name: "Usuário Teste",
    email: "teste@example.com",
    cpf: "00000000000",
    cooperativeId: null,
    cooperativeName: null
  };

  return {
    login: jest.fn(),
    getCurrentUser: jest.fn().mockResolvedValue(defaultUser)
  };
});
