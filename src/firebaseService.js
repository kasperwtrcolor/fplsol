/**
 * Firebase Service Layer
 * Drop-in replacement for devbaseClient API
 * Uses Firestore for all CRUD operations
 */
import { db } from './firebase';
import {
    collection,
    doc,
    addDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';

// ─── CRUD Operations ────────────────────────────────────────

/**
 * Create a new document in a collection
 * @param {string} collectionName - Firestore collection name
 * @param {object} data - Document data
 * @returns {object} Created document with id
 */
export async function createEntity(collectionName, data) {
    const docData = {
        ...data,
        createdAt: Date.now(),
        updatedAt: Date.now()
    };
    const docRef = await addDoc(collection(db, collectionName), docData);
    return { id: docRef.id, ...docData };
}

/**
 * List documents from a collection, optionally filtered
 * @param {string} collectionName - Firestore collection name
 * @param {object} [filters] - Optional key-value filters
 * @returns {Array} Array of documents
 */
export async function listEntities(collectionName, filters = {}) {
    let q = collection(db, collectionName);

    const filterEntries = Object.entries(filters);
    if (filterEntries.length > 0) {
        const constraints = filterEntries.map(([key, value]) => where(key, '==', value));
        q = query(q, ...constraints);
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
}

/**
 * Get a single document by ID
 * @param {string} collectionName - Firestore collection name
 * @param {string} docId - Document ID
 * @returns {object|null} Document data or null
 */
export async function getEntity(collectionName, docId) {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return { id: docSnap.id, ...docSnap.data() };
}

/**
 * Update a document
 * @param {string} collectionName - Firestore collection name
 * @param {string} docId - Document ID
 * @param {object} data - Fields to update
 * @returns {object} Updated document
 */
export async function updateEntity(collectionName, docId, data) {
    const docRef = doc(db, collectionName, docId);
    const updateData = {
        ...data,
        updatedAt: Date.now()
    };
    await updateDoc(docRef, updateData);
    const updated = await getDoc(docRef);
    return { id: updated.id, ...updated.data() };
}

/**
 * Delete a document
 * @param {string} collectionName - Firestore collection name
 * @param {string} docId - Document ID
 */
export async function deleteEntity(collectionName, docId) {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
}

// ─── Real-time Listeners (replaces Socket.io) ───────────────

/**
 * Subscribe to real-time changes on a collection
 * @param {string} collectionName - Firestore collection name
 * @param {object} [filters] - Optional key-value filters
 * @param {function} callback - Called with array of docs on each change
 * @returns {function} Unsubscribe function
 */
export function subscribeToCollection(collectionName, filters = {}, callback) {
    let q = collection(db, collectionName);

    const filterEntries = Object.entries(filters);
    if (filterEntries.length > 0) {
        const constraints = filterEntries.map(([key, value]) => where(key, '==', value));
        q = query(q, ...constraints);
    }

    return onSnapshot(q, (snapshot) => {
        const docs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(docs);
    });
}

/**
 * Subscribe to a single document's changes
 * @param {string} collectionName - Firestore collection name
 * @param {string} docId - Document ID
 * @param {function} callback - Called with document data on each change
 * @returns {function} Unsubscribe function
 */
export function subscribeToDocument(collectionName, docId, callback) {
    const docRef = doc(db, collectionName, docId);
    return onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            callback({ id: docSnap.id, ...docSnap.data() });
        } else {
            callback(null);
        }
    });
}
