import {Component,Suspense,useEffect,type ReactNode} from 'react';
import {GameCard,GameButton,CloseButton} from './game/GameUI';
function LoadingPanel({onClose}:{onClose:()=>void}){
 useEffect(()=>()=>{requestAnimationFrame(()=>{
  if(document.activeElement!==document.body)return;
  document.querySelector<HTMLElement>('[role="dialog"]:not([data-panel-loading]),.notice,.place-preview')?.querySelector<HTMLButtonElement>('button')?.focus();
 });},[]);
 return <GameCard className="tool-panel" role="dialog" aria-label="Loading feature" data-panel-loading><CloseButton label="Cancel loading" onClick={onClose}/><p role="status">Preparing this part of your adventure…</p></GameCard>;
}
/** Optional chunk failures leave the city and navigation controls mounted. */
export class LazyPanelBoundary extends Component<{resetKey:string;onClose:()=>void;children:ReactNode},{failed:boolean}>{
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true};}
 componentDidUpdate(previous:Readonly<{resetKey:string}>){if(previous.resetKey!==this.props.resetKey&&this.state.failed)this.setState({failed:false});}
 render(){return this.state.failed?<GameCard className="tool-panel" role="dialog" aria-label="Feature unavailable"><CloseButton label="Close unavailable feature" onClick={this.props.onClose}/><p>This feature could not load. Check your connection, then reload the explorer.</p><GameButton onClick={()=>location.reload()}>Reload explorer</GameButton></GameCard>:<Suspense fallback={<LoadingPanel onClose={this.props.onClose}/>}>{this.props.children}</Suspense>;}
}
