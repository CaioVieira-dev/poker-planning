### Rodando pela primeira vez

Depois de clonar o projeto, abra o projeto com o devcontainers(instale a extensão do vscode, se não tiver instalado). Depois disso, o processo é bem direto

```bash
cd poker-planning-v3
sudo chown -R vscode:vscode .
pnpm install
#se o pnpm pedir permissão para rodar scripts, aceite com o "y"
```

Depois de rodar o install, você pode rodar o back e o front em terminais separados, ou usar a extensão terminals para rodar o app.

### Sobre extensões

Nesse projeto eu uso extensoes para ajudar na DX, você pode iniciar normalmente ou iniciar usando `ctrl + shift + p` e `Terminals: Run` (ou se ja estiver tudo certo com o projeto, só de abrir o vscode ele começa rodando o back e o front XD)

---

### Resolvendo problemas

- Tailwind intellisense não funciona
  Se o tailwind intellisense não estiver funcionando, adicione isso nas configs do vscode `"tailwindCSS.experimental.configFile": "poker-planning-v3/src/frontend/index.css"`

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
