# DMSMobile
Aplicativo movel em Expo/React Native para acompanhar pesagens, gamificacao e historico de coletas na cooperativa.

- Autenticacao e fluxo separado por `expo-router`
- Integracao BLE com a balanca para solicitar/iniciar pesagens
- Dashboard com XP/nivel, leaderboard e indicadores semanais
- Historico, relatorios e perfil do usuario consumindo a API do backend

## Requisitos
- Node.js 20+ e npm 10 (recomendado pelo Expo SDK 52)
- Emulador ou dispositivo Android/iOS configurado
- Conta Expo (necessaria para builds com EAS)

## Configuracao rapida
1. Instale dependencias: `npm install`
2. Crie um `.env` na raiz com suas variaveis:
   ```env
   EXPO_PUBLIC_API_URL=https://sua-api.com/api
   ```
   Essa variavel e lida em `app.config.ts` e usada nas chamadas HTTP.
3. Rode o app:
   - `npm run start` para abrir o bundler do Expo
   - `npm run android` ou `npm run ios` para abrir no emulador/dispositivo

## Scripts uteis
- `npm run start` - inicia o dev client
- `npm run android` / `npm run ios` - executa no emulador/dispositivo
- `npm run lint` - verifica o codigo com ESLint/TypeScript
- `npm test` - roda a suite de testes `jest-expo`

## Estrutura principal
- `app/` - rotas com `expo-router` (login, dashboard, BLE, historico, relatorios, perfil)
- `components/` - componentes de UI compartilhados e providers
- `features/` - hooks e casos de uso (auth, pesagens, leaderboard)
- `lib/` - clientes de API, tema, utilitarios
- `providers/` - contextos globais
- `tests/` - configuracao e testes unitarios

## Qualidade e builds
- Antes de abrir PR, execute `npm run lint` e `npm test`.
- Para limpar caches do bundler, use `npm run start -- --clear`.
- Builds e submissoes podem ser feitas via EAS: `npx eas build --platform android|ios`.
