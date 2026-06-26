---
name: Lucide Map icon shadows built-in Map
description: Importing "Map" from lucide-react shadows the JavaScript built-in Map type, causing TS errors in generic Map<K,V> usage.
---

## Rule
Never import `Map` from `lucide-react` directly. Always alias it:
```ts
import { Map as MapIcon } from "lucide-react";
```

**Why:** `import { Map } from "lucide-react"` puts a React component named `Map` in scope, which shadows the global `Map<K, V>` constructor. TypeScript then treats `new Map<K, V>()` as "new React.Component()" — causing TS7009 (lacks construct signature) and TS2558 (wrong type arguments) errors on the generic Map usage.

**How to apply:** Any time a Lucide icon name matches a built-in JS global (Map, Set, Date, etc.), alias it on import.
