import {ShadowGenerator} from '@babylonjs/core/Lights/Shadows/shadowGenerator';
import '@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent';
import type {DirectionalLight} from '@babylonjs/core/Lights/directionalLight';
import type {Scene} from '@babylonjs/core/scene';
/** One shadow map per world; exclude flat paving/water from casting, retain them as receivers. */
export function createSunShadows(scene:Scene,sun:DirectionalLight){
 const generator=new ShadowGenerator(2048,sun);
 generator.usePercentageCloserFiltering=true;generator.filteringQuality=ShadowGenerator.QUALITY_LOW;
 generator.getShadowMap()!.refreshRate=2;
 generator.bias=.0005;generator.normalBias=.035;generator.setDarkness(.22);
 let registered:typeof scene.meshes=[];
 return {setLight(light:boolean){generator.mapSize=light?1024:2048;generator.getShadowMap()!.refreshRate=2;},sync(){if(registered.length===scene.meshes.length&&registered.every((m,i)=>m===scene.meshes[i]))return;registered=[...scene.meshes];
  const casters=scene.meshes.filter(mesh=>{if(mesh.metadata?.playerBeacon)return false;mesh.computeWorldMatrix(true);const bounds=mesh.getBoundingInfo().boundingBox;
   const size=bounds.maximum.subtract(bounds.minimum),broad=size.x>.3&&size.z>.3;
   mesh.receiveShadows=broad;
   return mesh.getTotalVertices()>0&&broad&&(bounds.maximumWorld.y-bounds.minimumWorld.y>.45||bounds.minimumWorld.y>.5);});
  generator.getShadowMap()!.renderList=casters;
 },dispose(){generator.dispose();}};
}
