/* Detailed city and rigged agent pack. Rocketbox models: Microsoft, MIT.
   PBR surfaces: Poly Haven, CC0. See CREDITS.md. */
window.NULLVISUALS=(()=>{
'use strict';
const T=THREE,vec=(x=0,y=0,z=0)=>new T.Vector3(x,y,z),templates=[],textures={},clips={};
let buildingsGroup,codeMaterial,codeSheets=[],steam=[],clock=0,prepared=false;
const materials={},geometries={};
let rng=73001;const random=()=>{rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng/4294967296;};
const rr=(a,b)=>a+random()*(b-a);
const mat=(c,r=.65,m=.1)=>new T.MeshStandardMaterial({color:c,roughness:r,metalness:m});
function geom(key,fn){return geometries[key]||(geometries[key]=fn());}
function cuboid(parent,material,w,h,d,x=0,y=0,z=0){const mesh=new T.Mesh(geom('box',()=>new T.BoxGeometry(1,1,1)),material);mesh.position.set(x,y,z);mesh.scale.set(w,h,d);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
function cyl(parent,material,r1,r2,h,x=0,y=0,z=0,n=16){const g=geom(`c${r1},${r2},${h},${n}`,()=>new T.CylinderGeometry(r1,r2,h,n));const mesh=new T.Mesh(g,material);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
function sphere(parent,material,x,y,z,r){const m=new T.Mesh(geom('sphere',()=>new T.SphereGeometry(1,12,8)),material);m.scale.setScalar(r);m.position.set(x,y,z);parent.add(m);return m;}
function decoded(base64){const s=atob(base64),a=new Uint8Array(s.length);for(let i=0;i<s.length;i++)a[i]=s.charCodeAt(i);return a.buffer;}
function loadTexture(uri){return new Promise((resolve,reject)=>new T.TextureLoader().load(uri,resolve,undefined,reject));}
async function prepare(){if(prepared)return;const data=window.NULL_VISUAL_DATA;if(!data)throw Error('The detailed visual pack is missing.');
const pending=[];for(const [name,set] of Object.entries(data.pbr)){textures[name]={};for(const [kind,uri] of Object.entries(set))pending.push(loadTexture(uri).then(t=>{t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=8;if(kind==='diff')t.colorSpace=T.SRGBColorSpace;textures[name][kind]=t;}));}
const loadedTextures={};for(const [name,uri] of Object.entries(data.textures))pending.push(loadTexture(uri).then(t=>{t.name=name;t.anisotropy=8;if(name.includes('color'))t.colorSpace=T.SRGBColorSpace;loadedTextures[name]=t;}));
await Promise.all(pending);
const manager=new T.LoadingManager();const textureHandler=new T.TextureLoader(manager);textureHandler.load=function(name){const base=name.replace(/\\/g,'/').split('/').pop();return loadedTextures[base]||new T.Texture();};manager.addHandler(/\.tga$/i,textureHandler);const loader=new NullLoaders.FBXLoader(manager);
for(const binary of data.models){const model=loader.parse(decoded(binary),'');model.updateMatrixWorld(true);
model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false;const list=Array.isArray(o.material)?o.material:[o.material];const updated=list.map(old=>{const head=old.name.includes('head'),alpha=old.name.includes('opacity');const material=new T.MeshStandardMaterial({name:old.name,color:0xffffff,map:old.map,normalMap:old.normalMap,normalScale:new T.Vector2(head?.35:.65,head?.35:.65),roughness:head?.8:.69,metalness:head?0:.03,alphaTest:alpha?.38:0,side:alpha?T.DoubleSide:T.FrontSide,transparent:false});return material;});o.material=Array.isArray(o.material)?updated:updated[0];}});
// Sunglasses are built at anatomical eye height, then bound to the head bone.
const glasses=new T.Group();glasses.name='AgentSunglasses';const black=materials.glasses||(materials.glasses=mat(0x020503,.08,.83)),rim=materials.rim||(materials.rim=mat(0x101813,.2,.9));
for(const side of [-1,1]){const lens=new T.Mesh(geom('lens',()=>new T.SphereGeometry(1,20,12)),black);lens.scale.set(3.05,1.5,.35);lens.position.set(side*3.35,0,0);glasses.add(lens);lens.rotation.y=side*-.08;cuboid(glasses,rim,6.1,.24,.7,side*3.35,1.6,0);cuboid(glasses,rim,.22,.28,9.4,side*6.4,1.15,-4.5);}
cuboid(glasses,rim,1.3,.3,.6,0,.25,0);glasses.position.set(0,173.4,9.1);model.add(glasses);model.updateMatrixWorld(true);const head=model.getObjectByName('Bip01_Head');templates.push(model);}
for(const [name,json] of Object.entries(window.NULL_ANIMATIONS||{}))clips[name]=T.AnimationClip.parse(json);prepared=true;
}
function pbr(name,repeatX,repeatY,parameters={}){const source=textures[name],maps={};for(const [kind,t] of Object.entries(source)){const clone=t.clone();clone.repeat.set(repeatX,repeatY);clone.needsUpdate=true;maps[kind]=clone;}return new T.MeshStandardMaterial({color:0xffffff,map:maps.diff,roughnessMap:maps.rough,normalMap:maps.nor_gl,normalScale:new T.Vector2(.6,.6),roughness:.86,metalness:.04,...parameters});}
function floorMaterial(){return pbr('concrete_floor_worn_02',30,38,{color:0x949e92,roughness:.39,metalness:.24,normalScale:new T.Vector2(.32,.32),envMapIntensity:.7});}

// Instanced architectural parts keep thousands of real window frames efficient.
class Batch{
constructor(group){this.group=group;this.items=new Map();}
box(material,x,y,z,w,h,d,color){let b=this.items.get(material);if(!b){b=[];this.items.set(material,b);}b.push({x,y,z,w,h,d,color});}
finish(){const obj=new T.Object3D();for(const [material,items] of this.items){const mesh=new T.InstancedMesh(geom('box',()=>new T.BoxGeometry(1,1,1)),material,items.length);mesh.castShadow=false;mesh.receiveShadow=true;for(let i=0;i<items.length;i++){const a=items[i];obj.position.set(a.x,a.y,a.z);obj.scale.set(a.w,a.h,a.d);obj.updateMatrix();mesh.setMatrixAt(i,obj.matrix);if(a.color!==undefined)mesh.setColorAt(i,new T.Color(a.color));}mesh.instanceMatrix.needsUpdate=true;if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;mesh.computeBoundingSphere();this.group.add(mesh);}}
}
function city(scene){
buildingsGroup=new T.Group();scene.add(buildingsGroup);const batch=new Batch(buildingsGroup);
const stone=mat(0x727b70,.89,.03),stoneDark=mat(0x46504a,.76,.12),aluminum=mat(0x536259,.32,.82),frame=mat(0x27382e,.45,.7),glass=mat(0x334a3e,.14,.66),interior=new T.MeshBasicMaterial({color:0x96ab86}),darkInterior=new T.MeshBasicMaterial({color:0x12251c});
const brick=pbr('dark_brick_wall',7,12,{color:0x647263,roughness:.84});
const locations=[];
for(let row=0;row<4;row++)for(let col=0;col<15;col++){const angle=col/15*Math.PI*2+row*.18,radius=70+row*48;locations.push([Math.sin(angle)*radius,Math.cos(angle)*radius]);}
for(let i=0;i<locations.length;i++){
const [x,z]=locations[i],near=i<30,w=rr(14,27),d=rr(14,25),h=rr(40,132),base=-29,type=i%4,body=type===0?brick:type===1?stone:type===2?glass:stoneDark;
batch.box(body,x,base+h/2,z,w,h,d);
const levels=Math.floor(h/3.5),floorH=h/levels;
// Setback crown, ledges, parapet, roof equipment and antenna mast.
batch.box(stoneDark,x,base+h+.35,z,w+.8,.7,d+.8);
if(type===1||type===3){batch.box(body,x,base+h+3,z,w*.72,6,d*.72);batch.box(stoneDark,x,base+h+6.2,z,w*.76,.4,d*.76);batch.box(frame,x,base+h+8.4,z,w*.35,4,d*.35);}
batch.box(frame,x-w*.2,base+h+1.2,z+d*.14,3.6,2.4,3.2);batch.box(aluminum,x-w*.2,base+h+2.5,z+d*.14,3.8,.25,3.4);
if(i%3===0){batch.box(aluminum,x+w*.17,base+h+7,z,.12,14,.12);batch.box(aluminum,x+w*.17,base+h+8,z,3.5,.09,.08);batch.box(new T.MeshBasicMaterial({color:0xe65b45}),x+w*.17,base+h+14,z,.2,.2,.2);}
if(!near){for(let f=1;f<levels;f+=2)batch.box(frame,x,base+f*floorH,z,w+.06,.16,d+.06);}
// Four façades: recessed lights behind window mullions, irregular occupancy.
for(const side of [-1,1])for(const axis of ['z','x']){
const length=axis==='z'?w:d,n=Math.floor((length-1.5)/(type===2?2.1:3));const step=(length-1.4)/n;
for(let f=1;f<levels;f++){
const y=base+f*floorH+.15;
if(near||f%2===0){const xx=axis==='z'?x:x+side*(w/2+.085),zz=axis==='z'?z+side*(d/2+.085):z;batch.box(type===2?aluminum:stoneDark,xx,y-floorH*.48,zz,axis==='z'?w+.2:.22,.16,axis==='z'?.22:d+.2);}
for(let j=0;j<n;j++){
const k=-length/2+.7+step*(j+.5),xx=axis==='z'?x+k:x+side*(w/2+.025),zz=axis==='z'?z+side*(d/2+.025):z+k,winW=type===2?step-.16:step*.62,winH=floorH*(type===1?.53:.72);
const lit=random()>.6,windowMat=lit?interior:glass;
const color=lit?[0x83997b,0xb0aa83,0x638c7c,0x9ba58e,0x536d5c][Math.floor(random()*5)]:undefined;
batch.box(windowMat,xx,y,zz,axis==='z'?winW:.055,winH,axis==='z'?.055:winW,color);
if(near){const recess=.07*side,xFrame=axis==='z'?xx:xx+recess,zFrame=axis==='z'?zz+recess:zz;
for(const edge of [-1,1])batch.box(frame,axis==='z'?xx+edge*winW/2:xFrame,y,axis==='z'?zFrame:zz+edge*winW/2,axis==='z'?.09:.13,winH+.15,axis==='z'?.13:.09);
batch.box(frame,xFrame,y+winH/2,zFrame,axis==='z'?winW+.15:.13,.1,axis==='z'?.13:winW+.15);
batch.box(type===1?stone:frame,xFrame,y-winH/2,zFrame,axis==='z'?winW+.25:.18,type===1?.2:.08,axis==='z'?.18:winW+.25);
if(lit&&random()>.38){const level=rr(-.1,.3)*winH;batch.box(darkInterior,xFrame,y+level,zFrame,axis==='z'?winW:.09,.055,axis==='z'?.09:winW);}
if(lit&&random()>.78)batch.box(darkInterior,axis==='z'?xx+winW*.1:xFrame,y-.1,axis==='z'?zFrame:zz+winW*.1,axis==='z'?.12:.09,winH*.8,axis==='z'?.09:.12);
}
}
}
}
// Tall continuous vertical fins distinguish modern curtain walls.
if(type===2&&near){for(let k=-w/2;k<=w/2;k+=2.2)for(const side of [-1,1])batch.box(aluminum,x+k,base+h/2,z+side*(d/2+.18),.09,h,.24);}
}
batch.finish();return buildingsGroup;
}
function paintedTexture(text,sub=''){const c=document.createElement('canvas');c.width=1024;c.height=512;const a=c.getContext('2d');a.fillStyle='#151e17';a.fillRect(0,0,1024,512);a.strokeStyle='#748c73';a.lineWidth=4;a.strokeRect(20,20,984,472);a.fillStyle='#b6c8a3';a.font='bold 90px Arial';a.textAlign='center';a.fillText(text,512,245);a.font='26px Consolas';a.fillText(sub,512,326);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;return tex;}
function rooftop(scene,colliders,exit){
const metal=mat(0x6c786d,.38,.8),black=mat(0x19271e,.58,.65),rust=mat(0x605b40,.83,.35),stone=mat(0x566354,.87,.03),warm=new T.MeshBasicMaterial({color:0xd4d8b1}),white=mat(0xa7ad94,.75,.06);
const batch=new Batch(scene);
// Detailed ventilation housings: braces, bolts, fans, gauges and curved outlets.
for(const b of colliders.slice(0,8)){
for(const side of [-1,1]){batch.box(metal,b.x+side*(b.w-.13),b.height/2,b.z+b.d+.035,.08,b.height,.05);for(let row=0;row<4;row++)batch.box(rust,b.x+side*(b.w-.13),.3+row*(b.height-.4)/4,b.z+b.d+.07,.035,.035,.028);}
for(const side of [-1,1])batch.box(black,b.x,b.height+.18,b.z+side*b.d*.55,b.w*1.45,.07,.05);
const vent=new T.Group();vent.position.set(b.x+b.w*.5,b.height,b.z);scene.add(vent);cyl(vent,metal,.24,.24,.65,0,.325,0);const bend=new T.Mesh(geom('elbow',()=>new T.TorusGeometry(.28,.24,10,16,Math.PI/2)),metal);bend.position.set(0,.65,0);bend.rotation.z=Math.PI/2;vent.add(bend);cyl(vent,black,.23,.23,.09,-.28,.91,0).rotation.z=Math.PI/2;
batch.box(black,b.x+b.w*.65,.75,b.z+b.d+.05,.42,.55,.06);batch.box(warm,b.x+b.w*.65,.86,b.z+b.d+.09,.16,.09,.025);
}
// Expansion joints, drainage and worn perimeter paint.
for(let z=-36;z<37;z+=8){batch.box(black,0,.013,z,61,.018,.025);for(let x=-28;x<30;x+=9){batch.box(black,x,.016,z+.4,.5,.025,.6);for(let n=0;n<6;n++)batch.box(metal,x-.2+n*.08,.035,z+.4,.025,.013,.51);}}
for(const x of [-30.2,30.2])for(let z=-36;z<39;z+=2)batch.box(white,x,.035,z,.17,.018,1.2);
// Brick elevator/stairwell house along the west edge; real windows, steel door.
const building=new T.Group();building.position.set(-27,0,26);scene.add(building);const brick=pbr('dark_brick_wall',5,3,{color:0x949d88});cuboid(building,brick,6,4.7,8,0,2.35,0);cuboid(building,stone,6.5,.3,8.5,0,4.75,0);cuboid(building,black,1.5,2.75,.15,1.6,1.38,4.06);cuboid(building,metal,.085,2.9,.2,.79,1.43,4.08);cuboid(building,metal,.085,2.9,.2,2.4,1.43,4.08);cuboid(building,metal,1.7,.1,.2,1.6,2.9,4.08);cuboid(building,metal,.06,.28,.08,2.1,1.35,4.18);cuboid(building,warm,.65,.12,.2,1.6,3.15,4.25);const lamp=new T.PointLight(0xcad2a6,17,8,2);lamp.position.set(-25.4,3,30.8);scene.add(lamp);
const sign=new T.Mesh(new T.PlaneGeometry(2.3,.62),new T.MeshStandardMaterial({map:paintedTexture('MAINTENANCE','AUTHORIZED PERSONNEL ONLY'),roughness:.8}));sign.position.set(-1.2,2.8,4.065);building.add(sign);
colliders.push({x:-27,z:26,w:3,d:4,height:4.7});
// Water tower and support structure on the neighboring roof, outside the arena.
const tower=new T.Group();tower.position.set(-41,0,-14);scene.add(tower);const wood=mat(0x514d37,.91,.04);for(const x of [-1.7,1.7])for(const z of [-1.7,1.7]){cuboid(tower,black,.16,4,.16,x,2,z);const brace=cuboid(tower,metal,.1,4.4,.1,x,2,z);brace.rotation.z=x>0?.3:-.3;}cyl(tower,wood,2.6,2.5,4.7,0,6.1,0,40);cyl(tower,black,.04,2.8,1.25,0,9.08,0,40);for(const y of [4.2,5.7,7.8]){const hoop=new T.Mesh(new T.TorusGeometry(2.58,.065,6,48),metal);hoop.rotation.x=Math.PI/2;hoop.position.y=y;tower.add(hoop);}for(let a=0;a<40;a++){const theta=a/40*Math.PI*2;cuboid(tower,rust,.03,4.7,.03,Math.cos(theta)*2.59,6.1,Math.sin(theta)*2.59);}for(const y of [1,1.4,1.8,2.2,2.6,3,3.4,3.8,4.2,4.6,5,5.4,5.8,6.2,6.6,7])cuboid(tower,metal,.65,.065,.08,0,y,2.85);for(const x of [-.38,.38])cuboid(tower,metal,.08,7.7,.08,x,3.85,2.85);
// Satellite receiver and rooftop aerial array.
const dishGroup=new T.Group();dishGroup.position.set(25,0,12);scene.add(dishGroup);cyl(dishGroup,metal,.1,.16,2,0,1,0);const dish=new T.Mesh(new T.SphereGeometry(1.25,24,12,0,Math.PI*2,0,.52*Math.PI),mat(0x828b7c,.35,.6));dish.rotation.x=-.6;dish.position.y=2.3;dishGroup.add(dish);cuboid(dishGroup,black,.09,1.4,.09,0,2.8,.55).rotation.x=.8;
for(let i=0;i<6;i++){const x=18+i*.5;batch.box(metal,x,5,37,.05,.05,2.2-i*.15);}batch.box(metal,19.2,2.5,37,.08,5,.08);batch.box(metal,19.2,5,37,3.5,.07,.07);
// A real telephone exit, a visual anchor directly tied to Matrix extraction.
exit.children.forEach(o=>o.visible=false);const phone=new T.Group();exit.add(phone);
for(const x of [-1.05,1.05])for(const z of [-.8,.8])cuboid(phone,metal,.075,2.9,.075,x,1.45,z);
cuboid(phone,black,2.2,.2,1.8,0,.1,0);cuboid(phone,metal,2.2,.18,1.8,0,2.95,0);
const phoneSign=new T.Mesh(new T.PlaneGeometry(1.9,.34),new T.MeshBasicMaterial({map:paintedTexture('TELEPHONE')}));phoneSign.position.set(0,2.95,.92);phone.add(phoneSign);
const glass=mat(0x749184,.14,.75);glass.transparent=true;glass.opacity=.18;glass.depthWrite=false;for(const x of [-1.03,1.03])cuboid(phone,glass,.025,2.5,1.6,x,1.6,0);cuboid(phone,glass,2,2.5,.025,0,1.6,-.8);
cuboid(phone,metal,.65,1.05,.32,0,1.6,-.59);cuboid(phone,black,.47,.28,.025,0,1.94,-.41);cuboid(phone,new T.MeshBasicMaterial({color:0x8eb79a}),.33,.12,.015,0,1.95,-.389);
for(let row=0;row<4;row++)for(let col=0;col<3;col++)cuboid(phone,black,.074,.052,.045,-.105+col*.105,1.7-row*.081,-.394);
cuboid(phone,black,.12,.55,.11,-.4,1.68,-.36);cyl(phone,black,.115,.115,.12,-.4,1.96,-.33).rotation.x=Math.PI/2;cyl(phone,black,.115,.115,.12,-.4,1.39,-.33).rotation.x=Math.PI/2;
const points=[];for(let i=0;i<100;i++){const y=1.35-i*.006;points.push(vec(-.4+Math.sin(i*.6)*.028,y,-.37+Math.cos(i*.6)*.028));}const cord=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),100,.014,5,false),black);phone.add(cord);
const light=new T.PointLight(0x9dffaf,0,7,2);light.position.set(0,2.4,0);phone.add(light);phone.userData.exitLight=light;
batch.finish();makeCode(scene);
return phone;
}
function makeCode(scene){const c=document.createElement('canvas');c.width=256;c.height=512;const a=c.getContext('2d');a.fillStyle='#000';a.fillRect(0,0,256,512);a.font='19px monospace';const chars='アイウエオカキクケコサシスセソ012345789';for(let x=0;x<256;x+=21){for(let y=0;y<512;y+=24){a.fillStyle=`rgba(125,255,128,${rr(.06,.75)})`;a.fillText(chars[Math.floor(random()*chars.length)],x,y);}}const tex=new T.CanvasTexture(c);tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.colorSpace=T.SRGBColorSpace;codeMaterial=new T.MeshBasicMaterial({map:tex,transparent:true,opacity:0,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide});for(const [x,z,rot] of [[-31,0,Math.PI/2],[31,0,Math.PI/2],[0,-39,0]]){const m=new T.Mesh(new T.PlaneGeometry(64,30),codeMaterial);m.position.set(x,15,z);m.rotation.y=rot;scene.add(m);codeSheets.push(m);}}
function pistol(){const p=new T.Group(),metal=materials.gun||(materials.gun=mat(0x78847a,.37,.45)),black=materials.gunBlack||(materials.gunBlack=mat(0x303a32,.67,.08)),edge=materials.gunEdge||(materials.gunEdge=mat(0xa2afa4,.34,.4));
cuboid(p,metal,.042,.045,.23,0,0,.065);cuboid(p,black,.041,.103,.052,0,-.067,-.014).rotation.x=.18;cuboid(p,black,.038,.028,.166,0,-.033,.044);
cyl(p,edge,.012,.012,.029,0,0,.184,16).rotation.x=Math.PI/2;cyl(p,black,.0085,.0085,.002,0,0,.2,16).rotation.x=Math.PI/2;
cuboid(p,black,.033,.011,.018,0,.028,-.036);cuboid(p,edge,.009,.013,.012,0,.029,.166);cuboid(p,black,.016,.003,.052,.009,.024,.059);
const trigger=new T.Mesh(geom('agent-trigger-compact',()=>new T.TorusGeometry(.025,.004,6,14,Math.PI*1.5)),metal);trigger.rotation.y=Math.PI/2;trigger.position.set(0,-.043,.045);p.add(trigger);
for(const side of [-1,1]){cuboid(p,edge,.002,.003,.17,side*.022,.016,.057);for(let i=0;i<5;i++)cuboid(p,black,.002,.027,.004,side*.022,0,-.029+i*.009);}return p;}
function agent(variant=0){
const root=new T.Group(),model=NullLoaders.clone(templates[variant%templates.length]);model.scale.setScalar(.01125);root.add(model);const glasses=model.getObjectByName('AgentSunglasses');if(glasses){glasses.removeFromParent();root.add(glasses);glasses.scale.setScalar(.01125);}const mixer=new T.AnimationMixer(model),actions={};for(const [name,clip] of Object.entries(clips)){actions[name]=mixer.clipAction(clip);actions[name].play();actions[name].weight=name==='walk'?1:0;}mixer.update(0);model.updateMatrixWorld(true);
const bones={};model.traverse(o=>{if(o.isBone)bones[o.name]=o;});
const gun=pistol();root.add(gun);const flash=new T.Mesh(geom('muzzle-cone',()=>new T.ConeGeometry(.075,.3,6)),(materials.flash||(materials.flash=new T.MeshBasicMaterial({color:0xf5ffd0,transparent:true,opacity:.85}))));flash.rotation.x=Math.PI/2;flash.position.z=.42;flash.visible=false;gun.add(flash);
const proxyMaterial=materials.proxy||(materials.proxy=new T.MeshBasicMaterial({visible:false}));const body=cuboid(root,proxyMaterial,.67,1.38,.43,0,.91,0),head=new T.Mesh(geom('proxy-head',()=>new T.SphereGeometry(.21,10,8)),proxyMaterial);head.position.set(0,1.82,.015);root.add(head);head.visible=false;body.visible=false;body.userData.hitbox=head.userData.hitbox=true;
const grip=Object.values(bones).filter(b=>/^Bip01_[RL]_Finger/.test(b.name)).map(b=>({bone:b,quaternion:b.quaternion.clone(),curl:b.name.endsWith('0')?.25:b.name.endsWith('1')?.35:.85}));const record={root,model,glasses,bones,grip,mixer,actions,gun,flash,head,body,walkBlend:1,recoil:0};animateAgent(record,.01,1,false);return record;
}
function aimBone(bone,child,target){if(!bone||!child)return;const origin=bone.getWorldPosition(vec()),current=child.getWorldPosition(vec()).sub(origin).normalize(),wanted=target.clone().sub(origin).normalize();const delta=new T.Quaternion().setFromUnitVectors(current,wanted);const q=bone.getWorldQuaternion(new T.Quaternion()).premultiply(delta);bone.quaternion.copy(bone.parent.getWorldQuaternion(new T.Quaternion()).invert().multiply(q));bone.updateWorldMatrix(false,true);}
function animateAgent(a,dt,moving=true,firing=false){const wanted=moving?1:0;a.walkBlend+=(wanted-a.walkBlend)*Math.min(1,dt*8);if(a.actions.walk)a.actions.walk.weight=a.walkBlend;if(a.actions.idle)a.actions.idle.weight=1-a.walkBlend;a.mixer.update(dt*(moving?1.25:1));a.root.updateMatrixWorld(true);
for(const g of a.grip){g.bone.quaternion.copy(g.quaternion).multiply(new T.Quaternion().setFromAxisAngle(vec(0,0,1),g.curl));}const p=v=>a.root.localToWorld(v);const b=a.bones;
aimBone(b.Bip01_R_UpperArm,b.Bip01_R_Forearm,p(vec(-.3,1.45,.31)));aimBone(b.Bip01_R_Forearm,b.Bip01_R_Hand,p(vec(-.12,1.58,.64)));
if(b.Bip01_L_UpperArm&&b.Bip01_L_Forearm&&b.Bip01_L_Hand&&b.Bip01_R_Hand){
const shoulder=b.Bip01_L_UpperArm.getWorldPosition(vec()),elbow=b.Bip01_L_Forearm.getWorldPosition(vec()),wrist=b.Bip01_L_Hand.getWorldPosition(vec());const target=p(a.root.worldToLocal(b.Bip01_R_Hand.getWorldPosition(vec())).add(vec(.047,-.018,.012)));
const upperLength=shoulder.distanceTo(elbow),foreLength=elbow.distanceTo(wrist),axis=target.clone().sub(shoulder),distance=Math.max(.001,Math.min(axis.length(),upperLength+foreLength-.001));axis.normalize();
const bend=p(vec(.34,1.3,.24)).sub(shoulder);bend.addScaledVector(axis,-bend.dot(axis));if(bend.lengthSq()<.000001)bend.copy(vec(0,-1,0)).addScaledVector(axis,axis.y);bend.normalize();
const along=(upperLength*upperLength-foreLength*foreLength+distance*distance)/(2*distance),height=Math.sqrt(Math.max(0,upperLength*upperLength-along*along));const elbowTarget=shoulder.clone().addScaledVector(axis,along).addScaledVector(bend,height);
aimBone(b.Bip01_L_UpperArm,b.Bip01_L_Forearm,elbowTarget);aimBone(b.Bip01_L_Forearm,b.Bip01_L_Hand,target);
}
if(b.Bip01_R_Hand){const hand=b.Bip01_R_Hand.getWorldPosition(vec());a.gun.position.copy(a.root.worldToLocal(hand));a.gun.position.y+=.065;a.gun.position.z+=.052;}a.flash.position.z=.295;a.flash.scale.setScalar(.65);
if(b.Bip01_Head){const position=b.Bip01_Head.getWorldPosition(vec());a.head.position.copy(a.root.worldToLocal(position)).add(vec(0,.14,.035));if(a.glasses){a.glasses.position.copy(a.head.position).add(vec(0,-.06,.12));a.glasses.rotation.set(0,0,0);}}
a.recoil=Math.max(0,a.recoil-dt*5);if(firing)a.recoil=1;a.gun.rotation.x=-a.recoil*.12;a.flash.visible=a.recoil>.75;
}
function update(dt,slow,exitOpen,phone){clock+=dt;if(codeMaterial){codeMaterial.opacity+=( (slow?.095:0)-codeMaterial.opacity)*Math.min(1,dt*5);codeMaterial.map.offset.y=clock*.09;}if(phone?.userData.exitLight)phone.userData.exitLight.intensity=exitOpen?15+Math.sin(clock*4)*2:1;}
function viewWeapon(camera){
const group=new T.Group();camera.add(group);const steel=mat(0x65756c,.25,.94),edge=mat(0x9aab9e,.22,.96),black=mat(0x101a14,.52,.25),glove=mat(0x29322b,.83,.04),sleeve=mat(0x111d15,.88,.02);
function bevel(w,h,d,r,material,x,y,z){const s=new T.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);const g=new T.ExtrudeGeometry(s,{depth:d,steps:1,bevelEnabled:true,bevelSegments:2,bevelSize:.003,bevelThickness:.003,curveSegments:4});g.translate(0,0,-d/2);const m=new T.Mesh(g,material);m.position.set(x,y,z);group.add(m);return m;}
bevel(.128,.12,.4,.018,steel,0,.012,-.025);bevel(.11,.09,.31,.014,black,0,-.075,.005);bevel(.102,.24,.115,.023,black,0,-.18,.108).rotation.x=-.24;
bevel(.06,.025,.055,.005,black,0,.085,.145);for(const x of [-.024,.024])sphere(group,new T.MeshBasicMaterial({color:0xbce6aa}),x,.097,.17,.006);
bevel(.017,.028,.026,.004,black,0,.083,-.194);sphere(group,new T.MeshBasicMaterial({color:0xc2edb0}),0,.098,-.18,.004);
const barrel=cyl(group,edge,.028,.028,.029,0,.012,-.242,20);barrel.rotation.x=Math.PI/2;cyl(group,black,.02,.02,.002,0,.012,-.26,20).rotation.x=Math.PI/2;
bevel(.05,.014,.09,.003,black,.025,.079,.007);bevel(.047,.011,.057,.002,edge,.025,.082,-.005);
for(const side of [-1,1]){for(let i=0;i<8;i++)cuboid(group,black,.003,.07,.008,side*.066,.012,.095+i*.012);cuboid(group,edge,.003,.004,.27,side*.069,.053,-.04);cuboid(group,black,.003,.004,.19,side*.07,-.025,-.07);}
const trigger=new T.Mesh(new T.TorusGeometry(.058,.008,8,20,Math.PI*1.65),steel);trigger.rotation.y=Math.PI/2;trigger.rotation.x=.2;trigger.position.set(0,-.105,.019);group.add(trigger);
const lever=bevel(.012,.023,.055,.003,black,.071,-.05,.064);lever.rotation.x=.12;
// Anatomically proportioned gloved fingers and rounded forearms.
const hand=new T.Mesh(new T.CapsuleGeometry(.052,.07,4,10),glove);hand.position.set(.015,-.174,.13);hand.rotation.x=.45;group.add(hand);
for(let i=0;i<4;i++){const finger=new T.Mesh(new T.CapsuleGeometry(.014,.072,4,8),glove);finger.rotation.z=Math.PI/2;finger.rotation.y=-.13;finger.position.set(-.003,-.135-i*.025,.048+i*.005);group.add(finger);}
const thumb=new T.Mesh(new T.CapsuleGeometry(.017,.073,4,8),glove);thumb.rotation.x=.7;thumb.rotation.z=-.55;thumb.position.set(.058,-.14,.13);group.add(thumb);
for(const [x,y,z,rz,ry] of [[.105,-.25,.34,-.2,-.23],[-.11,-.265,.27,.5,.68]]){const arm=new T.Mesh(new T.CapsuleGeometry(.076,.35,6,12),sleeve);arm.rotation.x=Math.PI/2;arm.rotation.y=ry;arm.rotation.z=rz;arm.position.set(x,y,z);group.add(arm);}
const support=new T.Mesh(new T.CapsuleGeometry(.045,.065,4,10),glove);support.position.set(-.054,-.18,.092);support.rotation.z=.65;group.add(support);
const muzzle=new T.Object3D();muzzle.position.set(0,.012,-.275);group.add(muzzle);
const flash=new T.Mesh(new T.ConeGeometry(.06,.28,7),new T.MeshBasicMaterial({color:0xf3ffc6,transparent:true,opacity:.85}));flash.rotation.x=-Math.PI/2;flash.position.set(0,.012,-.39);flash.visible=false;group.add(flash);const light=new T.PointLight(0xd8ffc2,0,5);light.position.set(0,.05,-.4);group.add(light);group.traverse(o=>{o.castShadow=false;o.frustumCulled=false;});return {group,muzzle,flash,light};
}
function disposeAgent(a){a.mixer.stopAllAction();a.mixer.uncacheRoot(a.model);a.root.traverse(o=>{if(o.isSkinnedMesh)o.skeleton.dispose();});}
return {prepare,city,rooftop,floorMaterial,agent,animateAgent,update,disposeAgent,viewWeapon,info:()=>({characters:templates.length,materials:Object.keys(textures).length,animations:Object.keys(clips)})};
})();

