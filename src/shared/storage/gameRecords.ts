/** One client-only game database; feature adapters own keys and validation. */
async function database(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('tenda-local-game', 1);
        request.onupgradeneeded = () => request.result.createObjectStore('saves');
        request.onerror = () => reject(new Error('Local game storage unavailable.'));
        request.onsuccess = () => resolve(request.result);
    });
}

export async function readGameRecord(key: string): Promise<unknown> {
    const db = await database();
    try {
        return await new Promise((resolve, reject) => {
            const request = db.transaction('saves').objectStore('saves').get(key);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    } finally {
        db.close();
    }
}

export async function writeGameRecord(key: string, value: unknown): Promise<void> {
    const db = await database();
    try {
        await new Promise<void>((resolve, reject) => {
            const tx = db.transaction('saves', 'readwrite');
            tx.objectStore('saves').put(value, key);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
            tx.onabort = () => reject(tx.error ?? new Error('Checkpoint not saved.'));
        });
    } finally {
        db.close();
    }
}
