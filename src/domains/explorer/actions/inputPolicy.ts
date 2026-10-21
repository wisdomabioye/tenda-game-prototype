/** Modal readers and disclosures temporarily own input instead of the explorer. */
export function actorInputBlocked() {
    return Boolean(document.querySelector('[role="dialog"],.notice,.place-preview,.explorer-menu[open],.adventure-coach'));
}
