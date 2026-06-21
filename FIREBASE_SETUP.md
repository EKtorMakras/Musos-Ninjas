# Firebase Integration Guide

Reference for replicating this Firebase 9 (modular SDK) setup in a new Vue 3 + Pinia project.

---

## Table of Contents

1. [Installation](#installation)
2. [Environment Variables](#environment-variables)
3. [Firebase Initialization](#firebase-initialization)
4. [App Entry Point Pattern](#app-entry-point-pattern)
5. [Auth Store (Pinia)](#auth-store-pinia)
6. [Router Guards](#router-guards)
7. [Composables](#composables)
8. [Storage Rules](#storage-rules)
9. [Deploy Script](#deploy-script)
10. [File Structure Summary](#file-structure-summary)

---

## Installation

```bash
pnpm add firebase
```

**Version used:** `firebase@^12.8.0` (fully modular SDK, same API as Firebase v9)

---

## Environment Variables

Create a `.env` file at the project root:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

All values come from the Firebase Console → Project Settings → Your apps → SDK setup.

---

## Firebase Initialization

**`src/firebase/index.js`** — initializes all Firebase services and exports them.

```js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, serverTimestamp } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

const projectAuth = getAuth(app);
const projectFirestore = getFirestore(app);
const projectStorage = getStorage(app);
const timestamp = serverTimestamp;

export { projectFirestore, timestamp, projectAuth, projectStorage };
```

**`src/firebase/utils.js`** — normalizes Firebase error messages into human-readable strings.

```js
export const normalizeFirebaseError = (message = "") => {
    if (!message) return "";

    const sanitized = message.replace(
        /^Firebase:\s*(?:Error\s*\()?(?:auth\/)?([^)]+)\).*$/i,
        (_, code) => code.replace(/-/g, " ")
    );

    if (sanitized !== message) return sanitized.trim();

    return message.replace(/^Firebase:\s*/i, "").trim();
};
```

---

## App Entry Point Pattern

**`src/main.js`** — the app mounts only after Firebase resolves the initial auth state. This prevents a flash where protected routes render before auth is known.

```js
import "./assets/scss/main.scss";

import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import { projectAuth } from "@/firebase";
import { useAuthStore } from "@/stores/useAuth";

const pinia = createPinia();
let app;

projectAuth.onAuthStateChanged((_user) => {
    const authStore = useAuthStore(pinia);
    authStore.setUser(_user);
    authStore.setAuthReady(true);

    if (!app) {
        app = createApp(App);
        app.use(pinia);
        app.use(router);
        app.mount("#app");
    }
});
```

> The `if (!app)` guard ensures `createApp` runs only once on the first auth state resolution.

---

## Auth Store (Pinia)

**`src/stores/useAuth.js`** — handles signup, login, logout, and auth state.

```js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { projectAuth } from "@/firebase";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
} from "firebase/auth";
import { withAsync } from "@/api/helpers/withAsync";
import { normalizeFirebaseError } from "@/firebase/utils";

export const useAuthStore = defineStore("auth", () => {
    const user = ref(null);
    const authReady = ref(false);
    const error = ref({ signup: null, login: null, logout: null });
    const loading = ref({ signup: false, login: false, logout: false });

    const userIsAuth = computed(() => !!user.value);

    async function signup(displayName, email, password) {
        loading.value.signup = true;
        error.value.signup = null;

        const { response, error: err } = await withAsync(
            createUserWithEmailAndPassword, projectAuth, email, password
        );

        if (err) {
            error.value.signup = normalizeFirebaseError(err.message);
            loading.value.signup = false;
            throw err;
        }

        user.value = response.user;
        await withAsync(updateProfile, response.user, { displayName });
        loading.value.signup = false;
        return response;
    }

    async function login(email, password) {
        loading.value.login = true;
        error.value.login = null;

        const { response, error: err } = await withAsync(
            signInWithEmailAndPassword, projectAuth, email, password
        );

        if (err) {
            error.value.login = normalizeFirebaseError(err.message);
            loading.value.login = false;
            throw err;
        }

        user.value = response.user;
        loading.value.login = false;
        return response;
    }

    async function logout() {
        loading.value.logout = true;
        error.value.logout = null;

        const { error: err } = await withAsync(signOut, projectAuth);

        if (err) {
            error.value.logout = normalizeFirebaseError(err.message);
            loading.value.logout = false;
            throw err;
        }

        user.value = null;
        loading.value.logout = false;
    }

    function setUser(newUser) { user.value = newUser; }
    function setAuthReady(isReady) { authReady.value = isReady; }
    function clearError(type = null) {
        if (type) error.value[type] = null;
        else error.value = { signup: null, login: null, logout: null };
    }

    return {
        user, userIsAuth, authReady, error, loading,
        signup, login, logout, setUser, setAuthReady, clearError,
    };
});
```

### withAsync helper

**`src/api/helpers/withAsync.js`** — wraps any async function in a `{ response, error }` object so you never need try/catch in the caller.

```js
export const withAsync = async (fn, ...args) => {
    try {
        const response = await fn(...args);
        return { response, error: null };
    } catch (error) {
        return { response: null, error };
    }
};
```

---

## Router Guards

**`src/router/index.js`** — two meta flags control route access.

```js
import { createRouter, createWebHistory } from "vue-router";
import routes from "./routes";
import { useAuthStore } from "@/stores/useAuth";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

router.beforeEach((to) => {
    const authStore = useAuthStore();

    if (to.meta.requiresAuth && !authStore.userIsAuth) {
        return { name: "login" };
    }

    if (to.meta.requiresGuest && authStore.userIsAuth) {
        return { name: "home" };
    }
});

export default router;
```

**`src/router/routes.js`** — apply meta flags per route.

```js
export default [
    { path: "/",             name: "home",             component: HomeView },
    { path: "/login",        name: "login",            component: LoginView,     meta: { requiresGuest: true } },
    { path: "/signup",       name: "signup",           component: SignupView,    meta: { requiresGuest: true } },
    { path: "/some/page",    name: "protected-page",   component: SomePage,      meta: { requiresAuth: true } },
];
```

| Meta flag | Behavior |
|---|---|
| `requiresAuth: true` | Redirects to `login` if not authenticated |
| `requiresGuest: true` | Redirects to `home` if already authenticated |

---

## Composables

### useCollection — `src/composables/useCollection.js`

Firestore CRUD + real-time collection listener. Supports `where`, `orderBy`, `limit` query constraints.

```js
import { ref, onUnmounted } from "vue";
import {
    collection, addDoc as addFirestoreDoc, updateDoc as updateFirestoreDoc,
    deleteDoc as deleteFirestoreDoc, doc, onSnapshot, query, orderBy, where, limit,
} from "firebase/firestore";
import { projectFirestore } from "@/firebase";
import { withAsync } from "@/api/helpers/withAsync";

export function useCollection(collectionName) {
    const error = ref({ addDoc: null, updateDoc: null, deleteDoc: null, getCollection: null });
    const loading = ref({ addDoc: false, updateDoc: false, deleteDoc: false, getCollection: false });
    const documents = ref(null);

    let unsubscribe = null;
    const collectionRef = collection(projectFirestore, collectionName);

    const addDoc = async (data) => {
        loading.value.addDoc = true;
        error.value.addDoc = null;
        const { response, error: err } = await withAsync(addFirestoreDoc, collectionRef, data);
        if (err) { error.value.addDoc = err.message; loading.value.addDoc = false; throw err; }
        loading.value.addDoc = false;
        return response;
    };

    const updateDoc = async (docId, updates) => {
        loading.value.updateDoc = true;
        error.value.updateDoc = null;
        const docRef = doc(projectFirestore, collectionName, docId);
        const { error: err } = await withAsync(updateFirestoreDoc, docRef, updates);
        if (err) { error.value.updateDoc = err.message; loading.value.updateDoc = false; throw err; }
        loading.value.updateDoc = false;
    };

    const deleteDoc = async (docId) => {
        loading.value.deleteDoc = true;
        error.value.deleteDoc = null;
        const docRef = doc(projectFirestore, collectionName, docId);
        const { error: err } = await withAsync(deleteFirestoreDoc, docRef);
        if (err) { error.value.deleteDoc = err.message; loading.value.deleteDoc = false; throw err; }
        loading.value.deleteDoc = false;
    };

    const getCollection = (options = {}) => {
        loading.value.getCollection = true;
        error.value.getCollection = null;
        const constraints = [];

        if (options.where) {
            options.where.forEach(([field, op, value]) => constraints.push(where(field, op, value)));
        }
        if (options.orderBy) {
            const [field, dir = "asc"] = Array.isArray(options.orderBy) ? options.orderBy : [options.orderBy];
            constraints.push(orderBy(field, dir));
        }
        if (options.limit) constraints.push(limit(options.limit));

        const q = constraints.length ? query(collectionRef, ...constraints) : collectionRef;

        unsubscribe = onSnapshot(
            q,
            (snap) => {
                documents.value = snap.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
                loading.value.getCollection = false;
            },
            (err) => {
                error.value.getCollection = err.message;
                loading.value.getCollection = false;
            }
        );
    };

    onUnmounted(() => { if (unsubscribe) unsubscribe(); });

    return { error, loading, addDoc, updateDoc, deleteDoc, documents, getCollection };
}
```

**Usage example:**
```js
const { documents, getCollection, addDoc } = useCollection("playlists");

// Real-time, filtered query
getCollection({
    where: [["userId", "==", currentUser.uid]],
    orderBy: ["createdAt", "desc"],
});
```

---

### useDocument — `src/composables/useDocument.js`

Real-time listener for a single Firestore document, with update and delete.

```js
import { watchEffect, ref } from "vue";
import { doc, onSnapshot, updateDoc as updateFirestoreDoc, deleteDoc as deleteFirestoreDoc } from "firebase/firestore";
import { projectFirestore } from "@/firebase";
import { withAsync } from "@/api/helpers/withAsync";

export function useDocument(collectionName, id) {
    const document = ref(null);
    const error = ref({ getDocument: null, updateDoc: null, deleteDoc: null });
    const loading = ref({ updateDoc: false, deleteDoc: false });

    const documentRef = doc(projectFirestore, collectionName, id);

    const unsub = onSnapshot(
        documentRef,
        (doc) => {
            if (loading.value.deleteDoc) return;
            if (doc.data()) {
                document.value = { ...doc.data(), id: doc.id };
                error.value.getDocument = null;
            } else {
                error.value.getDocument = "That document does not exist";
            }
        },
        (err) => { error.value.getDocument = "Problem fetching the document"; }
    );

    const updateDoc = async (updates) => {
        loading.value.updateDoc = true;
        error.value.updateDoc = null;
        const { error: err } = await withAsync(updateFirestoreDoc, documentRef, updates);
        if (err) { error.value.updateDoc = err.message; loading.value.updateDoc = false; throw err; }
        loading.value.updateDoc = false;
    };

    const deleteDoc = async () => {
        loading.value.deleteDoc = true;
        error.value.deleteDoc = null;
        const { error: err } = await withAsync(deleteFirestoreDoc, documentRef);
        if (err) { error.value.deleteDoc = err.message; loading.value.deleteDoc = false; throw err; }
        loading.value.deleteDoc = false;
    };

    watchEffect((onInvalidate) => { onInvalidate(() => unsub()); });

    return { error, loading, document, updateDoc, deleteDoc };
}
```

**Usage example:**
```js
const { document: playlist, updateDoc, deleteDoc } = useDocument("playlists", route.params.id);
```

---

### useStorage — `src/composables/useStorage.js`

Upload and delete files in Firebase Storage, organized by user ID.

```js
import { projectStorage } from "@/firebase";
import { useAuthStore } from "@/stores/useAuth";
import { ref } from "vue";
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

export const useStorage = () => {
    const authStore = useAuthStore();
    const user = authStore.user;

    const error = ref(null);
    const url = ref(null);
    const loading = ref(false);
    const filePath = ref(null);

    const uploadImage = async (file) => {
        filePath.value = `covers/${user.uid}/${file.name}`;
        const fileRef = storageRef(projectStorage, filePath.value);

        loading.value = true;
        error.value = null;

        try {
            const response = await uploadBytes(fileRef, file);
            url.value = await getDownloadURL(response.ref);
        } catch (err) {
            error.value = err.message || "Could not upload file";
        } finally {
            loading.value = false;
        }
    };

    const deleteImage = async (path) => {
        error.value = null;
        try {
            await deleteObject(storageRef(projectStorage, path));
        } catch (err) {
            error.value = err.message || "Could not delete file";
            throw err;
        }
    };

    return { error, url, loading, filePath, uploadImage, deleteImage };
};
```

**Storage path structure:** `covers/{userId}/{filename}`

---

### useNotifications — `src/composables/useNotifications.js`

Not Firebase-specific. Global toast notification system with auto-dismiss. The `notifications` ref is shared across all instances (module-level singleton).

```js
import { ref } from "vue";

const notifications = ref([]);
let notificationId = 0;

export function useNotifications() {
    function showNotification({ title = "", message = "", type = "info", duration = 5000 }) {
        const id = ++notificationId;
        notifications.value.push({ id, title, message, type, duration, visible: true });
        if (duration > 0) setTimeout(() => removeNotification(id), duration);
        return id;
    }

    function removeNotification(id) {
        const index = notifications.value.findIndex((n) => n.id === id);
        if (index > -1) notifications.value.splice(index, 1);
    }

    function clearAll() { notifications.value = []; }

    function showSuccess(message, title = "Success") { return showNotification({ title, message, type: "success" }); }
    function showError(message, title = "Error") { return showNotification({ title, message, type: "error", duration: 7000 }); }
    function showWarning(message, title = "Warning") { return showNotification({ title, message, type: "warning" }); }
    function showInfo(message, title = "Info") { return showNotification({ title, message, type: "info" }); }

    return { notifications, showNotification, removeNotification, clearAll, showSuccess, showError, showWarning, showInfo };
}
```

---

## Storage Rules

**`storage.rules`** — any authenticated user can read/upload; only the owner can delete.

```
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {

    match /covers/{userId}/{allPaths=**} {
      allow read, create: if request.auth != null;
      allow delete: if request.auth != null && request.auth.uid == userId
    }

  }
}
```

---

## Deploy Script

**`package.json`**:

```json
"scripts": {
    "deploy:storage": "pnpm exec firebase deploy --only storage"
}
```

Requires the Firebase CLI (`npm i -g firebase-tools`) and a `firebase.json` at the root.

---

## File Structure Summary

```
src/
├── firebase/
│   ├── index.js              Firebase init — exports projectAuth, projectFirestore, projectStorage, timestamp
│   └── utils.js              normalizeFirebaseError() helper
│
├── stores/
│   └── useAuth.js            Pinia store — signup, login, logout, user state, authReady flag
│
├── composables/
│   ├── useCollection.js      Firestore CRUD + real-time collection listener
│   ├── useDocument.js        Firestore single document + real-time listener
│   ├── useStorage.js         Firebase Storage upload/delete (organized by userId)
│   └── useNotifications.js   UI toast system (not Firebase-specific)
│
├── api/
│   └── helpers/
│       └── withAsync.js      Wraps async calls → { response, error }
│
├── router/
│   ├── index.js              Router + beforeEach guard (requiresAuth / requiresGuest)
│   └── routes.js             Route definitions with meta flags
│
├── views/
│   └── auth/
│       ├── LoginView.vue
│       └── SignupView.vue
│
└── main.js                   App deferred until onAuthStateChanged fires

storage.rules                 Firebase Storage security rules
.env                          VITE_FIREBASE_* variables
```

---

## Firebase SDK Modules Used

| Service | Module | Used for |
|---|---|---|
| Auth | `firebase/auth` | `createUserWithEmailAndPassword`, `signInWithEmailAndPassword`, `signOut`, `updateProfile`, `onAuthStateChanged` |
| Firestore | `firebase/firestore` | `collection`, `doc`, `addDoc`, `updateDoc`, `deleteDoc`, `onSnapshot`, `query`, `where`, `orderBy`, `limit`, `serverTimestamp` |
| Storage | `firebase/storage` | `ref`, `uploadBytes`, `getDownloadURL`, `deleteObject` |
