export interface Box{x:number;y:number;width:number;height:number;}
export function findMarkerPosition(x:number,y:number,width:number,height:number,occupied:Box[],markerWidth=48,markerHeight=48){
 for(const [dx,dy] of [[0,0],[-56,0],[56,0],[0,-56],[0,56],[-56,-56],[56,-56],[-56,56],[56,56],[0,-96],[0,96]]){const p={x:x+dx,y:y+dy};if(p.x<markerWidth/2+3||p.x>width-markerWidth/2-3||p.y<80||p.y>height-190)continue;
 if(!occupied.some(b=>p.x+markerWidth/2>b.x&&p.x-markerWidth/2<b.x+b.width&&p.y+markerHeight/2>b.y&&p.y-markerHeight/2<b.y+b.height))return p;
 }return null;
}
