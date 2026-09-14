/* NULL SHIFT / 02 — LAST TRAIN. Original procedural station and mission props. */
window.NULLSTATION=(()=>{
'use strict';
const T=THREE;
function build(reflectiveFloor){
 const root=new T.Group();root.name='LastTrainStation';const colliders=[],breakers=[],lamps=[],doors=[],wheels=[];
 const geometry=new T.BoxGeometry(1,1,1);
 const material=(color,roughness=.6,metalness=.1)=>new T.MeshStandardMaterial({color,roughness,metalness});
 const stone=material(0x9ca99c,.79),green=material(0x274639,.28,.23),dark=material(0x101b17,.54,.4),steel=material(0x7a8c81,.32,.7),brass=material(0x8b8058,.3,.65),black=material(0x06110d,.38,.15);
 const glow=new T.MeshBasicMaterial({color:0xcaffaf}),warm=new T.MeshBasicMaterial({color:0xf2e8b8}),red=new T.MeshBasicMaterial({color:0xfb705e});
 const box=(w,h,d,m,x=0,y=0,z=0,parent=root)=>{const o=new T.Mesh(geometry,m);o.scale.set(w,h,d);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;};
 const block=(x,z,w,d,height)=>colliders.push({x,z,w:w/2,d:d/2,height});
 const cyl=(r,h,m,x,y,z,parent=root)=>{const o=new T.Mesh(new T.CylinderGeometry(r,r,h,16),m);o.position.set(x,y,z);o.castShadow=true;parent.add(o);return o;};
 function texture(kind){const c=document.createElement('canvas');c.width=c.height=512;const a=c.getContext('2d');a.fillStyle=kind==='wall'?'#547165':'#a5ada1';a.fillRect(0,0,512,512);let seed=1482;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};for(let i=0;i<18000;i++){const n=rnd();a.fillStyle=n>.5?'#ffffff18':'#10201524';a.fillRect(rnd()*512,rnd()*512,1+rnd()*2,1+rnd()*2);}a.strokeStyle=kind==='wall'?'#162d24':'#38483b';a.lineWidth=kind==='wall'?4:2;for(let y=0;y<512;y+=kind==='wall'?64:128){a.beginPath();a.moveTo(0,y);a.lineTo(512,y);a.stroke();for(let x=(y/64%2)*64;x<512;x+=128){a.beginPath();a.moveTo(x,y);a.lineTo(x,y+(kind==='wall'?64:128));a.stroke();}}const tex=new T.CanvasTexture(c);tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.repeat.set(kind==='wall'?8:12,kind==='wall'?2:15);tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=4;return tex;}
 const tile=material(0xc6d1c3,.26,.28);tile.map=texture('floor');tile.bumpMap=tile.map;tile.bumpScale=.025;tile.onBeforeCompile=reflectiveFloor.onBeforeCompile;
 const floor=new T.Mesh(new T.PlaneGeometry(64,80),tile);floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;root.add(floor);
 const wall=material(0xa8c5b6,.31,.12);wall.map=texture('wall');wall.bumpMap=wall.map;wall.bumpScale=.016;
 // Glazed tiles, stone courses, brass edging and a ribbed barrel-vault ceiling.
 for(const x of [-31.5,31.5]){box(.8,4,80,wall,x,2,0);box(.8,4.3,80,stone,x,6.1,0);box(.9,.12,80,brass,x,4,0);box(1.05,.24,80,dark,x,.12,0);block(x,0,.8,80,9);}
 for(const z of [-39.5,39.5]){box(64,8,.8,stone,0,4,z);box(64,3,.9,wall,0,1.5,z);block(0,z,64,.8,9);}
 const verts=[],uv=[];for(let i=0;i<40;i++){const a=i/40*Math.PI,b=(i+1)/40*Math.PI;for(const [angle,z] of [[a,-40],[a,40],[b,40],[a,-40],[b,40],[b,-40]]){verts.push(Math.cos(angle)*31.5,8+Math.sin(angle)*4,z);uv.push(angle/Math.PI,z/80+.5);}}
 const vaultGeo=new T.BufferGeometry();vaultGeo.setAttribute('position',new T.Float32BufferAttribute(verts,3));vaultGeo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));vaultGeo.computeVertexNormals();const vaultMat=stone.clone();vaultMat.side=T.DoubleSide;root.add(new T.Mesh(vaultGeo,vaultMat));
 for(let z=-36;z<=36;z+=12){const path=[];for(let i=0;i<=32;i++){const a=i/32*Math.PI;path.push(new T.Vector3(Math.cos(a)*31.5,7.94+Math.sin(a)*4,z));}const rib=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(path),40,.16,6,false),dark);root.add(rib);box(62,.25,.3,dark,0,7.75,z);}
 for(const x of [-11,8])for(const z of [-29,-15,-1,13,27]){box(1.5,.3,1.5,dark,x,.15,z);box(1.04,4,1.04,green,x,2.2,z);box(1.12,.1,1.12,brass,x,3.4,z);box(.92,3.7,.92,stone,x,5.9,z);box(1.6,.32,1.6,dark,x,7.6,z);block(x,z,1.5,1.5,8);for(const off of [-.3,0,.3])box(.045,3.6,.028,brass,x+off,2,z+.532);}
 // Practical fluorescent light bars and hanging station information.
 for(const x of [-21,-1,17])for(const z of [-28,-8,12,31]){box(.75,.2,5,dark,x,7.3,z);box(.57,.055,4.6,warm,x,7.17,z);for(const dz of [-2.15,2.15])cyl(.025,.6,steel,x,7.7,z+dz);const l=new T.PointLight(0xc5e1be,29,24,2);l.position.set(x,6.4,z);root.add(l);lamps.push(l);}
 function sign(text,sub,w,h,x,y,z,rotate=0,parent=root,color='#c6ffc0'){const c=document.createElement('canvas');c.width=1024;c.height=256;const a=c.getContext('2d');a.fillStyle='#081913';a.fillRect(0,0,1024,256);a.fillStyle=color;a.fillRect(20,26,7,204);a.font='bold 75px Arial';a.fillText(text,58,114);a.font='30px Consolas,monospace';a.fillText(sub,62,190);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;const mesh=box(w,h,.12,new T.MeshBasicMaterial({map:tex}),x,y,z,parent);mesh.rotation.y=rotate;return mesh;}
 sign('MARA / CENTRAL','02  •  LAST TRAIN  /  CONCOURSE',13,3,-4,5.3,-38.9);
 sign('PLATFORM 01 →','EXIT SERVICE  /  AUTHORIZATION REQUIRED',13,2.3,-2,6.5,8);
 sign('ARCHIVE ←','POWER CELLS  A + B  /  LOWER SHIELD',10,1.7,-21,5,-23);
 sign('MARA / CENTRAL','NO SERVICE  /  STAY BEHIND THE LINE',10,2,31,4,-12,-Math.PI/2);
 for(const z of [-18,7,29]){sign('WAKE UP.','THE SYSTEM IS LISTENING.',4,2.1,-30.96,2.8,z,Math.PI/2);}
 // Benches, vending cabinets, turnstiles, maintenance crates and tactile floor strips.
 for(const [x,z] of [[-22,4],[-21,22],[1,-5],[1,23],[-19,-27]]){box(5,.16,1.1,green,x,.56,z);box(5,.8,.15,green,x,1.04,z-.48);for(const dx of [-1.9,1.9]){box(.12,.6,.8,steel,x+dx,.3,z);box(.1,.35,1,brass,x+dx,.8,z);}block(x,z,5,1.2,1.4);}
 for(const [x,z] of [[-27,-7],[-26,32],[13,-13]]){box(2.2,2.9,1.2,dark,x,1.45,z);box(1.6,1.65,.04,green,x,1.9,z+.63);for(let i=0;i<4;i++)box(1.35,.08,.07,warm,x,1.3+i*.34,z+.67);box(.44,.55,.05,black,x+.55,.7,z+.65);block(x,z,2.2,1.2,2.9);}
 for(const [x,z] of [[-5,32],[2,32],[-25,-32],[12,5]]){box(2,1.15,1.5,steel,x,.58,z);box(2.1,.07,1.6,dark,x,1.2,z);block(x,z,2,1.5,1.25);}
 for(let z=-38;z<39;z+=2){box(.25,.014,1,brass,18.25,.018,z);for(let dx=0;dx<5;dx++)box(.07,.028,1.4,stone,17.5+dx*.12,.024,z);}
 // Track bed and rails remain behind a collision boundary: no invisible fall deaths.
 box(11,.12,78,black,25,.075,0);for(const x of [22.5,27.5])box(.13,.18,79,steel,x,.23,0);for(let z=-38;z<39;z+=1.4)box(8,.1,.23,dark,25,.14,z);
 block(24.5,0,11,78,20);
 for(const z of [-29,-11,7,30]){box(.14,1.12,6,steel,19,.6,z);box(.14,.1,6,brass,19,1.2,z);}
 // Exposed power cells are actual shootable meshes; they protect the archive core.
 const orbGeo=new T.IcosahedronGeometry(.4,2);
 for(const [i,x,z] of [[0,-23,-17],[1,13,-28]]){const g=new T.Group();g.position.set(x,0,z);root.add(g);box(1.45,1.9,1.15,dark,0,.95,0,g);box(1.6,.1,1.3,brass,0,1.93,0,g);cyl(.3,.35,steel,0,2.17,0,g);const m=new T.MeshStandardMaterial({color:0xbaff96,emissive:0x95ff64,emissiveIntensity:2,metalness:.4,roughness:.1});const orb=new T.Mesh(orbGeo,m);orb.position.set(0,2.55,0);g.add(orb);const ring=new T.Mesh(new T.TorusGeometry(.61,.026,6,32),glow);ring.position.y=2.55;g.add(ring);const beam=new T.Mesh(new T.CylinderGeometry(.22,.22,4.3,8,1,true),new T.MeshBasicMaterial({color:0xb8ff87,transparent:true,opacity:.08,depthWrite:false,side:T.DoubleSide}));beam.position.y=4;g.add(beam);sign('CELL '+(i?'B':'A'),'SHOOT TO DISABLE',2.8,.72,0,3.6,0,0,g);block(x,z,1.45,1.15,1.95);breakers.push({x,z,group:g,orb,ring,beam,hp:120,done:false,id:i?'B':'A'});}
 const core=new T.Group();core.position.set(-4,0,-31);root.add(core);box(2.8,1,2.4,black,0,.5,0,core);box(2.9,.12,2.5,steel,0,1.03,0,core);block(-4,-31,2.8,2.4,1.1);
 const coreMesh=new T.Mesh(new T.OctahedronGeometry(.5,1),new T.MeshStandardMaterial({color:0xe6ffd5,emissive:0xa4ff77,emissiveIntensity:2,roughness:.12,metalness:.75}));coreMesh.position.y=1.85;core.add(coreMesh);
 const shield=new T.Mesh(new T.CylinderGeometry(1.65,1.65,3.7,32,1,true),new T.MeshBasicMaterial({color:0xc6ff8c,transparent:true,opacity:.17,depthWrite:false,side:T.DoubleSide}));shield.position.y=1.9;core.add(shield);for(const y of [.15,3.7]){const ring=new T.Mesh(new T.TorusGeometry(1.65,.028,6,48),glow);ring.rotation.x=Math.PI/2;ring.position.y=y;core.add(ring);}
 sign('ARCHIVE 07','ENCRYPTED  /  RELEASE BOTH POWER CELLS',5,1.15,0,4.5,0,0,core);
 const consoleGroup=new T.Group();consoleGroup.position.set(15,0,18);root.add(consoleGroup);box(1.4,1.25,.9,dark,0,.63,0,consoleGroup);box(1.1,.65,.06,new T.MeshBasicMaterial({color:0x74b680}),0,1.28,.49,consoleGroup);sign('CALL TRAIN','INSERT CORE / HOLD E',3,.8,0,2.6,0,0,consoleGroup);block(15,18,1.4,.9,1.7);
 const departure=sign('NO SERVICE','01  /  WAITING FOR AN OPERATOR',9,1.8,22,6.2,20);
 // A three-car train slides into the station, then opens two passenger doors.
 const train=new T.Group();train.position.set(25,0,-138);root.add(train);const bodyMat=material(0xa5b2a7,.29,.65),glass=material(0x152a22,.14,.5);glass.emissive=new T.Color(0x315849);glass.emissiveIntensity=.22;
 for(const center of [-20,0,20]){box(6,3.55,18.8,bodyMat,0,2.7,center,train);box(6.08,.55,18.7,green,0,1.3,center,train);box(6.1,.09,18.8,brass,0,2.25,center,train);box(5.8,.2,18.7,dark,0,4.57,center,train);box(5.5,.7,18,dark,0,.68,center,train);
  for(const side of [-1,1])for(const z of [-6,-2,2,6]){box(.055,1.32,2.5,dark,side*3.07,3.32,center+z,train);box(.058,1.11,2.24,glass,side*3.105,3.34,center+z,train);box(.08,.026,2.24,warm,side*3.11,3.82,center+z,train);}
  for(const z of [-6.7,6.7])for(const side of [-1,1]){const wheel=cyl(.42,.22,dark,side*2.8,.55,center+z,train);wheel.rotation.z=Math.PI/2;wheels.push(wheel);}
 }
 box(5.6,2.3,.08,black,0,2.25,29.46,train);box(4.65,1.1,.1,glass,0,3.3,29.53,train);for(const x of [-2,2])box(.5,.3,.12,warm,x,1.6,29.6,train);sign('01 / ZION','AUTHORIZED DEPARTURE',3.8,.58,0,4.03,29.6,0,train);
 // Door opening is aligned with the green boarding point on the platform.
 box(.07,2.7,2.8,black,-3.14,2.35,0,train);for(const s of [-1,1]){const d=new T.Group();d.position.set(-3.18,0,s*.7);train.add(d);box(.09,2.7,1.38,bodyMat,0,2.35,0,d);box(.12,1,.87,glass,-.01,3,0,d);box(.12,.07,.34,brass,-.01,1.8,s*-.35,d);doors.push({mesh:d,side:s});}
 const boardRing=new T.Mesh(new T.TorusGeometry(1.4,.045,6,48),glow);boardRing.rotation.x=-Math.PI/2;boardRing.position.set(17.4,.05,20);root.add(boardRing);boardRing.visible=false;
 const codeCanvas=document.createElement('canvas');codeCanvas.width=256;codeCanvas.height=512;const cc=codeCanvas.getContext('2d');cc.fillStyle='#00180a';cc.fillRect(0,0,256,512);cc.fillStyle='#96ff9a';cc.font='18px monospace';for(let x=8;x<256;x+=23)for(let y=20;y<512;y+=25)cc.fillText('アイウエオ01'[(x+y)%7],x,y);const codeTex=new T.CanvasTexture(codeCanvas);codeTex.wrapS=codeTex.wrapT=T.RepeatWrapping;const codeMat=new T.MeshBasicMaterial({map:codeTex,transparent:true,opacity:0,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide});for(const x of [-30.9,30.9]){const m=new T.Mesh(new T.PlaneGeometry(78,7),codeMat);m.position.set(x,4,0);m.rotation.y=Math.PI/2;root.add(m);}
 // Batch static boxes per parent and material; moving train and doors retain their local transforms.
 const parents=[];root.traverse(o=>{if(o.isGroup)parents.push(o);});for(const parent of parents){const batches=new Map();for(const child of [...parent.children])if(child.isMesh&&child.geometry===geometry){const list=batches.get(child.material)||[];list.push(child);batches.set(child.material,list);}for(const [m,list] of batches){if(list.length<3)continue;const batch=new T.InstancedMesh(geometry,m,list.length);for(let i=0;i<list.length;i++){list[i].updateMatrix();batch.setMatrixAt(i,list[i].matrix);parent.remove(list[i]);}batch.castShadow=true;batch.receiveShadow=true;parent.add(batch);}}
 let t=0,doorOpen=0,departureState='';
 function updateDeparture(phase,wait){const label=phase==='defend'?'ARRIVING  0:'+Math.ceil(wait).toString().padStart(2,'0'):phase==='board'?'BOARD NOW':phase==='complete'?'DEPARTURE CLEARED':phase==='call'?'CALL REQUIRED':'NO SERVICE';if(label===departureState)return;departureState=label;const canvas=departure.material.map.image,a=canvas.getContext('2d');a.fillStyle='#081913';a.fillRect(0,0,1024,256);a.fillStyle='#c6ffc0';a.fillRect(20,26,7,204);a.font='bold 75px Arial';a.fillText(label,58,114);a.font='30px Consolas,monospace';a.fillText(phase==='board'?'01  /  HOLD E AT THE GREEN BOARD BEACON':'01  /  MARA CENTRAL TO ZION',62,190);departure.material.map.needsUpdate=true;}

 function reset(){t=0;doorOpen=0;train.position.z=-138;coreMesh.visible=true;shield.visible=true;boardRing.visible=false;for(const b of breakers){b.done=false;b.hp=120;b.orb.visible=b.beam.visible=b.ring.visible=true;b.ring.material=glow;}for(const d of doors)d.mesh.position.z=d.side*.7;}
 function animate(dt,phase,wait,slow){updateDeparture(phase,wait);t+=dt;coreMesh.rotation.y=t*.7;coreMesh.position.y=1.85+Math.sin(t*2)*.09;shield.rotation.y=t*.3;shield.material.opacity=.12+Math.sin(t*3)*.035;shield.visible=phase==='breakers';coreMesh.visible=phase==='breakers'||phase==='core';for(const b of breakers){b.orb.rotation.y=t;b.ring.rotation.y=t*.55;b.orb.visible=b.beam.visible=!b.done;}const approaching=phase==='defend'||phase==='board'||phase==='complete';if(approaching){const progress=phase==='defend'?Math.max(0,Math.min(1,(10-wait)/10)):1;const eased=1-Math.pow(1-progress,3);train.position.z=-138+158*eased;}boardRing.visible=phase==='board';if(boardRing.visible)boardRing.material=glow;doorOpen+=( (phase==='board'||phase==='complete'?1:0)-doorOpen)*Math.min(1,dt*3);for(const d of doors)d.mesh.position.z=d.side*(.7+1.35*doorOpen);codeMat.opacity=slow?.075:0;codeTex.offset.y=t*.08;for(let i=0;i<lamps.length;i++)lamps[i].intensity=(phase==='defend'?26:29)*(i===4&&Math.sin(t*17)>.97?.3:1);}
 return {root,floor,colliders,breakers,core,coreMesh,shield,console:consoleGroup,train,doors,boardRing,reset,animate,spawnPoints:[[-27,35],[-25,-35],[14,-35],[-2,36],[-28,-2],[14,-8]],start:new T.Vector3(-14,0,32),exitPos:new T.Vector3(17.4,0,20)};
}
return {build};
})();

