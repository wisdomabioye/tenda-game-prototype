import {ROAD_SURFACE_OFFSET} from '../../world/assets/streets/palette';
import {Vector3} from '@babylonjs/core/Maths/math.vector';
import {humanProportions} from './humanKit';
import {defaultAppearance,type Appearance} from './appearance';
import { Scene } from "@babylonjs/core/scene";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
/** Articulated, locally generated explorer. No downloaded models or textures. */
export function createExplorer(scene: Scene, mat: (color: string) => StandardMaterial, initial:Appearance=defaultAppearance, pose:'standing'|'seated'='standing',detail:'full'|'crowd'='full') {
    const root = new TransformNode("explorer", scene);
    let appearance=initial;
    const build=()=>{
    const visual=new TransformNode("character appearance",scene);visual.parent=root;
    const proportions=humanProportions(appearance);visual.scaling.y=proportions.height;
    if(appearance.mobility==='wheelchair')visual.position.y=(1-proportions.height)*.83;
    else if(pose==='seated')visual.position.y=(1-proportions.height)*.65;
    const torso = new TransformNode("upper body", scene);
    torso.parent = visual;
    const ellipsoid = (name: string, parent: TransformNode, x: number, y: number, z: number, sx: number, sy: number, sz: number, color: string) => {
        const m = MeshBuilder.CreateSphere(name, { diameter: 1, segments: detail==='crowd'?8:12 }, scene);
        m.parent = parent;
        m.position.set(x, y, z);
        m.scaling.set(sx, sy, sz);
        m.material = mat(color);
        m.isPickable = false;
        return m;
    };
    ellipsoid("shirt", torso, 0, 1.48, 0, proportions.shoulders, 0.91, .43*proportions.depth, appearance.shirt);
    const hips=ellipsoid("hips", visual, 0, 1.02, 0, proportions.hips, 0.34, .4*proportions.depth, "#344c68");
    ellipsoid("neck", torso, 0, 1.98, 0, 0.22, 0.27, 0.23, appearance.skin);
    ellipsoid("head", torso, 0, 2.25, 0, 0.52, 0.64, 0.5, appearance.skin);
    if(appearance.hair!=='bald'&&appearance.headwear!=='scarf')ellipsoid("hair",torso,0,2.49,-.03,.56,.29,.5,appearance.hairColor);
    if(appearance.hair==='afro'&&appearance.headwear==='none'){
     ellipsoid('afro crown',torso,0,2.56,-.03,.87,.74,.79,appearance.hairColor);
     for(let i=0;i<6;i++){const a=i*Math.PI/3;ellipsoid('afro curl',torso,Math.cos(a)*.33,2.59+Math.sin(a)*.12,Math.sin(a)*.24,.3,.32,.3,appearance.hairColor);}
    }
    if(appearance.hair==='braids'&&appearance.headwear!=='scarf')for(let i=0;i<5;i++)ellipsoid('braid',torso,(i-2)*.125,2.07,-.24,.09,.85,.11,appearance.hairColor);
    if(appearance.headwear==='cap'){
     ellipsoid('cap crown',torso,0,2.53,-.025,.63,.33,.57,appearance.shirt);
     ellipsoid('cap brim',torso,0,2.47,.28,.65,.06,.46,appearance.shirt);
    }
    if(appearance.headwear==='scarf'){
     ellipsoid('head scarf',torso,0,2.37,-.10,.7,.86,.63,appearance.shirt);
     ellipsoid('scarf drape',torso,0,1.91,-.22,.79,.68,.29,appearance.shirt);
    }
    ellipsoid("nose", torso, 0, 2.25, 0.26, 0.12, 0.12, 0.13, appearance.skin);
    for (const side of [-1, 1]) {
        ellipsoid("ear", torso, side * 0.27, 2.26, 0, 0.11, 0.17, 0.12, appearance.skin);
        ellipsoid("eye", torso, side * 0.105, 2.31, 0.236, 0.055, 0.065, 0.04, "#292c36");
    }
    ellipsoid("backpack", torso, 0, 1.53, -0.31, 0.57, 0.64, 0.3, "#e9b43b");
    const limb = (name:string,x:number,y:number,length:number,color:string)=>{
        const pivot=new TransformNode(name,scene);pivot.parent=name.includes('arm')?torso:visual;pivot.position.set(x,y,0);
        const half=length/2,radius=name.includes('arm')?.105:.13;
        const segment=(parent:TransformNode,label:string)=>{const mesh=MeshBuilder.CreateCapsule(label,{height:half+.04,radius,tessellation:detail==='crowd'?6:10},scene);mesh.parent=parent;mesh.position.y=-half/2;mesh.material=mat(color);mesh.isPickable=false;};
        segment(pivot,name+' upper');const joint=new TransformNode(name+(name.includes('arm')?' elbow':' knee'),scene);joint.parent=pivot;joint.position.y=-half;segment(joint,name+' lower');
        ellipsoid(name+' joint',joint,0,0,0,radius*2.05,radius*2.05,radius*2.05,color);
        return {pivot,joint};
    };
    const la=limb('left arm',-proportions.shoulders*.43,1.81,.72,appearance.shirt),ra=limb('right arm',proportions.shoulders*.43,1.81,.72,appearance.shirt);
    const leftArm=la.pivot,rightArm=ra.pivot;
    const hands=[la,ra].map((arm,i)=>{ellipsoid('hand',arm.joint,0,-.40,0,.18,.22,.18,appearance.skin);const grip=new TransformNode(i?'right hand grip':'left hand grip',scene);grip.parent=arm.joint;grip.position.set(0,-.43,.04);return grip;});
    const ll=limb('left leg',-.19,1.03,.82,'#344c68'),rl=limb('right leg',.19,1.03,.82,'#344c68');const leftLeg=ll.pivot,rightLeg=rl.pivot;
    for(const leg of [ll,rl])ellipsoid('shoe',leg.joint,0,-.48,.09,.28,.2,.43,'#fff0d1');
    const spoon=ellipsoid('meal spoon',hands[1],0,-.02,.10,.055,.035,.30,'#c7dce0');spoon.setEnabled(false);
    const carryGrip=new TransformNode('two hand carry socket',scene);carryGrip.parent=visual;carryGrip.position.set(0,appearance.mobility==='wheelchair'?1.05:1.35,.62);
    if(appearance.hair==='long'&&appearance.headwear!=='scarf')ellipsoid('long hair',torso,0,2.18,-.23,.64,.95,.28,appearance.hairColor);
    if(appearance.outfit==='dress'||appearance.outfit==='tunic'){const skirt=MeshBuilder.CreateCylinder('flowing garment',{height:appearance.outfit==='dress'?.78:.48,diameterTop:proportions.hips,diameterBottom:proportions.hips*1.4,tessellation:10},scene);skirt.parent=visual;skirt.position.y=appearance.outfit==='dress'?.91:1.08;skirt.material=mat(appearance.shirt);skirt.isPickable=false;}
    if(appearance.glasses)for(const side of [-1,1]){const frame=MeshBuilder.CreateTorus('glasses frame',{diameter:.22,thickness:.035,tessellation:12},scene);frame.parent=torso;frame.position.set(side*.12,2.31,.28);frame.rotation.x=Math.PI/2;frame.material=mat('#253d49');frame.isPickable=false;}
    if(appearance.outfit==='smart'){ellipsoid('tie',torso,0,1.63,.225,.10,.48,.04,'#ffe381');ellipsoid('jacket lapel',torso,-.15,1.72,.20,.12,.42,.06,'#fff0d1');}
    const wheels:TransformNode[]=[];
    if(pose==='seated'){hips.position.y=.68;torso.position.y=-.35;leftLeg.position.y=rightLeg.position.y=.68;leftLeg.rotation.x=rightLeg.rotation.x=-Math.PI/2;ll.joint.rotation.x=rl.joint.rotation.x=Math.PI/2;ll.joint.scaling.y=rl.joint.scaling.y=1.25;}
    if(appearance.mobility==='wheelchair'){
      const chair=new TransformNode('mobility kit',scene);chair.parent=visual;chair.scaling.y=1/proportions.height;chair.position.y=-visual.position.y/proportions.height;
      // Seated body and bent lower limbs share the same world root and route speed.
      hips.position.y=.91;torso.position.y=-.35;
      leftLeg.position.y=.83;rightLeg.position.y=.83;leftLeg.rotation.x=rightLeg.rotation.x=-Math.PI/2;ll.joint.rotation.x=rl.joint.rotation.x=Math.PI/2;
      for(const side of [-1,1]){
       const wheel=MeshBuilder.CreateTorus('rolling rear wheel',{diameter:1.2,thickness:.12,tessellation:24},scene);wheel.parent=chair;wheel.position.set(side*.57,.64,-.05);wheel.rotation.z=Math.PI/2;wheel.material=mat('#344c68');wheel.isPickable=false;
       const hub=new TransformNode('wheel axle',scene);hub.parent=chair;hub.position.copyFrom(wheel.position);wheel.parent=hub;wheel.position.set(0,0,0);wheels.push(hub);
       const spoke=MeshBuilder.CreateBox('wheel spoke',{width:.06,height:1.04,depth:.06},scene);spoke.parent=hub;spoke.material=mat('#fff0d1');spoke.isPickable=false;
       ellipsoid('front caster',chair,side*.4,.14,.73,.15,.32,.32,'#344c68');}
      ellipsoid('seat',chair,0,.83,.12,.85,.15,.8,'#e9b43b');ellipsoid('chair back',chair,0,1.13,-.33,.85,.65,.12,'#e9b43b');ellipsoid('foot support',chair,0,.13,.8,.75,.1,.35,'#344c68');
    }
    const contacts=visual.getChildMeshes().filter(m=>appearance.mobility==='wheelchair'?m.name==='rolling rear wheel'||m.name==='front caster':m.name==='shoe');
    return {contacts,visual,torso,hips,leftLeg,rightLeg,leftArm,rightArm,wheels,leftElbow:la.joint,rightElbow:ra.joint,leftKnee:ll.joint,rightKnee:rl.joint,carryGrip,hands,spoon};
    };
    let handTarget:Vector3|null=null;
    let offset=0,action:'idle'|'sit'|'carry'|'reach'|'eat'='idle',actionBlend=0,reachBlend=0;
    let parts=build(),phase = 0, blend = 0,gestureTime=0;
    // Navigation coordinates describe the lane datum; soles contact its visible face.
    const groundContact=()=>{
      if(appearance.mobility==='wheelchair'){
        // Circular wheel clearance is invariant under axle rotation. A tessellated
        // torus's rotating bounding box is not a suspension/ground sensor.
        parts.visual.position.y=(1-humanProportions(appearance).height)*.83+.02+ROAD_SURFACE_OFFSET/root.scaling.y;
        return;
      }
      if(pose==='seated'||(action==='sit'||action==='eat'))return;
      parts.visual.computeWorldMatrix(true);
      const contacts=parts.contacts;
      const minimum=Math.min(...contacts.map(mesh=>{mesh.computeWorldMatrix(true);return mesh.getBoundingInfo().boundingBox.minimumWorld.y;}));
      if(Number.isFinite(minimum))parts.visual.position.y+=root.position.y+ROAD_SURFACE_OFFSET-minimum;
    };
    groundContact();
    const reachHands=()=>{
      parts.spoon.setEnabled(action==='eat');
      if(!handTarget||action==='eat')return;
      const target=Vector3.TransformCoordinates(handTarget,parts.torso.computeWorldMatrix(true).clone().invert());
      for(const [upper,lower]of [[parts.leftArm,parts.leftElbow],[parts.rightArm,parts.rightElbow]]){
        const dy=target.y-upper.position.y,z=target.z,upperLength=.36,lowerLength=.4,d=Math.max(.08,Math.min(.755,Math.hypot(dy,z)));
        upper.rotation.x=-Math.atan2(z,-dy)+Math.acos(Math.max(-1,Math.min(1,(upperLength**2+d*d-lowerLength**2)/(2*upperLength*d))));
        lower.rotation.x=-Math.acos(Math.max(-1,Math.min(1,(d*d-upperLength**2-lowerLength**2)/(2*upperLength*lowerLength))));
      }
    };
    return {
        root,
        setHandTarget:(point:Vector3|null)=>{handTarget=point?.clone()??null;},
        get mobility(){return appearance.mobility;},
        get grip(){return parts.carryGrip;},
        setAction:(next:'idle'|'sit'|'carry'|'reach'|'eat')=>{action=next;},
        setOffset:(x:number)=>{offset=x;parts.visual.position.x=x;},
        setAppearance:(next:Appearance)=>{appearance=next;parts.visual.dispose(false,false);parts=build();parts.visual.position.x=offset;groundContact();},
        animate: (dt: number, speed: number, reduced: boolean) => {
            if(pose==='seated')return;
            gestureTime+=dt;
            const moving = !reduced && speed > 0.05;
            blend += (Number(moving) - blend) * Math.min(1, dt * 12);
            phase += speed * dt * 2.5;
            const swing = Math.sin(phase) * (speed>7?.8:.55) * blend;
            reachBlend+=(Number(action==='carry'||action==='reach'||action==='eat')-reachBlend)*Math.min(1,dt*(reduced?100:10));
            const {leftLeg,rightLeg,leftArm,rightArm,torso,wheels}=parts;
            if(appearance.mobility==='wheelchair'){leftArm.rotation.x=swing*.5*(1-reachBlend)-.95*reachBlend;rightArm.rotation.x=leftArm.rotation.x;parts.leftElbow.rotation.x=parts.rightElbow.rotation.x=.12-.77*reachBlend;
            if(action==='eat'){rightArm.rotation.x=-1.25+(reduced?0:Math.sin(gestureTime*3)*.12);parts.rightElbow.rotation.x=-1.1;}for(const wheel of wheels)wheel.rotation.x+=moving?speed*dt/.6:0;groundContact();reachHands();return;}
            leftLeg.rotation.x = swing;
            rightLeg.rotation.x = -swing;
            leftArm.rotation.x = -swing * 0.75;
            rightArm.rotation.x = swing * 0.75;
            torso.rotation.x=speed>7&&action==='idle'?.1*blend:0;
            actionBlend+=(Number(action==='sit'||action==='eat')-actionBlend)*Math.min(1,dt*(reduced?100:8));
            const seated=actionBlend,height=humanProportions(appearance).height;
            parts.visual.position.y=(.56-.51*height)*seated;
            torso.position.y = -.35*seated+Math.abs(Math.sin(phase))*.035*blend*(1-seated);
            parts.hips.position.y=1.02-.34*seated;leftLeg.position.y=rightLeg.position.y=1.03-.35*seated;
            leftLeg.rotation.x=swing*(1-seated)-Math.PI/2*seated;rightLeg.rotation.x=-swing*(1-seated)-Math.PI/2*seated;
            parts.leftKnee.rotation.x=Math.max(0,-swing)*.5*(1-seated)+Math.PI/2*seated;parts.rightKnee.rotation.x=Math.max(0,swing)*.5*(1-seated)+Math.PI/2*seated;
            parts.leftKnee.scaling.y=parts.rightKnee.scaling.y=1+((.46+.17*height)/(.48*height)-1)*seated;
            leftArm.rotation.x=(leftArm.rotation.x*(1-seated)-.18*seated)*(1-reachBlend)-.95*reachBlend;rightArm.rotation.x=(rightArm.rotation.x*(1-seated)-.18*seated)*(1-reachBlend)-.95*reachBlend;
            parts.leftElbow.rotation.x=parts.rightElbow.rotation.x=.12-.77*reachBlend;
            if(action==='eat'){rightArm.rotation.x=-1.25+(reduced?0:Math.sin(gestureTime*3)*.12);parts.rightElbow.rotation.x=-1.1;}
            groundContact();reachHands();

        },
    };
}
