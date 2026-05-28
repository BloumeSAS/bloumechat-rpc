# BloumeChat RPC — Extension VS Code (Règles)

Extension Visual Studio Code qui diffuse l'activité de l'éditeur vers BloumeChat en temps réel.
Repo séparé : `https://github.com/BloumeSAS/bloumechat-rpc` — publisher Marketplace `BloumeSAS`.

---

## 1. CHANGELOG — TOUJOURS À JOUR (obligatoire)

* **Règle :** À **chaque** modification fonctionnelle de l'extension, le `CHANGELOG.md` **DOIT** être mis à jour. Aucune exception.
* **Action :**
  * Format [Keep a Changelog](https://keepachangelog.com/) + [SemVer](https://semver.org/).
  * Toute nouvelle version de `package.json` (`version`) **doit** avoir une entrée `## [x.y.z] - YYYY-MM-DD` correspondante dans `CHANGELOG.md`.
  * Classer les changements sous `### Added` / `### Changed` / `### Fixed` / `### Removed`.
  * **Vérification de parité** : avant de terminer une tâche, confirmer que `package.json.version` === la dernière version du `CHANGELOG.md`.
  * Bumper la version : `patch` (fix), `minor` (feature rétro-compatible), `major` (breaking).

## 2. URL du serveur — NON modifiable

* **Règle :** L'endpoint WebSocket est **hardcodé** à `wss://api.bloumechat.com` dans `src/client.ts` (`SERVER_URL`). Il ne doit **jamais** être configurable.
* **Action :** Ne **jamais** réintroduire `bloumechatRpc.serverUrl` dans `package.json` (`contributes.configuration`), ni dans le `README.md`, ni dans le code.

## 3. Bundling esbuild (obligatoire)

* **Règle :** `.vscodeignore` exclut `node_modules/` → sans bundle, `socket.io-client` manque au runtime et l'extension crash.
* **Action :** Toujours builder via `node esbuild.js` (inline `socket.io-client` dans `out/extension.js`, `vscode` reste `external`). `vsce package --no-dependencies` est correct **parce que** tout est bundlé. Après modif de `src/`, recompiler avant de packager.

## 4. Typage strict & responsabilité unique

* TypeScript `strict`. Pas de `any` implicite.
* `src/extension.ts` = activation + status bar + listeners + commandes. `src/client.ts` = Socket.IO. `src/activity.ts` = détection de l'activité. Ne pas mélanger.

## 5. Synchronisation README / package.json

* Toute option de config ajoutée/retirée dans `package.json` (`contributes.configuration`) doit être répliquée dans le tableau « Configuration Reference » du `README.md`.

## 6. Publication

* `vscode:prepublish` = `type-check` + esbuild `--production`. La CI publie sur le Marketplace si le secret `VSCE_PAT` est présent (push d'un tag `vX.Y.Z`).
