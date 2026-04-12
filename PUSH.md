# Push & Submit — copy/paste blocks

Plugin tip kontrolü temiz (`tsc --noEmit` 0 hata, 0 uyarı). Aşağıdaki blokları sırayla çalıştır.

---

## 1) GitHub repo aç

https://github.com/new

- **Repository name**: `plugin-hashlock`
- **Owner**: BarisSozen
- **Public**
- **README / .gitignore / license: hiçbirini tikleme** (zaten dosyalarda var)

---

## 2) Push (terminal — outputs/plugin-hashlock/ klasöründe)

```bash
cd /path/to/outputs/plugin-hashlock

git init
git add .
git commit -m "Initial: @hashlock/plugin-hashlock — ElizaOS plugin for Hashlock intent protocol"
git branch -M main
git remote add origin https://github.com/Hashlock-Tech/plugin-hashlock.git
git push -u origin main
```

---

## 3) Repo Settings → About → Topic ekle

https://github.com/Hashlock-Tech/plugin-hashlock → ⚙️ (sağ üstte, About kutusunun yanında)

- **Topics** alanına ekle: `elizaos-plugins`
- (İstersen ek olarak: `eliza`, `defi`, `intents`, `attestation`, `agent`)
- **Save changes**

> ⚠️ `elizaos-plugins` topic'i olmadan registry auto-review fail veriyor.

---

## 4) Eliza registry PR

https://github.com/elizaos-plugins/registry → **Fork** (sağ üstte)

Fork'unda:
1. `index.json` dosyasını aç → ✏️ (Edit)
2. `@esscrypt/plugin-polkadot` satırının **hemen sonrasına**, `@kamiyo/eliza` satırının **hemen öncesine** şu satırı ekle:

```json
"@hashlock/plugin-hashlock": "github:Hashlock-Tech/plugin-hashlock",
```

Tam görünüm (referans için, çevresindeki satırlar):

```json
"@erdgecrawl/plugin-base-signals": "github:erdGeclaw/plugin-base-signals",
"@esscrypt/plugin-polkadot": "github:Esscrypt/plugin-polkadot",
"@hashlock/plugin-hashlock": "github:Hashlock-Tech/plugin-hashlock",
"@kamiyo/eliza": "github:kamiyo-ai/kamiyo-protocol#main:packages/kamiyo-eliza",
"@kudo-dev/plugin-kudo": "github:Kudo-Archi/plugin-kudo",
```

3. **Commit changes** → "Create a new branch" seç (otomatik) → **Propose changes**
4. PR title: `add @hashlock/plugin-hashlock`
5. PR body (opsiyonel ama yardımcı):

   > Adds `@hashlock/plugin-hashlock` — ElizaOS plugin for the Hashlock intent protocol with counterparty attestation tier gating (NONE → INSTITUTIONAL).
   >
   > - Repo: https://github.com/Hashlock-Tech/plugin-hashlock
   > - Topic `elizaos-plugins`: ✅
   > - Images: ✅ (`logo.png` 400×400, `banner.png` 1280×640)
   > - `agentConfig.pluginType`: `elizaos:plugin:1.0.0` ✅
   > - 4 actions, 1 provider, zod env validation
   > - Reference Safe Guard implementation: https://github.com/BarisSozen/safe-hashlock-demo

6. **Create pull request**

Claude Code auto-review iş akışı PR'da otomatik koşacak. Geçerse maintainer merge eder.

---

## 5) Doğrulama checklist (PR açmadan önce)

- [ ] `git push` başarılı, repo public
- [ ] Repo About → Topic: `elizaos-plugins` eklendi
- [ ] `images/logo.png` 400×400 yerinde
- [ ] `images/banner.png` 1280×640 yerinde
- [ ] `package.json` `agentConfig.pluginType: "elizaos:plugin:1.0.0"` var
- [ ] `package.json` `name: "@hashlock/plugin-hashlock"` doğru
- [ ] PR'da sadece `index.json` değişti (başka dosya yok)
- [ ] Eklenen satır alfabetik konumda (`@esscrypt` ↔ `@kamiyo` arası)

---

## 6) Sonraki sıralı adımlar (PR merge olduktan sonra)

1. **Virtuals ACP issue** → `SUBMISSIONS.md` bölüm 3'teki body'yi olduğu gibi yapıştır
2. **MCP Registry publish** → `SUBMISSIONS.md` bölüm 2'deki `mcp-publisher` adımları
3. **LangChain / Vercel AI SDK** → bir sonraki sprintte
