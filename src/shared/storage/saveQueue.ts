/** Serialize checkpoint writes. A failed save stays visible to its caller but
 * cannot poison later writes. Feature hooks own status, validation and record keys. */
export function createSaveQueue(){
    let pending:Promise<void>=Promise.resolve();
    return {
        enqueue(write:()=>Promise<void>):Promise<void>{
            pending=pending.catch(()=>{}).then(write);
            return pending;
        },
        // Checkpoint callers wait for completion; enqueue callers receive save errors.
        get pending(){return pending.catch(()=>{});},
    };
}
