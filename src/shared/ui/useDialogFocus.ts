import { useEffect, useRef } from "react";
import {dismissSheetSwipe} from "./sheetGesture";
export function useDialogFocus(active: boolean, context: unknown, onClose: () => void) {
    const callback = useRef(onClose);
    callback.current = onClose;
    const close = () => callback.current();
    useEffect(() => {
        if (!active)
            return;
        const panel = document.querySelector<HTMLElement>('[role="dialog"],.notice,.place-preview');
        const previous = document.activeElement as HTMLElement | null;
        panel?.querySelector<HTMLButtonElement>("button")?.focus();
        const key = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.preventDefault();e.stopImmediatePropagation();close();
            }
            if (e.key === "Tab" && panel?.getAttribute("role")==="dialog") {
                const buttons = [
                    ...panel.querySelectorAll<HTMLElement>('summary,button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),a[href]'),
                ].filter(element=>element.getClientRects().length>0);
                const first = buttons[0], last = buttons.at(-1);
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last?.focus();
                }
                else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first?.focus();
                }
            }
        };
        let swipe:{x:number;y:number}|null=null;
        const start=(e:TouchEvent)=>{
            const target=e.target as HTMLElement;
            swipe=e.touches.length===1&&Boolean(target.closest('[role="dialog"],.notice,.place-preview')&&target.closest('h2,h3,[data-sheet-handle]'))
                ?{x:e.touches[0].clientX,y:e.touches[0].clientY}:null;
        };
        const end=(e:TouchEvent)=>{
            if(swipe&&e.changedTouches.length===1&&dismissSheetSwipe(swipe,{x:e.changedTouches[0].clientX,y:e.changedTouches[0].clientY}))close();
            swipe=null;
        };
        const cancel=()=>{swipe=null;};
        document.addEventListener('touchstart',start,{passive:true});
        document.addEventListener('touchend',end,{passive:true});
        document.addEventListener('touchcancel',cancel);
        document.addEventListener("keydown", key);
        return () => {
            document.removeEventListener('touchstart',start);
            document.removeEventListener('touchend',end);
            document.removeEventListener('touchcancel',cancel);
            document.removeEventListener("keydown", key);
            const current=document.activeElement;
            // A new HUD opener owns focus during panel-to-panel switches.
            if(current instanceof HTMLElement&&current!==document.body&&!panel?.contains(current)&&current!==previous)return;
            requestAnimationFrame(()=>{
                // Scene markers can become visible one render after the sheet closes.
                if(document.querySelector('[role="dialog"],.notice,.place-preview'))return;
                const disclosure=previous?.closest('details');
                if(disclosure&&!disclosure.open)disclosure.querySelector('summary')?.focus();
                else if(previous?.isConnected&&!previous.hidden&&previous.getClientRects().length)previous.focus();
                else document.querySelector<HTMLElement>('[data-focus-return]')?.focus();
            });
        };
    }, [active, context]);
}
