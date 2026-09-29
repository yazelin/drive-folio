# drive-folio

開一台車在 3D 世界裡逛 Yaze Lin 的作品。

**線上玩：** <https://yazelin.github.io/drive-folio/>（方向鍵開車，手機有觸控按鈕；跑不動的話看[文字版作品清單](https://yazelin.github.io/drive-folio/list.html)）

## 出處

改自 [Bruno Simon 的 folio-2019](https://github.com/brunosimon/folio-2019)（MIT）。整個 3D 世界、車子、物理、音效都是原作的，這個 repo 只換了內容：

- 作品區：九個作品換成我的，截圖與地上的中文說明由 `tools/` 的兩支程式產生
- 開場地上的名字：原作每個字母是一個 Blender 模型，只有 BRUNO SIMON 那幾個字母；改成用 three.js 的 TextGeometry 即時產生「YAZE LIN」，照原作的命名規則包好碰撞，車照樣撞得飛
- 聯絡區：連結換成我的；拿掉原作者住巴黎的梗（國旗、鐵塔、法國麵包）與對不上的品牌圖示
- 拿掉原作者線上課程的推銷彈窗
- 新增 **repo 城市**（開場正北方）：179 個公開 repo 一個一棟樓，分成六區；樓高看星星數、顏色看主要語言、紅屋頂代表有網頁。開進樓前的格子按 Enter 就打開
- 新增 **角色廣場**（開場東邊）：格莉奇、黑洞先生、Mori、優理做成永遠轉向鏡頭的紙板人，格子按 Enter 打開她們的站
- 新增 **catime 貓圖牆**（開場西北）：最新 12 隻 AI 貓（`tools/fetch_cats.py` 抓的快照）
- 新增 **週三直播路**（開場往西）：每場直播一根撞得倒的里程碑，按 Enter 打開活動頁（`tools/lives.json`）
- 作品區從一直線改成兩排（5＋4）
- 經歷年表換成我的

原作的授權聲明保留在 [license.md](license.md)。

## 怎麼做出來的

這個站是 2026-09-30 週三直播的示範：先找到一個喜歡的效果，再叫 AI 用自己的資料做出來。

1. 在 [網頁特效蒐集站](https://yazelin.github.io/web-effects-collector/) 看到這個作品，喜歡
2. 叫 AI 先查三件事：授權能不能改、現在還建置得起來嗎、要換的內容在哪裡
3. 告訴 AI 要參考這個、哪些要改、再給它我的作品清單（`tools/projects.json`）
4. AI 改好、截圖驗收、部署

## 換成你自己的作品

```
npm ci
# 1. 改 tools/projects.json（九個作品：網址、標題、說明、類型、用了什麼）
node tools/shots.mjs /tmp/shots          # 截圖（需要全域安裝 playwright）
python3 tools/make_projects.py /tmp/shots  # 產投影片與地上的文字
# 2. 開場的名字改 src/javascript/World/Sections/IntroSection.js 的 title
# 3. 聯絡區連結改 src/javascript/World/Sections/InformationSection.js
# 4. repo 城市：python3 tools/fetch_repos.py <你的 GitHub 帳號>，分錯區的寫進 tools/repo-overrides.json
# 5. 貓圖牆：python3 tools/fetch_cats.py；直播路：改 tools/lives.json；角色：CharacterPlazaSection.js 的 CHARACTERS
npm run dev
```

推上 GitHub、Settings → Pages 的來源選 GitHub Actions，就會自動部署。

## 已知問題

- 網站約 17 MB，手機開第一次要等一下

## 授權

MIT（沿用原作）。
