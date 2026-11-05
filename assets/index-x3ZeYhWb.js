(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();function e(){return t(()=>void 0)}function t(e,n){return Object.assign(e,{server:e=>t(e,e),client:e=>t(n??e,n)})}var n=(e,t)=>{let r={type:`request`,...t||e},i=e=>n({},Object.assign(r,{validator:e,inputValidator:e}));return{options:r,middleware:e=>n({},Object.assign(r,{middleware:e})),validator:i,inputValidator:i,client:e=>n({},Object.assign(r,{client:e})),server:e=>n({},Object.assign(r,{server:e}))}},r=e().server((e={})=>n().server(async t=>{let n=t;return e.filter&&!await e.filter(n)||await i(e,n)?t.next():l(e,n)}));async function i(e,t){let n=await a(e,t);return n===!0||n===void 0&&e.allowRequestsWithoutOriginCheck===!0}async function a(e,t){let n=t.request.headers.get(`Sec-Fetch-Site`);if(n!==null)return o(e.secFetchSite??`same-origin`,n,t);let r=t.request.headers.get(`Origin`);if(r!==null)return e.origin?o(e.origin,r,t):r===new URL(t.request.url).origin;let i=t.request.headers.get(`Referer`);if(i!==null&&e.referer!==!1){if(typeof e.referer==`function`)return e.referer(i,t);if(e.origin){let n=s(i);return n!==void 0&&o(e.origin,n,t)}return c(i,new URL(t.request.url).origin)}}async function o(e,t,n){return typeof e==`function`?e(t,n):Array.isArray(e)?e.includes(t):t===e}function s(e){try{return new URL(e).origin}catch{return}}function c(e,t){if(e===t)return!0;if(!e.startsWith(t))return!1;if(e.length===t.length)return!0;let n=e.charCodeAt(t.length);return n===47||n===63||n===35}async function l(e,t){return typeof e.failureResponse==`function`?e.failureResponse(t):e.failureResponse?.clone()??new Response(`Forbidden`,{status:403})}function u(){return`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>This page didn't load</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font: 15px/1.5 system-ui, -apple-system, sans-serif; background: #fafafa; color: #111; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 28rem; width: 100%; text-align: center; padding: 2rem; }
      h1 { font-size: 1.25rem; margin: 0 0 0.5rem; }
      p { color: #4b5563; margin: 0 0 1.5rem; }
      .actions { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
      a, button { padding: 0.5rem 1rem; border-radius: 0.375rem; font: inherit; cursor: pointer; text-decoration: none; border: 1px solid transparent; }
      .primary { background: #111; color: #fff; }
      .secondary { background: #fff; color: #111; border-color: #d1d5db; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>This page didn't load</h1>
      <p>Something went wrong on our end. You can try refreshing or head back home.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Try again</button>
        <a class="secondary" href="/">Go home</a>
      </div>
    </div>
  </body>
</html>`}n().server(async({next:e})=>{try{return await e()}catch(e){if(typeof e==`object`&&e&&`statusCode`in e)throw e;return console.error(e),new Response(u(),{status:500,headers:{"content-type":`text/html; charset=utf-8`}})}}),r({filter:e=>e.handlerType===`serverFn`});