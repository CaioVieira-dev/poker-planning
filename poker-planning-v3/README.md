# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ["./tsconfig.node.json", "./tsconfig.app.json"],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    "react-x": reactX,
    "react-dom": reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs["recommended-typescript"].rules,
    ...reactDom.configs.recommended.rules,
  },
});
```

ps: se o tailwind intellisense não estiver funcionando, adicione isso nas configs do vscode `"tailwindCSS.experimental.configFile": "poker-planning-v3/src/index.css"`

Nesse projeto eu uso extensoes para ajudar na DX, você pode iniciar normalmente ou iniciar usando `ctrl + shift + p` e `Terminals: Run` (ou se ja estiver tudo certo com o projeto, só de abrir o vscode ele começa rodando o back e o front XD)

---

#### Testando com quick tunnels

A cloudflare tem um "quick tunnel", que cria um proxy para a sua maquina. Isso significa que você pode rodar o projeto no seu computador, criar um tunnel, e mandar o link para outras pessoas poderem acessar o app ao mesmo tempo.

A configuração inicial do container de desenvolvimento não instala os pacotes necessarios da aws. Essa instalação é feita rodando:

```bash
curl -Ls https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o cloudflared.deb
sudo dpkg -i cloudflared.deb
cloudflared --version
#ps: lembre de remover o cloudflared.deb, depois da instalação :)
```

Para criar um tunnel, descomente o "allowedHosts" no vite.config.js, e com o projeto rodando, rode num novo terminal o seguinte comando:

```bash
cloudflared tunnel --url http://localhost:5173/
```

Ele vai gerar algo como

```bash
vscode ➜ /workspaces/poker-planning-v3 (master) $ cloudflared tunnel --url http://localhost:5173/
2025-06-29T14:08:32Z INF Thank you for trying Cloudflare Tunnel. Doing so, without a Cloudflare account, is a quick way to experiment and try it out. However, be aware that these account-less Tunnels have no uptime guarantee, are subject to the Cloudflare Online Services Terms of Use (https://www.cloudflare.com/website-terms/), and Cloudflare reserves the right to investigate your use of Tunnels for violations of such terms. If you intend to use Tunnels in production you should use a pre-created named tunnel by following: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps
2025-06-29T14:08:32Z INF Requesting new quick Tunnel on trycloudflare.com...
2025-06-29T14:08:38Z INF +--------------------------------------------------------------------------------------------+
2025-06-29T14:08:38Z INF |  Your quick Tunnel has been created! Visit it at (it may take some time to be reachable):  |
2025-06-29T14:08:38Z INF |  https://qui-kilometers-standards-temporal.trycloudflare.com                               |
2025-06-29T14:08:38Z INF +--------------------------------------------------------------------------------------------+
...
```

é só copiar o link do terminal e compartilhar. Lembre que depois de fechar o terminal do tunnel ou dar um ctrl+c, o link vai sair do ar, e você vai precisar criar um tunnel novo. btw, como está tudo em memoria, se você parar o back e rodar denovo, todos os jogos serão apagados :)
