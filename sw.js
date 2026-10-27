// 오프라인 지원: 처음 열 때 교양 앱 전체(첫 화면·세 앱·아이콘)를 폰에 저장해 두고, 이후엔 저장본을 먼저 쓴다.
// 버전과 저장할 파일 목록은 site.py가 채운다. 내용이 바뀌면 버전이 바뀌고 새 저장본으로 통째로 바꾼다.
// 같은 주소(ssiissx.github.io)의 다른 앱 저장본을 건드리지 않도록 이름은 'ca-'로 시작한다.
const VERSION = "8ddc72d7d3";
const CACHE = 'ca-' + VERSION;
const PRECACHE = ["./", "./index.html", "./sangsik.html", "./japan.html", "./korea.html", "./sangsik.webmanifest", "./japan.webmanifest", "./korea.webmanifest", "./manifest.webmanifest", "./icons/hub-apple-touch-icon.png", "./icons/hub-favicon.png", "./icons/hub-icon-192.png", "./icons/hub-icon-512.png", "./icons/hub-maskable-512.png", "./icons/japan-apple-touch-icon.png", "./icons/japan-favicon.png", "./icons/japan-icon-192.png", "./icons/japan-icon-512.png", "./icons/japan-maskable-512.png", "./icons/korea-apple-touch-icon.png", "./icons/korea-favicon.png", "./icons/korea-icon-192.png", "./icons/korea-icon-512.png", "./icons/korea-maskable-512.png", "./icons/sangsik-apple-touch-icon.png", "./icons/sangsik-favicon.png", "./icons/sangsik-icon-192.png", "./icons/sangsik-icon-512.png", "./icons/sangsik-maskable-512.png"];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // HTTP 캐시를 거치지 않고 새로 받아야 옛 파일이 섞이지 않는다
    await cache.addAll(PRECACHE.map(url => new Request(url, { cache: 'reload' })));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) if (key.startsWith('ca-') && key !== CACHE) await caches.delete(key);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    // 주소 뒤의 ?v=나 #카드 번호는 무시하고 같은 파일로 본다
    const hit = await cache.match(req, { ignoreSearch: true });
    if (hit) return hit;
    try {
      return await fetch(req);
    } catch (e) {
      if (req.mode === 'navigate') {
        const shell = await cache.match('./');
        if (shell) return shell;
      }
      throw e;
    }
  })());
});
