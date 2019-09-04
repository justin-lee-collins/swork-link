# swork-link

[![npm](https://img.shields.io/npm/v/swork-link)](https://www.npmjs.com/package/swork-link) [![travis ci](https://travis-ci.org/justin-lee-collins/swork-link.svg?branch=master)](https://travis-ci.org/justin-lee-collins/swork-link.svg?branch=master) [![coverage](https://img.shields.io/coveralls/github/justin-lee-collins/swork-link)](https://img.shields.io/coveralls/github/justin-lee-collins/swork-link) [![download](https://img.shields.io/npm/dw/swork-link)](https://img.shields.io/npm/dw/swork-link) [![Greenkeeper badge](https://badges.greenkeeper.io/justin-lee-collins/swork-link.svg)](https://greenkeeper.io/)

swork-link is a swork middleware designed to allow the dynamic injection of new middleware into an existing middleware pipeline. It is built with TypeScript and async methods.

**License**

MIT

**Installation**

`npm install swork-link`

`yarn add swork-link`

**Example**

```ts
// sw.ts
import { Swork } from "swork";
import { link } from "swork-link";

export const app = new Swork();

// Global logic  
app.use(/* 1st middleware */)
    .use(link())
    .use(/* 4th middleware */)
    .listen();
```

```ts
// area-sw.ts
import { Swork } from "swork";
import "swork-link";
import "./sw";

const app = new Swork();

// Specific area logic
app.use(/* 2nd middleware */)
    .use(/* 3rd middleware */)
    .targetLink();
```

In the above example, the area service worker is injected into the global service worker pipeline resulting in the expected middleware execution order. This allows a global service worker module or bundle to be built independently and reused by any referencing service worker.

### Methods

**link** 

Create a link location within a middleware pipeline. `link` can be passed a key to manage multiple link locations. If no key is passed, the key defaults to `default`.

If there is no corresponding link 

```ts
const app = new Swork();

app.use(link());
// or
app.use(link("foo"));
```

**targetLink**

Target a link defined in another swork pipeline. Similarly to `link`, `targetLink` can be passed a key to manage multiple link locations.

```ts
const app = new Swork();

app.targetLink();
// or
app.targetLink("foo");
```

### Notes

`link` and `targetLink` can be used in a single bundle (see first example) or across multiple bundles. In the case of multiple bundles, `importScripts` becomes necessary.

```ts
// area-sw.ts
import { Swork } from "swork";
import "swork-link";

self.importScripts("sw.js");

const app = new Swork();

// Specific area logic
app.use(/* 2nd middleware */)
    .use(/* 3rd middleware */)
    .targetLink();
```
