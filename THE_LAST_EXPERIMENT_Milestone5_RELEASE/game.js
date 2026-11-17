'use strict';
/* THE LAST EXPERIMENT — vanilla JS top-down open-world RPG */
const T=32,W=60,H=44,Z=1.5,KEY='lastExperimentSavePaid',$=id=>document.getElementById(id);
const cv=$('c'),ctx=cv.getContext('2d');
let VW=0,VH=0;
const resize=()=>{cv.width=VW=innerWidth;cv.height=VH=innerHeight};
addEventListener('resize',resize);resize();

/* ---------- data ---------- */
const SOLID=new Set([1,2,4,5,11,13]);
const WP={sword:{n:'Iron Sword',d:9,cd:.4,rg:54,arc:1.6,c:'#dde',st:6},staff:{n:'Arc Staff',d:6,cd:.55,rg:0,c:'#9cf',st:6},daggers:{n:'Twin Daggers',d:5,cd:.17,rg:36,arc:2.3,c:'#cfd',st:3}};
const PW=[{cd:3},{cd:5},{cd:4}];
const ET={
 slime:{r:10,hp:26,spd:55,dmg:6,xp:9,det:140},
 hollow:{r:9,hp:48,spd:68,dmg:10,xp:16,det:170},
 mutant:{r:10,hp:72,spd:78,dmg:13,xp:26,det:230,shoot:2.4},
 wraith:{r:9,hp:58,spd:75,dmg:12,xp:22,det:500,shoot:2.3},
 bogling:{r:11,hp:42,spd:48,dmg:8,xp:14,det:185},
 warden:{r:20,hp:520,spd:42,dmg:22,xp:400,det:999,boss:1}
};
const ZN={slime:[2,2,17,42],hollow:[22,2,38,42],mutant:[41,17,58,42],bogling:[2,46,57,65]};
const MY0=44,MH=24; // Whispering Marsh: map rows MY0..MY0+MH-1 (appended south of the old 44-row world)
const MARSH_DECOR=[];
const VILLAGE_DECOR=[
 {x:22.2,y:18.8,kind:'fence',phase:.4},{x:22.7,y:20.4,kind:'barrel',phase:1.1},
 {x:32.7,y:17.2,kind:'weeds',phase:2.2},{x:33.2,y:20.1,kind:'crate',phase:.8},
 {x:39.1,y:19.3,kind:'lantern',phase:1.7},{x:39.1,y:24.8,kind:'barrel',phase:2.8},
 {x:22.0,y:26.0,kind:'rubble',phase:.2},{x:21.8,y:28.0,kind:'fence',phase:2.4},
 {x:29.8,y:26.2,kind:'weeds',phase:1.4},{x:32.0,y:27.0,kind:'rubble',phase:2.1},
 {x:39.1,y:28.2,kind:'crate',phase:.6},{x:39.0,y:32.0,kind:'lantern',phase:2.9},
 {x:22.1,y:33.0,kind:'barrel',phase:1.9},{x:29.8,y:33.4,kind:'rubble',phase:.9},
 {x:33.0,y:33.2,kind:'weeds',phase:2.6},{x:38.8,y:34.0,kind:'rubble',phase:1.2},
 // A broken wall and collapsed masonry frame the Last Letter's exact discovery spot.
 {x:31.45,y:34.65,kind:'rubble',phase:.3,scale:1.25},{x:33.55,y:34.7,kind:'rubble',phase:1.1,scale:1.15},
 {x:31.55,y:36.25,kind:'rubble',phase:2.2,scale:1.3},{x:33.45,y:36.3,kind:'rubble',phase:2.8,scale:1.2},
 {x:32.45,y:34.15,kind:'rubble',phase:1.7,scale:1.05}
].map(d=>({...d,x:d.x*T+16,y:d.y*T+16,scale:d.scale||(.9+(d.phase%3)*.07)}));
// Region-specific landmarks. All are visual-only and deliberately placed off key paths.
const REGION_DECOR=[
 // Greenhaven: welcoming forest edge, riverbank and cave approach.
 {x:3.0,y:16.8,k:'flower',p:.2},{x:10.5,y:17.8,k:'flower',p:1.4},{x:14.8,y:27.0,k:'stone',p:.8},
 {x:10.8,y:29.0,k:'stump',p:2.1},{x:8.5,y:38.0,k:'sign',p:.4},{x:11.5,y:38.5,k:'camp',p:1.1},
 {x:15.5,y:8.0,k:'stone',p:2.6},{x:3.2,y:27.5,k:'flower',p:1.8},
 // Corrupted Zone: strange growths, wreckage and failed experiment traces.
 {x:42.5,y:25.5,k:'crystal',p:.4},{x:56.0,y:27.0,k:'crystal',p:1.7},{x:42.5,y:35.5,k:'tendril',p:2.2},
 {x:56.0,y:37.0,k:'wreck',p:.9},{x:47.0,y:39.0,k:'bones',p:1.3},{x:55.0,y:19.0,k:'tendril',p:2.8},
 // Forgotten Village house surrounds: collapsed beams and roof fragments, not over doors.
 {x:23.2,y:14.0,k:'beam',p:.3},{x:29.8,y:17.8,k:'beam',p:1.2},{x:33.2,y:27.0,k:'beam',p:2.1},
 {x:38.8,y:29.8,k:'beam',p:.7},{x:23.0,y:30.8,k:'beam',p:1.8},{x:28.8,y:31.8,k:'beam',p:2.7}
].map(d=>({...d,x:d.x*T+16,y:d.y*T+16}));
const EXPLORATION_SECRETS=[
 // Discoveries are placed on existing walkable ground, away from primary quest objects.
 {id:'greenhaven_cache',x:14.5,y:34.5,title:'Surveyor’s Cache',hint:'A faint glimmer catches your eye',lore:'A weathered field note reads: “The forest was planted in measured rows. Someone wanted it to look natural. Three stones mark the survey route: river, stump, cave. Touch them in that order.”',item:{n:'Surveyor’s Charm',t:'gear',atk:1,def:2},xp:35},
 {id:'village_letter',x:32.5,y:35.5,title:'The Last Letter',hint:'Something is buried beneath the rubble',lore:'“If you find this, do not let them take the children below the white walls. They told us it was a shelter.”',item:{n:'Potion',t:'potion'},xp:45},
 {id:'subject_memory',x:43.5,y:32.5,title:'Subject’s Memory',hint:'A strange pulse comes from the ground',lore:'A fragment of memory flashes before you: a numbered door, a voice counting down, and someone whispering “zero”.',item:{n:'Echo Band',t:'gear',atk:3,def:1},xp:60},
 {id:'marsh_log',x:35.5,y:60.5,title:'Flooded Observation Log',hint:'A sealed case glints between the marsh roots',lore:'The waterlogged log reads: “Observation cycle 7731. Subject 0 continues to dream of places that have not been built. The marsh is not natural. It is a memory environment.”',item:{n:'Marshglass Pendant',t:'gear',atk:1,def:3},xp:75}
].map(d=>({...d,x:d.x*T+16,y:d.y*T+16}));
const GREENHAVEN_RUNE_STONES=[
 {id:'river',name:'River Stone',x:17.5,y:18.5,order:0},
 {id:'stump',name:'Fallen Stump Stone',x:11.5,y:29.5,order:1},
 {id:'cave',name:'Cave Mouth Stone',x:6.5,y:38.5,order:2}
].map(d=>({...d,x:d.x*T+16,y:d.y*T+16}));
const LAB_DECOR=[
 {x:47.5,y:8.5,k:'pod',p:.2},{x:55,y:8.5,k:'pod',p:1.2},{x:47.5,y:13.5,k:'console',p:2.1},
 {x:55,y:13.5,k:'table',p:.7},{x:51.5,y:10.5,k:'cable',p:1.8}
].map(d=>({...d,x:d.x*T+16,y:d.y*T+16}));
// Milestone 3: post-Warden story chapter markers. They activate in quest order.
const STORY_MARKERS=[
 {k:'signal',x:14.5,y:38.5,name:'Root Signal',hint:'A faint signal pulses beneath the old roots',color:'#a7f08a'},
 {k:'marsh_echo',x:43.5,y:59.5,name:'Memory Echo',hint:'A voice flickers beneath the marsh mist',color:'#8fe9d7'},
 {k:'observer',x:54.5,y:14.5,name:'Observer Trace',hint:'The laboratory console is receiving a signal',color:'#d68bff'}
].map(d=>({...d,x:d.x*T+16,y:d.y*T+16}));
const GEAR=[['Rusted Charm',2,0],['Scout Vest',0,2],['Lab Gloves',3,1],['Glow Pendant',1,3]];
const NPCS=[
 {n:'Elder Mira',x:6*T+16,y:20*T+16,c:'#4fa87a',h:'#ddd',idle:['The river hides secrets. I dream of white walls.','The Gloops grow bolder each day.','Be careful out east. The land is sick there.']},
 {n:'Keeper Tobb',x:29*T+16,y:20*T+16,c:'#a8844f',h:'#876',idle:['Do not trust the sky, wanderer.','That shard... it showed me things.','The lab. Always the lab.']},
 {n:'The Echo',x:44*T+16,y:21*T+16,c:'#8fc4ff',h:'#fff',idle:['I remember a war that never happened.','They were people once.','The terminal holds the truth.']}
];
const Q=[
 {t:'Awakening',o:'Slay 3 Gloops in Greenhaven',k:'slime',n:3,giver:0,xp:40,
  s:['You are awake. Good. The forest remembers you, even if you do not remember it.','Gloops have flooded the riverbank. Thin them out for me.'],
  e:['Thank you. Take this staff. It was left here by someone I cannot recall.','Odd. I remember a long winter. But there has never been a winter here.']},
 {t:'The Forgotten Village',o:'Find the glowing shard in the village ruins',k:'shard',n:1,giver:1,xp:70,
  s:['Another soul. I am Tobb. I kept this village for years... or I believe I did.','A shard of glass fell from the sky into the old house. It hums. Bring it to me.'],
  e:['It shows rooms. White rooms. Children in rows, numbered.','We were not born, wanderer. We were made. The laboratory lies east, past the Corrupted Zone.']},
 {t:'Failed Subjects',o:'Defeat 5 mutants in the Corrupted Zone',k:'mutant',n:5,giver:2,xp:120,
  s:['...I remember you. You were Subject 0. You walked out of there once.','The things out here were people. Failed designs. End their suffering.'],
  e:['They were my friends. Take these daggers. The Warden dropped them long ago.','Read the terminal in the laboratory. It holds the truth.']},
 {t:'The Abandoned Laboratory',o:'Read the terminal inside the laboratory',k:'terminal',n:1,giver:-1,xp:150},
 {t:'The Warden',o:'Defeat the Warden',k:'boss',n:1,giver:-1,xp:400},
 {t:'A Signal Beneath the Roots',o:'Investigate the signal near the Greenhaven cave',k:'signal',n:1,giver:-1,xp:100},
 {t:'The Marsh Remembers',o:'Recover the memory echo in the Whispering Marsh',k:'marsh_echo',n:1,giver:-1,xp:140},
 {t:'The Observer’s Mark',o:'Trace the signal inside the Abandoned Laboratory',k:'observer',n:1,giver:-1,xp:200}
];

/* ---------- world generation ---------- */
let seed=11;
const rnd=()=>{seed=(seed+0x6D2B79F5)|0;let t=Math.imul(seed^seed>>>15,1|seed);t=(t+Math.imul(t^t>>>7,61|t))^t;return((t^t>>>14)>>>0)/4294967296};
const base=x=>x>=40?8:0;
function buildWorld(){
 const t=[];
 for(let y=0;y<H;y++){t.push([]);for(let x=0;x<W;x++){const e=x==0||y==0||x==W-1||y==H-1,r=rnd();t[y].push(e?1:r<.12?1:r<.16?4:base(x))}}
 const set=(x,y,v)=>{if(t[y]&&t[y][x]!==undefined)t[y][x]=v};
 const rect=(a,b,c,d,v)=>{for(let y=b;y<=d;y++)for(let x=a;x<=c;x++)set(x,y,v)};
 for(let y=1;y<H-1;y++){const rx=19+Math.round(Math.sin(y*.35));set(rx,y,2);set(rx+1,y,2)}   // river
 for(let y=5;y<=15;y++)for(let x=2;x<=13;x++)if((x-7.5)**2+(y-10)**2<14)set(x,y,2);          // lake
 [[6,20],[29,20],[44,21]].forEach(([x,y])=>{for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++)set(x+i,y+j,base(x+i))});
 rect(1,22,56,23,3);rect(30,12,31,21,3);rect(51,16,52,23,3);                                  // paths + bridge
 const house=(a,b,c,d,dx,ruin)=>{rect(a,b,c,d,5);rect(a+1,b+1,c-1,d-1,6);set(dx,d,6);rect(dx,d+1,dx,d+2,3);
  if(ruin)for(let i=0;i<5;i++){const x=a+(rnd()*(c-a+1)|0),y=b+(rnd()*(d-b+1)|0);if(y!=d)set(x,y,6)}};
 house(24,13,29,18,26,true);house(34,26,38,30,36,true);house(24,27,28,31,26,false);
 rect(3,31,8,36,4);rect(4,32,7,35,9);set(5,36,9);set(6,36,9);rect(5,37,6,38,0);               // cave
 rect(45,5,57,16,5);rect(46,6,56,15,7);rect(51,16,52,16,7);                                   // laboratory
 [[48,9],[54,9],[48,13],[54,13]].forEach(([x,y])=>set(x,y,5));
 // A cursed pond becomes the Corrupted Zone's central landmark. Keep the southern approach open.
 for(let y=28;y<=35;y++)for(let x=46;x<=55;x++){const d=((x-50.5)/4.15)**2+((y-31.5)/3.0)**2;if(d<.43)set(x,y,13);else if(d<1.18)set(x,y,14)}
 rect(30,24,31,43,3);buildMarsh(t);                                                            // south road -> Whispering Marsh
 return{t,w:W,h:t.length};
}
/* Whispering Marsh terrain. Uses its own RNG-free layout so the old world (seeded rnd) is unchanged.
   Tiles: 10 marsh ground, 11 murky water (solid), 12 shallows (walkable), 1 tree border, 3 path */
function buildMarsh(t){
 for(let y=0;y<MH;y++){const row=[];for(let x=0;x<W;x++)row.push(x==0||x==W-1||y==MH-1?1:10);t.push(row)}
 const set=(x,y,v)=>{const r=t[y];if(r&&r[x]!==undefined)r[x]=v};
 // murky pools [cx,cy,rx,ry]: solid core (11) with a walkable shallow ring (12)
 [[11,52,6,3],[47,51,7,3],[21,60,7,3],[42,62,6,3],[54,57,3,2],[8,63,4,2]].forEach(([cx,cy,rx,ry])=>{
  for(let y=cy-ry-2;y<=cy+ry+2;y++)for(let x=cx-rx-2;x<=cx+rx+2;x++){
   const d=((x-cx)/rx)**2+((y-cy)/ry)**2;if(x<2||x>W-3||y<MY0+2||y>MY0+MH-3)continue;
   if(d<1)set(x,y,11);else if(d<1.7&&t[y][x]==10)set(x,y,12)}});
 // Hidden observation chamber inside the eastern pool. A single eastern doorway
 // connects it to the shallow bank; the surrounding pool remains solid.
 for(let y=50;y<=54;y++)for(let x=47;x<=51;x++)set(x,y,4);
 for(let y=51;y<=53;y++)for(let x=48;x<=50;x++)set(x,y,10);
 set(51,52,10);set(52,52,12);set(53,52,12);set(54,52,12);
 rect2(t,30,44,31,50,3);                       // road continues into the marsh
 rect2(t,24,50,37,51,12);                      // a shallow ford across the middle, always walkable
 // Step 4: deterministic decoration. A private RNG keeps the original world seed untouched.
 MARSH_DECOR.length=0;let ds=0x51a7c0de;
 const mr=()=>{ds=(Math.imul(ds,1664525)+1013904223)>>>0;return ds/4294967296};
 const clearForRoad=(x,y)=>((x>=28&&x<=33&&y<=51)||(y>=49&&y<=52&&x>=22&&x<=39)||(x>=46&&x<=54&&y>=49&&y<=55));
 // Solid trees and rocks are sparse in the interior and denser toward the edges.
 let placed=0,tries=0;
 while(placed<34&&tries++<1200){const x=2+(mr()*56|0),y=46+(mr()*19|0);if(t[y][x]!==10||clearForRoad(x,y))continue;
  const edge=Math.min(x-1,58-x,y-44,67-y),chance=edge<5?.72:.23;if(mr()>chance)continue;
  // Keep obstacles separated so the marsh remains easy to navigate.
  let near=false;for(let yy=y-1;yy<=y+1;yy++)for(let xx=x-1;xx<=x+1;xx++)if(t[yy]&&(t[yy][xx]===1||t[yy][xx]===4))near=true;
  if(near)continue;t[y][x]=mr()<.72?1:4;placed++;
 }
 // Non-solid reeds, mushrooms, roots and lily clusters add detail without blocking movement.
 const kinds=['reed','mushroom','root','lily','flower'];
 for(let i=0;i<76;i++){const x=2+mr()*56,y=46+mr()*20,tx=x|0,ty=y|0;
  if(t[ty][tx]===10||t[ty][tx]===12){if(clearForRoad(tx,ty))continue;
   const kind=t[ty][tx]===12?'lily':kinds[(mr()*4|0)];MARSH_DECOR.push({x:x*T+16,y:y*T+16,kind,phase:mr()*6.28,scale:.65+mr()*.65});}}
}
function rect2(t,a,b,c,d,v){for(let y=b;y<=d;y++)for(let x=a;x<=c;x++)if(t[y]&&t[y][x]!==undefined)t[y][x]=v}
function buildAbyss(){
 const w=26,h=18,t=[];
 for(let y=0;y<h;y++){t.push([]);for(let x=0;x<w;x++){const e=x==0||y==0||x==w-1||y==h-1;t[y].push(e||(rnd()<.05&&Math.abs(x-13)+Math.abs(y-9)>4)?4:9)}}
 return{t,w,h};
}
const WORLD=buildWorld(),ABYSS=buildAbyss();

/* ---------- state ---------- */
let M=WORLD,E=[],loot=[],bullets=[],fx=[],floats=[],P=null,state='menu',inAbyss=false,worldBak=null,portal=null;
let cam={x:0,y:0},mx=0,my=0,shake=0,time=0,spawnT=0,saveT=0,zoneName='',hintText='',dlg=null;
const keys={},mouse={x:0,y:0,down:false},joy={x:0,y:0,active:false,tid:null};let touchAttack=false;
const need=l=>15+l*l*4;
function activeStyle(kind){if(!P)return null;const id=kind==='class'?P.activeClass:P.activeCharacter;const list=kind==='class'?SUMMON_CLASSES:SUMMON_CHARACTERS;return list.find(x=>x.id===id)||null}
function styleBonuses(){const c=activeStyle('class'),a=activeStyle('character');const cs=c?c.stats:{health:100,attack:12,defence:6},as=a?a.stats:{health:100,attack:11,defence:6};return {health:Math.round((cs.health-100)*.12+(as.health-100)*.10),attack:Math.round((cs.attack-12)*.24+(as.attack-11)*.18),defence:Math.round((cs.defence-6)*.25+(as.defence-6)*.2)}}
const atkP=()=>WP[P.w].d+P.lvl*2+(P.gear?P.gear.atk:0)+styleBonuses().attack;
const defP=()=>P.lvl*.6+(P.gear?P.gear.def:0)+styleBonuses().defence;
const inLab=p=>p.x/T>45&&p.x/T<57&&p.y/T>5&&p.y/T<17.2;
const recalc=()=>{P.mhp=Math.max(1,90+P.lvl*10+styleBonuses().health);P.mst=100+P.lvl*3;if(P.hp>P.mhp)P.hp=P.mhp};
const mkP=()=>({x:5.5*T,y:22.5*T,r:8,hp:100,mhp:100,st:100,mst:100,lvl:1,xp:0,dir:0,atk:0,dash:0,dx:0,dy:0,inv:0,stD:0,w:'sword',weps:['sword'],gear:null,
 items:[{n:'Potion',t:'potion'},{n:'Potion',t:'potion'}],q:0,qs:0,qp:0,shard:false,chest:false,boss:false,secrets:[],runes:[],runeSolved:false,pc:[0,0,0],walk:0,profileId:'profile-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2),collection:{classes:{},characters:{}},activeClass:'',activeCharacter:'',shards:100,adminOwned:false,adminTitle:''});

/* ---------- helpers ---------- */
const isSolid=(x,y)=>{const tx=x/T|0,ty=y/T|0;if(x<0||y<0||tx>=M.w||ty>=M.h)return true;return SOLID.has(M.t[ty][tx])};
const segDist=(px,py,x1,y1,x2,y2)=>{const dx=x2-x1,dy=y2-y1,l=dx*dx+dy*dy;if(!l)return Math.hypot(px-x1,py-y1);const t=Math.max(0,Math.min(1,((px-x1)*dx+(py-y1)*dy)/l));return Math.hypot(px-(x1+t*dx),py-(y1+t*dy))};
function move(e,dx,dy){const r=e.r,hit=(x,y)=>isSolid(x-r,y-r)||isSolid(x+r,y-r)||isSolid(x-r,y+r)||isSolid(x+r,y+r);
 if(!hit(e.x+dx,e.y))e.x+=dx;if(!hit(e.x,e.y+dy))e.y+=dy}
let tt;function toast(s){const t=$('toast');t.textContent=s;t.classList.add('show');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('show'),3200)}
const float=(x,y,s,c,crit=false,plr=false)=>floats.push({x,y,s,c,crit,plr,t:.9});
function randSpot(x0,y0,x1,y1){for(let i=0;i<60;i++){const x=(x0+Math.random()*(x1-x0))*T,y=(y0+Math.random()*(y1-y0))*T;
 if(!isSolid(x,y)&&!isSolid(x+12,y+12)&&!isSolid(x-12,y-12)&&Math.hypot(x-P.x,y-P.y)>260)return{x,y}}return null}
function mk(type,x,y){const d=ET[type];return{type,x,y,r:d.r,hp:d.hp,mhp:d.hp,spd:d.spd,dmg:d.dmg,xp:d.xp,det:d.det,boss:d.boss,cd:1,hit:0,wind:0,kb:0,kx:0,ky:0,agro:false,wa:-1,wt:0,sh:1.5,pat:0,mode:'',walk:Math.random()*6}}

/* ---------- story & quests ---------- */
function say(name,lines,cb){dlg={n:name,l:lines,i:0,cb};state='dlg';showD()}
function showD(){$('dlg').classList.remove('hidden');$('dn').textContent=dlg.n;$('dt').textContent=dlg.l[dlg.i]}
function nextD(){if(!dlg)return;dlg.i++;if(dlg.i<dlg.l.length)return showD();const cb=dlg.cb;dlg=null;$('dlg').classList.add('hidden');state='play';if(cb)cb()}
function progress(k,n=1){const q=Q[P.q];if(!q||P.qs!==1||q.k!==k)return;P.qp+=n;
 if(P.qp>=q.n){P.qp=q.n;if(q.giver>=0){P.qs=2;toast('Objective complete — return to '+NPCS[q.giver].n)}else finish()}}
function finish(){const q=Q[P.q];gain(q.xp);toast('Quest complete: '+q.t);P.q++;P.qs=0;P.qp=0;const nq=Q[P.q];
 if(nq&&nq.giver<0){P.qs=1;setTimeout(()=>toast('New quest: '+nq.t),1900);if(nq.k=='boss'&&P.boss)progress('boss')}
 if(!nq){if(q.k==='observer')say('The Observer’s Mark',['The transmission cuts out. Somewhere beyond the world, something answers with your own voice.','A final line appears: “Cycle 7732 ready.”','The experiment is not over. Now you know who has been holding the controls.']);else say('Terminal',['RESET CANCELLED. EXPERIMENT 7731 CONTINUES.','Observer reassigned: Subject 0.','The world is yours now. Keep growing stronger — the Corrupted Zone still has secrets.'])}
 save()}
function giveW(w){if(!P.weps.includes(w)){P.weps.push(w);P.w=w;toast('Weapon acquired: '+WP[w].n)}}
function talk(i){const n=NPCS[i],q=Q[P.q];
 if(q&&q.giver===i){
  if(P.qs==0)say(n.n,q.s,()=>{P.qs=1;toast('New quest: '+q.t)});
  else if(P.qs==1)say(n.n,['Not yet. '+q.o+'.']);
  else say(n.n,q.e,()=>{if(P.q==0)giveW('staff');if(P.q==2)giveW('daggers');finish()});
 }else say(n.n,[n.idle[Math.min(P.q,2)]])}
function secretFound(id){return (P.secrets||[]).includes(id)}
function nearInt(){if(inAbyss)return null;const L=NPCS.map((n,i)=>({k:'n',i,x:n.x,y:n.y,t:'Talk to '+n.n}));
 for(const d of EXPLORATION_SECRETS)if(!secretFound(d.id))L.push({k:'secret',d,x:d.x,y:d.y,t:d.hint});
 if(!P.runeSolved)for(const d of GREENHAVEN_RUNE_STONES)L.push({k:'rune',d,x:d.x,y:d.y,t:'Inspect the '+d.name});
 if(!secretFound('marsh_chamber'))L.push({k:'chamber',x:49.5*T,y:52.5*T,t:'Examine the sealed observation console'});
 if(!P.shard)L.push({k:'shard',x:26.5*T,y:15.5*T,t:'Inspect the glowing shard'});
 if(!P.chest)L.push({k:'chest',x:5.5*T,y:33.5*T,t:'Open the chest'});
 const activeQ=Q[P.q];if(activeQ&&P.qs===1){const marker=STORY_MARKERS.find(d=>d.k===activeQ.k);if(marker)L.push({k:'story',d:marker,x:marker.x,y:marker.y,t:marker.hint})}
 L.push({k:'term',x:51.5*T,y:7.5*T,t:'Read the terminal'});
 let b=null,bd=46;for(const o of L){const d=Math.hypot(o.x-P.x,o.y-P.y);if(d<bd){bd=d;b=o}}return b}
function interact(){const o=nearInt();if(!o)return;
 if(o.k=='n')talk(o.i);
 else if(o.k=='secret'){const d=o.d;if(d.item&&!pick({...d.item})){toast('Inventory full. Make room before collecting this discovery.');return;}if(!P.secrets)P.secrets=[];P.secrets.push(d.id);gain(d.xp);say(d.title,[d.lore,'You gained '+d.xp+' experience'+(d.item?' and found '+d.item.n+'.':'.')]);save()}
 else if(o.k=='chamber'){const reward={n:'Observer’s Key',t:'gear',atk:2,def:3};if(!pick(reward)){toast('Inventory full. Make room before opening the console.');return;}if(!P.secrets)P.secrets=[];P.secrets.push('marsh_chamber');gain(90);say('Submerged Observation Chamber',['The console wakes as you approach. Its display identifies this room as an observation station for Experiment 7731.','A final entry reads: “Subject 0 was not the first to escape. Subject 0 was the first to return.”','You gained 90 experience and found the Observer’s Key.']);save()}
 else if(o.k=='rune'){if(!P.runes)P.runes=[];const expected=GREENHAVEN_RUNE_STONES[P.runes.length];if(o.d.order===P.runes.length){P.runes.push(o.d.id);if(P.runes.length===GREENHAVEN_RUNE_STONES.length){const reward={n:'Surveyor’s Lens',t:'gear',atk:2,def:2};if(!pick(reward)){P.runes.pop();toast('Inventory full. Make room before completing the mechanism.');return;}P.runeSolved=true;gain(100);say('The Surveyor’s Mechanism',['Three tones ring through the forest. A hidden compartment opens beneath the stonework.','Inside is the Surveyor’s Lens. The inscription reads: “The world was measured before it was made.”','You gained 100 experience and found the Surveyor’s Lens.']);save();}else{toast(o.d.name+' resonates. '+(GREENHAVEN_RUNE_STONES[P.runes.length].name+' remains.'));save()}}else{P.runes=[];toast('The stones fall silent. The sequence has reset. Follow the surveyor’s clue: river, stump, cave.');save()}}
 else if(o.k=='story'){
  const k=o.d.k;
  if(k==='signal'){const reward={n:'Rootsignal Charm',t:'gear',atk:2,def:2};if(!pick(reward)){toast('Inventory full. Make room before collecting the signal reward.');return;}say('A Signal Beneath the Roots',['The roots part around a small device embedded in the soil. It carries the same pulse as the laboratory terminal.','A recording plays in a familiar voice: “If you can hear this, the reset failed again. Do not trust the one who watches from outside.”','You gained 100 experience and found the Rootsignal Charm.'],()=>{progress('signal');save()})}
  else if(k==='marsh_echo'){const reward={n:'Memoryglass',t:'gear',atk:1,def:3};if(!pick(reward)){toast('Inventory full. Make room before collecting the memory reward.');return;}say('The Marsh Remembers',['The mist gathers into a scene: a figure standing beyond the observation glass, watching the first subjects awaken.','The voice is yours, but older. “I left the door open. I thought they would stop the experiment.”','You gained 140 experience and found Memoryglass.'],()=>{progress('marsh_echo');save()})}
  else{const reward={n:'Observer’s Mark',t:'gear',atk:3,def:2};if(!pick(reward)){toast('Inventory full. Make room before collecting the final reward.');return;}say('The Observer’s Mark',['The console unlocks a hidden transmission. The observer’s voiceprint matches Subject 0.','Timestamp: nineteen years from the current cycle. The message ends with one sentence: “You are not the experiment. You are the one who keeps restarting it.”','You gained 200 experience and found the Observer’s Mark.'],()=>{progress('observer');save()})}
 }
 else if(o.k=='shard'){if(P.q==1&&P.qs==1){P.shard=true;say('',['You lift the shard. It whispers a number: 7731... 7731...'],()=>progress('shard'))}else say('',['A shard glints in the rubble. It feels important, but you do not know why yet.'])}
 else if(o.k=='chest'){P.chest=true;for(let i=0;i<3;i++)pick({n:'Potion',t:'potion'});pick({n:'Wayfarer Vest',t:'gear',atk:0,def:3});toast('The chest held potions and a vest.')}
 else say('Terminal',['EXPERIMENT 7731 — "HUMANITY". Phase 1: grow subjects in a forest. Phase 2: observe.','Phase 2 failed. Subjects began to remember lives they never lived. The corruption spread from this laboratory.','Subject 0 escaped, was returned to Greenhaven, memory wiped. The Warden guards the RESET switch.'],()=>progress('terminal'))}

/* ---------- progression & items ---------- */
function gain(n){const p=P;if(p.lvl>=20)return;p.xp+=n;
 while(p.lvl<20&&p.xp>=need(p.lvl)){p.xp-=need(p.lvl);p.lvl++;recalc();p.hp=p.mhp;p.st=p.mst;toast('LEVEL UP! You are level '+p.lvl);fx.push({k:'boom',x:p.x,y:p.y,t:.5,m:.5,c:'#ffe58a'})}
 if(p.lvl>=20)p.xp=0}
function pick(it){if(P.items.length>=24){toast('Inventory full');return false}P.items.push(it);return true}
function useItem(i){const it=P.items[i];if(!it)return;
 if(it.t=='potion'){if(P.hp>=P.mhp)return toast('Already at full health');P.items.splice(i,1);const h=45+P.lvl*2;P.hp=Math.min(P.mhp,P.hp+h);float(P.x,P.y-24,'+'+h,'#7f7')}
 else if(it.t=='gear'){P.items.splice(i,1);if(P.gear)P.items.push(P.gear);P.gear=it}}
function usePotion(){const i=P.items.findIndex(t=>t.t=='potion');if(i<0)toast('No potions');else useItem(i)}
function cycleW(){const i=P.weps.indexOf(P.w);P.w=P.weps[(i+1)%P.weps.length];toast('Weapon: '+WP[P.w].n)}
function renderInv(){const p=P;let h=`<h2>Inventory</h2><p>Level ${p.lvl} · Attack ${Math.round(atkP())} · Defence ${defP().toFixed(1)} · Health ${p.mhp}</p><h3>Weapons</h3><div class="row">`;
 p.weps.forEach(w=>h+=`<button class="${p.w==w?'on':''}" data-w="${w}">${WP[w].n}</button>`);
 h+=`</div><h3>Equipped gear: ${p.gear?`${p.gear.n} (+${p.gear.atk} atk, +${p.gear.def} def)`:'none'}</h3><h3>Items</h3><div class="row">`;
 p.items.forEach((it,i)=>h+=`<button data-i="${i}">${it.n}${it.t=='gear'?` +${it.atk}/+${it.def}`:''}</button>`);
 $('inv').innerHTML=h+'</div><p style="margin-top:14px;font-size:12px;opacity:.6">Click a weapon or gear to equip it, a potion to drink it. I closes.</p>'}
$('inv').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.w)P.w=b.dataset.w;else if(b.dataset.i!==undefined)useItem(+b.dataset.i);renderInv()});
function toggleInv(on){state=on?'inv':'play';$('inv').classList.toggle('hidden',!on);if(on)renderInv()}

/* ---------- summoning system ---------- */
window.SUMMON_TEST_MODE=false;
 const ADMIN_CLAIM_KEY='lastExperimentAdminClaimPaid';
 const RARITY_STYLE={
  Common:{color:'#b8b8bd',weight:58,icon:'◇'},Rare:{color:'#76aeea',weight:25,icon:'✧'},Epic:{color:'#bd8aef',weight:11,icon:'✦'},Legendary:{color:'#e4b75f',weight:4.5,icon:'✺'},Mythic:{color:'#e78cba',weight:1.5,icon:'❖'},ADMIN:{color:'#f4f2ff',weight:.05,icon:'✹'}
 };
 const SUMMON_CLASSES=[
  {id:'vanguard',name:'Vanguard',rarity:'Common',mark:'⚔',desc:'A steadfast frontline discipline built to endure.',stats:{health:120,attack:12,defence:8},ability:'Iron Resolve — briefly reduces incoming damage.'},
  {id:'ranger',name:'Ranger',rarity:'Rare',mark:'➶',desc:'A mobile hunter who strikes from a measured distance.',stats:{health:95,attack:16,defence:4},ability:'Marked Shot — the next strike deals increased damage.'},
  {id:'arcanist',name:'Arcanist',rarity:'Epic',mark:'✧',desc:'A scholar of unstable energy and controlled destruction.',stats:{health:88,attack:22,defence:3},ability:'Aether Surge — empowers the next spell.'},
  {id:'duskblade',name:'Duskblade',rarity:'Legendary',mark:'☾',desc:'A duelist trained to move between moments of shadow.',stats:{health:108,attack:25,defence:9},ability:'Nightfall — a swift arc of shadow damage.'},
  {id:'chronist',name:'Chronist',rarity:'Mythic',mark:'⌛',desc:'A keeper of broken seconds and unfinished cycles.',stats:{health:145,attack:30,defence:15},ability:'Rewind — restores a portion of vitality.'}
 ];
 const SUMMON_CHARACTERS=[
  {id:'mira_echo',name:'Elder Mira — Echo',rarity:'Common',mark:'♧',desc:'A remembered guardian of Greenhaven, preserved in a quiet echo.',stats:{health:100,attack:11,defence:6},ability:'River’s Grace — steadies the spirit.'},
  {id:'tobb_keeper',name:'Keeper Tobb',rarity:'Common',mark:'⌂',desc:'The village keeper whose memories outlasted the ruins.',stats:{health:110,attack:10,defence:8},ability:'Last Watch — strengthens resolve.'},
  {id:'marsh_wisp',name:'Marsh Wisp',rarity:'Rare',mark:'☼',desc:'A small light that learned to navigate the constructed marsh.',stats:{health:90,attack:17,defence:5},ability:'Mist Veil — obscures the next incoming strike.'},
  {id:'echo_subject',name:'The Echo',rarity:'Rare',mark:'◈',desc:'A fragment of a failed subject that remembers another life.',stats:{health:105,attack:18,defence:7},ability:'Resonance — sends a pulse through nearby foes.'},
  {id:'bogling_warden',name:'Bogling Elder',rarity:'Epic',mark:'♜',desc:'An ancient marsh creature, patient beneath the black water.',stats:{health:150,attack:20,defence:13},ability:'Root Snare — slows nearby threats.'},
  {id:'lab_sentinel',name:'Lab Sentinel',rarity:'Epic',mark:'▣',desc:'A containment construct that outlived its handlers.',stats:{health:165,attack:22,defence:16},ability:'Containment Field — braces against a heavy blow.'},
  {id:'warden_shard',name:'Warden Shard',rarity:'Legendary',mark:'✥',desc:'A splinter of the reset guardian, stripped of its command.',stats:{health:190,attack:31,defence:18},ability:'Reset Pulse — releases a burst of stored force.'},
  {id:'subject_zero',name:'Subject 0 — Remnant',rarity:'Legendary',mark:'◉',desc:'A remnant of the first subject to return to the experiment.',stats:{health:180,attack:34,defence:16},ability:'Cycle Break — converts a moment of danger into power.'},
  {id:'observer_fragment',name:'Observer Fragment',rarity:'Mythic',mark:'✧',desc:'A presence from beyond the glass, caught in the moment before a reset.',stats:{health:260,attack:42,defence:28},ability:'Outside the Cycle — distorts the field around its bearer.'},
  {id:'cycle_7732',name:'Cycle 7732',rarity:'Mythic',mark:'⟡',desc:'A future iteration carrying memories of every failed beginning.',stats:{health:280,attack:46,defence:30},ability:'Final Iteration — unleashes a devastating echo.'},
  {id:'admin_prime',name:'ADMIN — The First Authority',rarity:'ADMIN',mark:'✹',desc:'The singular authority beyond the experiment. Only one may ever be claimed in this local prototype.',stats:{health:9999,attack:999,defence:999},ability:'Absolute Override — overwhelming force, cycle-wide protection and a unique authority aura.'}
 ];
 let summonBanner='character',summonReturnState='menu',summonCurrentView='summon',collectionFilter='character';
 const rarityPool=(kind,rarity)=> (kind==='class'?SUMMON_CLASSES:SUMMON_CHARACTERS).filter(x=>x.rarity===rarity);
 function adminClaim(){try{return JSON.parse(localStorage.getItem(ADMIN_CLAIM_KEY)||'null')}catch(e){return null}}
 function adminIsOwnedByPlayer(){const c=adminClaim();return !!(P&&c&&P.profileId&&c.ownerId===P.profileId)}
 function normalizeSummonSave(){if(!P.collection||typeof P.collection!=='object')P.collection={classes:{},characters:{}};if(!P.collection.classes)P.collection.classes={};if(!P.collection.characters)P.collection.characters={};if(!Array.isArray(P.summonHistory))P.summonHistory=[];if(typeof P.shards!=='number'||!Number.isFinite(P.shards))P.shards=100;if(typeof P.activeClass!=='string')P.activeClass='';if(typeof P.activeCharacter!=='string')P.activeCharacter='';if(!P.profileId)P.profileId='profile-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);P.adminOwned=adminIsOwnedByPlayer();P.adminTitle=P.adminOwned?'The One Beyond':'';if(P.adminOwned)P.collection.characters.admin_prime=Math.max(1,P.collection.characters.admin_prime||0);}
 function openSummon(){if(!P&&state!=='menu')return;summonReturnState=state;summonCurrentView='summon';$('summon-hub').classList.remove('hidden');$('summon-results').classList.add('hidden');$('summon-view').classList.remove('hidden');$('collection-view').classList.add('hidden');state='summon';renderSummonStatus();}
 function closeSummon(){ $('summon-hub').classList.add('hidden');$('summon-results').classList.add('hidden');state=summonReturnState; }
 function renderSummonStatus(){const claim=adminClaim();const mine=adminIsOwnedByPlayer();const cost=window.SUMMON_TEST_MODE?0:50;$('summon-status').textContent=(window.SUMMON_TEST_MODE?'TEST BUILD · Unlimited free summons.':'SHARDS: '+(P?P.shards:0)+' · Single summon: 50 · 10× summon: 500.')+(mine?' ADMIN authority claimed — THE ONE BEYOND.':claim?' ADMIN slot already claimed in this browser by another profile.':' ADMIN remains a single local claim.');const adminBtn=$('summon-admin-test');if(adminBtn){adminBtn.disabled=!window.SUMMON_TEST_MODE||!!claim;adminBtn.textContent=claim?(mine?'ADMIN already owned':'ADMIN slot claimed'):'Attempt exclusive claim';}const one=$('summon-one'),ten=$('summon-ten');one.innerHTML='Single Summon <small>'+(window.SUMMON_TEST_MODE?'FREE':'50 SHARDS')+'</small>';ten.innerHTML='10× Summon <small>'+(window.SUMMON_TEST_MODE?'FREE':'500 SHARDS')+'</small>';one.disabled=!window.SUMMON_TEST_MODE&&(!P||P.shards<50);ten.disabled=!window.SUMMON_TEST_MODE&&(!P||P.shards<500);}
 function switchSummonView(view){summonCurrentView=view;$('summon-view').classList.toggle('hidden',view!=='summon');$('collection-view').classList.toggle('hidden',view!=='collection');$('summon-results').classList.add('hidden');document.querySelectorAll('.summon-tab').forEach(b=>b.classList.toggle('on',b.dataset.view===view));if(view==='collection')renderCollection();}
 function setSummonBanner(kind){summonBanner=kind;document.querySelectorAll('.banner-choice').forEach(b=>b.classList.toggle('on',b.dataset.banner===kind));const panel=$('summon-banner');panel.classList.toggle('class-banner',kind==='class');panel.classList.toggle('character-banner',kind==='character');panel.querySelector('h3').textContent=kind==='class'?'Disciplines of the Forgotten':'Echoes Beyond the Glass';panel.querySelector('p:not(.eyebrow)').textContent=kind==='class'?'Unlock combat archetypes shaped by the experiment.':'Some memories answer when called. Others should remain asleep.';}
 function rollRarity(kind,forced){if(forced){if(forced==='ADMIN')return 'ADMIN';return forced}const entries=Object.entries(RARITY_STYLE).filter(([r])=>r!=='ADMIN'||(kind==='character'&&!adminClaim()&&rarityPool(kind,'ADMIN').length));const total=entries.reduce((n,[,v])=>n+v.weight,0);let roll=Math.random()*total;for(const [r,v] of entries){roll-=v.weight;if(roll<=0)return r}return 'Common'}
 function grantAdmin(){if(!P)return null;normalizeSummonSave();const existing=adminClaim();if(existing){renderSummonStatus();return null}const record={ownerId:P.profileId,characterId:'admin_prime',claimedAt:new Date().toISOString(),ownerName:'Local Player'};try{localStorage.setItem(ADMIN_CLAIM_KEY,JSON.stringify(record));const verify=adminClaim();if(!verify||verify.ownerId!==P.profileId){renderSummonStatus();return null}}catch(e){toast('ADMIN claim could not be stored.');return null}P.adminOwned=true;P.adminTitle='The One Beyond';P.collection.characters.admin_prime=Math.max(1,P.collection.characters.admin_prime||0);P.summonHistory.push({id:'admin_prime',kind:'character',rarity:'ADMIN',isNew:true});save();renderSummonStatus();return{id:'admin_prime',kind:'character',rarity:'ADMIN',isNew:true,adminClaimed:true};}
 function performSummon(count,forced){if(!P){$('summon-status').textContent='Start or continue a game to save your collection.';return}normalizeSummonSave();const price=count*50;if(!window.SUMMON_TEST_MODE){if(P.shards<price){toast('Not enough shards. Defeat enemies to earn more.');renderSummonStatus();return}P.shards-=price;}const results=[];for(let i=0;i<count;i++){let rarity=rollRarity(summonBanner,'');if(rarity==='ADMIN'){const admin=grantAdmin();if(admin){admin.item=SUMMON_CHARACTERS.find(x=>x.id==='admin_prime');results.push(admin);toast('LOCAL ANNOUNCEMENT: ADMIN has been claimed by this player.');continue}rarity='Mythic'}let pool=rarityPool(summonBanner,rarity);if(!pool.length){rarity=rollRarity(summonBanner,'');if(rarity==='ADMIN')rarity='Mythic';pool=rarityPool(summonBanner,rarity)}if(!pool.length){rarity='Common';pool=rarityPool(summonBanner,rarity)}const item=pool[Math.floor(Math.random()*pool.length)];if(!item)continue;const bucket=P.collection[summonBanner==='class'?'classes':'characters'];const isNew=!bucket[item.id];bucket[item.id]=(bucket[item.id]||0)+1;results.push({id:item.id,kind:summonBanner,rarity:item.rarity,isNew,item});P.summonHistory.push({id:item.id,kind:summonBanner,rarity:item.rarity,isNew});}P.summonHistory=P.summonHistory.slice(-100);save();renderSummonStatus();showSummonResults(results,(window.SUMMON_TEST_MODE?'FREE TEST · ':'')+count+' '+(summonBanner==='class'?'class':'character')+' summon'+(count===1?'':'s'));}
 function showSummonResults(results,caption){$('summon-view').classList.add('hidden');$('collection-view').classList.add('hidden');$('summon-results').classList.remove('hidden');$('results-caption').textContent=caption;const grid=$('results-grid');grid.innerHTML='';results.forEach((r,i)=>{const item=r.item||SUMMON_CHARACTERS.find(x=>x.id===r.id);const card=document.createElement('article');card.className='result-card';card.dataset.rarity=r.rarity;card.style.setProperty('--delay',(i*85)+'ms');const name=item?item.name:'Unknown echo';const desc=item?item.desc:'';const style=RARITY_STYLE[r.rarity]||RARITY_STYLE.Common;card.innerHTML='<div class="card-rarity">'+r.rarity.toUpperCase()+'</div><div class="result-icon">'+(item?item.mark:style.icon)+'</div><h4></h4><p></p><div class="new-tag">'+(r.adminClaimed?'EXCLUSIVE CLAIMED':r.isNew?'NEW DISCOVERY':'DUPLICATE · COPY +1')+'</div>';card.querySelector('h4').textContent=name;card.querySelector('p').textContent=desc;grid.appendChild(card)});}
 function equipStyle(kind,id){if(!P)return;const bucket=P.collection[kind==='class'?'classes':'characters'];if(!bucket[id])return;const key=kind==='class'?'activeClass':'activeCharacter';P[key]=P[key]===id?'':id;recalc();P.hp=Math.min(P.mhp,P.hp+Math.max(0,styleBonuses().health));save();renderCollection();toast((P[key]?'Equipped ':'Unequipped ')+(kind==='class'?'class':'character')+' style.');}
 function renderCollection(){if(!P){$('collection-grid').innerHTML='<p class="testing-note">Start or continue a game to build and view a saved collection.</p>';return}normalizeSummonSave();const bucket=P.collection[collectionFilter==='class'?'classes':'characters'];const list=collectionFilter==='class'?SUMMON_CLASSES:SUMMON_CHARACTERS;const grid=$('collection-grid');grid.innerHTML='';list.forEach(item=>{const count=bucket[item.id]||0;const claimedElsewhere=item.id==='admin_prime'&&!!adminClaim()&&!adminIsOwnedByPlayer();const unlocked=count>0&&!claimedElsewhere;const style=RARITY_STYLE[item.rarity]||RARITY_STYLE.Common;const equipped=unlocked&&(collectionFilter==='class'?P.activeClass===item.id:P.activeCharacter===item.id);const card=document.createElement('article');card.className='collection-card'+(unlocked?'':' locked')+(item.id==='admin_prime'&&unlocked?' admin-owned':'');card.style.setProperty('--rarity',style.color);card.style.setProperty('--glow',style.color+'33');card.innerHTML='<span class="card-mark">'+(unlocked?item.mark:'?')+'</span><div class="card-rarity">'+item.rarity.toUpperCase()+'</div><h4></h4><p></p><div class="card-stats"></div><div class="card-count"></div><button class="equip-style" type="button" '+(unlocked?'':'disabled')+'>'+(equipped?'EQUIPPED · UNEQUIP':'EQUIP STYLE')+'</button>';card.querySelector('h4').textContent=unlocked?item.name:(claimedElsewhere?'ADMIN SLOT CLAIMED':'Undiscovered');card.querySelector('p').textContent=unlocked?item.desc:(claimedElsewhere?'This local browser profile has already assigned the exclusive ADMIN character.':'Discover this entry through summoning.');card.querySelector('.card-stats').textContent=unlocked?'HP '+item.stats.health+' · ATK '+item.stats.attack+' · DEF '+item.stats.defence:'';card.querySelector('.card-count').textContent=unlocked?'Copies: '+count+' · '+item.ability:'LOCKED';card.querySelector('.equip-style').addEventListener('click',()=>equipStyle(collectionFilter,item.id));grid.appendChild(card)});const c=activeStyle('class'),a=activeStyle('character'),b=styleBonuses();$('active-style-summary').textContent='Active styles: '+(c?c.name:'No class')+' + '+(a?a.name:'No character')+' · Bonuses: +'+b.health+' HP, +'+b.attack+' ATK, +'+b.defence+' DEF';}

 document.querySelectorAll('.summon-tab').forEach(b=>b.addEventListener('click',()=>switchSummonView(b.dataset.view)));
 document.querySelectorAll('.banner-choice').forEach(b=>b.addEventListener('click',()=>setSummonBanner(b.dataset.banner)));
 document.querySelectorAll('.collection-filter').forEach(b=>b.addEventListener('click',()=>{collectionFilter=b.dataset.filter;document.querySelectorAll('.collection-filter').forEach(x=>x.classList.toggle('on',x===b));renderCollection()}));
 $('summon-open').addEventListener('click',openSummon);$('menu-summon').addEventListener('click',openSummon);$('summon-close').addEventListener('click',closeSummon);$('results-continue').addEventListener('click',()=>{$('summon-results').classList.add('hidden');if(summonCurrentView==='collection'){switchSummonView('collection')}else{$('summon-view').classList.remove('hidden')}});
 $('summon-one').addEventListener('click',()=>performSummon(1,''));$('summon-ten').addEventListener('click',()=>performSummon(10,''));

 /* ---------- combat ---------- */
function hurt(e,d,kx,ky){if(e.dead)return;const crit=Math.random()<.12;d=Math.round(d*(crit?2:1)*(.9+Math.random()*.2));e.hp-=d;e.hit=.15;e.agro=true;
 if(!e.boss){const l=Math.hypot(kx,ky)||1;e.kx=kx/l*170;e.ky=ky/l*170;e.kb=.12}
 float(e.x,e.y-e.r-14,d+(crit?'!':''),crit?'#ffd84a':'#fff',crit);
 fx.push({k:'spark',x:e.x+(Math.random()-.5)*10,y:e.y-e.r/2+(Math.random()-.5)*10,c:crit?'#ffe066':'#fff',t:.16,m:.16});
 if(e.hp<=0)kill(e)}
function kill(e){e.dead=true;gain(e.xp);if(typeof P.shards!=='number')P.shards=100;const shardReward=e.boss?150:(e.xp>=20?12:6);P.shards+=shardReward;toast('+'+shardReward+' shards');const x=e.x,y=e.y,r=Math.random();
 const cols={slime:'#6fd16f',hollow:'#8a9aa8',mutant:'#c05ae0',wraith:'#a294ff',bogling:'#91b96b',warden:'#ff4444'};
 fx.push({k:'burst',x,y,c:cols[e.type]||'#fff',t:.35,m:.35,n:e.boss?28:10});
 if(e.boss){for(let i=0;i<3;i++)loot.push({x:x+i*14-14,y:y+20,it:{n:'Potion',t:'potion'}});loot.push({x,y:y-14,it:{n:'Warden Core',t:'gear',atk:8,def:5}});
  shake=.5;P.boss=true;say('The Warden',['The reset was never mine to stop... Subject 0.'],()=>{if(P.q==4&&P.qs==1)progress('boss')})}
 else{if(r<.4)loot.push({x,y,it:{n:'Potion',t:'potion'}});if(Math.random()<.13){const g=GEAR[Math.random()*GEAR.length|0];loot.push({x:x+8,y,it:{n:g[0],t:'gear',atk:g[1]+(P.lvl>>2),def:g[2]+(P.lvl>>2)}})}
  progress(e.type)}}
function hurtP(d){const p=P;if(p.inv>0||p.dash>0||inAbyssWait)return;d=Math.max(1,Math.round(d-defP()));p.hp-=d;p.inv=.55;shake=.18;float(p.x,p.y-30,d,'#f55',false,true);fx.push({k:'redflash',t:.16,m:.16});if(p.hp<=0)die()}
let inAbyssWait=false;
function shoot(e,a,s,dmg,c){bullets.push({x:e.x,y:e.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,dmg,life:2.6,r:6,c,own:0})}
function attack(){const p=P,w=WP[p.w]||WP.sword,stCost=w.st||6;if(p.atk>0||p.dash>0||p.st<stCost)return;p.atk=w.cd;p.st-=stCost;p.stD=.6;const a=p.dir;
 if(w.rg){fx.push({k:'slash',x:p.x,y:p.y,a,rg:w.rg,arc:w.arc,t:.14,m:.14,c:w.c});
  for(const e of E){const dx=e.x-p.x,dy=e.y-p.y;if(!e.dead&&Math.hypot(dx,dy)<w.rg+e.r&&Math.cos(Math.atan2(dy,dx)-a)>Math.cos(w.arc/2))hurt(e,atkP(),dx,dy)}}
 else bullets.push({x:p.x,y:p.y,vx:Math.cos(a)*380,vy:Math.sin(a)*380,dmg:atkP()*1.1,life:.9,r:5,c:'#9cf',own:1,magic:1})}
function dodge(){const p=P;if(p.dash>0||p.st<25)return;let ix=(keys.d?1:0)-(keys.a?1:0),iy=(keys.s?1:0)-(keys.w?1:0);
 if(joy.active){ix=joy.x;iy=joy.y}
 if(!ix&&!iy){ix=Math.cos(p.dir);iy=Math.sin(p.dir)}const l=Math.hypot(ix,iy);p.dx=ix/l;p.dy=iy/l;p.dash=.2;p.inv=.3;p.st-=25;p.stD=.9;
 fx.push({k:'ghost',x:p.x,y:p.y,dir:p.dir,walk:p.walk,t:.22,m:.22})}
function power(i){const p=P;if(p.pc[i]>0||p.dash>0)return;p.pc[i]=PW[i].cd;const pd=14+p.lvl*3+(p.w=='staff'?8:0),a=p.dir;
 if(i==0)bullets.push({x:p.x,y:p.y,vx:Math.cos(a)*300,vy:Math.sin(a)*300,dmg:pd*1.7,life:1.3,r:8,c:'#ff8a3a',own:1,fire:1});
 if(i==1){let tx=mx,ty=my;const d=Math.hypot(tx-p.x,ty-p.y);if(d>280){tx=p.x+(tx-p.x)/d*280;ty=p.y+(ty-p.y)/d*280}
  fx.push({k:'bolt',x:tx,y:ty,t:.3,m:.3});shake=.12;
  for(const e of E)if(!e.dead&&Math.hypot(e.x-tx,e.y-ty)<44)hurt(e,pd*2.3,e.x-tx,e.y-ty)}
 if(i==2){fx.push({k:'shadow',x:p.x,y:p.y,a,rg:84,t:.35,m:.35});
  for(const e of E){const dx=e.x-p.x,dy=e.y-p.y;if(!e.dead&&Math.hypot(dx,dy)<84+e.r&&Math.cos(Math.atan2(dy,dx)-a)>.4)hurt(e,pd*1.9,dx,dy)}}}

function updE(e,dt){
 if(e.dead)return;e.hit=Math.max(0,e.hit-dt);e.cd=Math.max(0,e.cd-dt);
 if(e.kb>0){move(e,e.kx*dt,e.ky*dt);e.kb-=dt;return}
 const dx=P.x-e.x,dy=P.y-e.y,d=Math.hypot(dx,dy)||1,def=ET[e.type];
 if(e.boss)return bossAI(e,dt,d,dx,dy);
 if(d<e.det)e.agro=true;else if(d>e.det*2.2)e.agro=false;
 if(e.wind>0){e.wind-=dt;if(e.wind<=0&&d<e.r+P.r+18)hurtP(e.dmg);return}
 if(e.agro){
  if(def.shoot){if(d>120){move(e,dx/d*e.spd*dt,dy/d*e.spd*dt);e.walk+=dt*8}
   e.sh-=dt;if(e.sh<=0&&d<320){e.sh=def.shoot;shoot(e,Math.atan2(dy,dx),150,e.dmg*.8,'#d27bff')}}
  else{if(d>e.r+P.r+4){move(e,dx/d*e.spd*dt,dy/d*e.spd*dt);e.walk+=dt*8}
   if(d<e.r+P.r+10&&e.cd<=0){e.wind=.35;e.cd=1.2}}
 }else{e.wt-=dt;if(e.wt<=0){e.wt=1+Math.random()*2;e.wa=Math.random()<.4?-1:Math.random()*6.28}
  if(e.wa>=0){move(e,Math.cos(e.wa)*e.spd*.3*dt,Math.sin(e.wa)*e.spd*.3*dt);e.walk+=dt*4}}}
function bossAI(e,dt,d,dx,dy){
 if(!inLab(P))return;e.walk+=dt*6;
 if(e.mode=='charge'){move(e,e.cx*dt,e.cy*dt);e.mt-=dt;if(d<e.r+P.r)hurtP(e.dmg);if(e.mt<=0){e.mode='';e.cd=1.2}return}
 if(e.wind>0){e.wind-=dt;if(e.wind<=0)bossAtk(e,dx,dy);return}
 if(d>110)move(e,dx/d*e.spd*dt,dy/d*e.spd*dt);
 if(e.cd<=0){e.pat=(e.pat+1)%3;e.wind=.75;e.cd=e.hp<e.mhp/2?1.8:2.8}}
function bossAtk(e,dx,dy){const a=Math.atan2(dy,dx),n=e.hp<e.mhp/2?1:0;
 if(e.pat==0)for(let i=-2-n;i<=2+n;i++)shoot(e,a+i*.22,210,e.dmg*.7,'#ff6a4a');
 else if(e.pat==1){const k=14+n*8;for(let i=0;i<k;i++)shoot(e,i/k*6.28+time,150,e.dmg*.6,'#ffa0b0')}
 else{e.mode='charge';e.mt=.55;e.cx=Math.cos(a)*340;e.cy=Math.sin(a)*340}}

/* ---------- death & the Abyss ---------- */
function die(){if(!inAbyss)worldBak={E,loot};inAbyss=true;M=ABYSS;E=[];loot=[];bullets=[];fx=[];portal=null;
 P.x=13*T;P.y=14*T;P.hp=P.mhp*.6;P.st=P.mst;P.dash=0;P.inv=1;
 const n=Math.min(6,3+(P.lvl>>2));
 for(let i=0;i<n;i++){const a=i/n*6.28;let x=(13+Math.cos(a)*7)*T,y=(9+Math.sin(a)*4)*T;if(isSolid(x,y)){x=13*T;y=9*T}E.push(mk('wraith',x,y))}
 toast('You fell into THE ABYSS. Defeat the wraiths to find the way out.')}
function leaveAbyss(){inAbyss=false;M=WORLD;E=worldBak.E;loot=worldBak.loot;bullets=[];fx=[];portal=null;P.x=5.5*T;P.y=22.5*T;P.inv=1;toast('You wake in Greenhaven, changed.');save()}

/* ---------- update ---------- */
function update(dt){
 time+=dt;const p=P;shake=Math.max(0,shake-dt);
 let ix=(keys.d?1:0)-(keys.a?1:0),iy=(keys.s?1:0)-(keys.w?1:0);
 if(joy.active){ix=joy.x;iy=joy.y}
 const il=Math.hypot(ix,iy);
 if(il>1){ix/=il;iy/=il}
 else if(!joy.active&&il){ix/=il;iy/=il}
 if(joy.active&&(joy.x||joy.y)){p.dir=Math.atan2(joy.y,joy.x);mx=p.x+Math.cos(p.dir)*160;my=p.y+Math.sin(p.dir)*160}
 else{mx=mouse.x/Z+cam.x;my=mouse.y/Z+cam.y;p.dir=Math.atan2(my-p.y,mx-p.x)}
 p.atk=Math.max(0,p.atk-dt);p.inv=Math.max(0,p.inv-dt);p.stD=Math.max(0,p.stD-dt);for(let i=0;i<3;i++)p.pc[i]=Math.max(0,p.pc[i]-dt);
 if(p.dash>0){p.dash-=dt;move(p,p.dx*400*dt,p.dy*400*dt)}else move(p,ix*125*dt,iy*125*dt);
 if(il||p.dash>0)p.walk+=dt*12;
 if(p.stD<=0)p.st=Math.min(p.mst,p.st+24*dt);
 if(mouse.down||touchAttack)attack();
 for(const e of E)updE(e,dt);
 E=E.filter(e=>!e.dead);
 for(const b of bullets){const nx=b.x+b.vx*dt,ny=b.y+b.vy*dt;b.life-=dt;if(isSolid(nx,ny))b.life=0;
  if(b.own){for(const e of E)if(!e.dead&&segDist(e.x,e.y,b.x,b.y,nx,ny)<e.r+b.r){hurt(e,b.dmg,b.vx,b.vy);b.life=0;fx.push({k:'boom',x:nx,y:ny,t:.25,m:.25,c:b.c});if(b.fire){shake=.1;for(const o of E)if(!o.dead&&o!==e&&Math.hypot(nx-o.x,ny-o.y)<40)hurt(o,Math.round(b.dmg*.55),o.x-nx,o.y-ny)}break}}
  else if(segDist(p.x,p.y,b.x,b.y,nx,ny)<p.r+b.r){hurtP(b.dmg);b.life=0}b.x=nx;b.y=ny}
 bullets=bullets.filter(b=>b.life>0);
 for(let i=loot.length-1;i>=0;i--){const l=loot[i];if(Math.hypot(l.x-p.x,l.y-p.y)<20&&pick(l.it)){float(p.x,p.y-30,l.it.n,'#9cf');loot.splice(i,1)}}
 fx.forEach(f=>f.t-=dt);fx=fx.filter(f=>f.t>0);floats.forEach(f=>{f.t-=dt;f.y-=24*dt});floats=floats.filter(f=>f.t>0);
 if(inAbyss){if(!E.length&&!portal){portal={x:13*T,y:9*T};toast('A portal opens. Step into it.')}
  if(portal&&Math.hypot(portal.x-p.x,portal.y-p.y)<24)leaveAbyss()}
 else{spawnT+=dt;if(spawnT>6){spawnT=0;respawn()}}
 const z=zoneOf(p);if(z!=zoneName){zoneName=z;const el=$('zone');el.textContent=z;el.classList.remove('show');void el.offsetWidth;el.classList.add('show')}
 const o=nearInt();hintText=o?'[E] '+o.t:'';
 saveT+=dt;if(saveT>15){saveT=0;save()}
}
function respawn(){const mins={slime:7,hollow:5,mutant:8,bogling:4};for(const t in mins)if(E.filter(e=>e.type==t).length<mins[t]){const s=randSpot(...ZN[t]);if(s)E.push(mk(t,s.x,s.y))}}
const zoneOf=p=>inAbyss?'The Abyss':p.y/T>=MY0?'The Whispering Marsh':inLab(p)?'Abandoned Laboratory':p.x/T<20?'Greenhaven':p.x/T<40?'Forgotten Village':'Corrupted Zone';

/* ---------- rendering ---------- */
const hs=(x,y)=>((x*73856093^y*19349663)>>>0)%100;
function tile(v,x,y){const px=x*T,py=y*T,h=hs(x,y),c=ctx;
 if(v==2){c.fillStyle=`hsl(205,55%,${36+Math.sin(time*2+x+y*.7)*4}%)`;c.fillRect(px,py,T,T);c.fillStyle='#fff3';c.fillRect(px+h%20,py+h*3%28,8,2);return}
 if(v==3){c.fillStyle=h%2?'#a68b5c':'#9c8254';c.fillRect(px,py,T,T);c.fillStyle='#0002';c.fillRect(px+h%24,py+h*7%26,4,3);return}
 if(v==6){c.fillStyle=h%2?'#6f6b62':'#66625a';c.fillRect(px,py,T,T);c.fillStyle='#0003';c.fillRect(px,py,T,1);c.fillRect(px,py,1,T);return}
 if(v==7){c.fillStyle='#8da2ac';c.fillRect(px,py,T,T);c.fillStyle='#6f858f';c.fillRect(px,py,T,2);c.fillRect(px,py,2,T);if(h<8){c.fillStyle='#5df';c.fillRect(px+12,py+12,6,6)}return}
 if(v==9){c.fillStyle=h%2?'#1c1728':'#171322';c.fillRect(px,py,T,T);return}
 if(v==10){c.fillStyle=h%2?'#2a3326':'#2f392a';c.fillRect(px,py,T,T);c.fillStyle='#4a6a46';if(h<35)c.fillRect(px+h%24,py+h*5%24,3,2);c.fillStyle='#1c261b';if(h>70)c.fillRect(px+h%20,py+h*3%22,6,4);return}
 if(v==11){c.fillStyle=`hsl(168,32%,${15+Math.sin(time*1.5+x*.8+y*.6)*2.5}%)`;c.fillRect(px,py,T,T);c.fillStyle='#7fe0b01f';c.fillRect(px+h%20,py+h*3%26,9,2);return}
 if(v==12){c.fillStyle=`hsl(165,24%,${25+Math.sin(time*1.8+x+y*.9)*2}%)`;c.fillRect(px,py,T,T);c.fillStyle='#2a3326';if(h%3==0)c.fillRect(px+h%22,py+h*7%24,8,5);c.fillStyle='#9fe8c02a';c.fillRect(px+h%18,py+h*5%26,7,2);return}
 if(v==13){const pulse=Math.sin(time*1.35+x*.7+y*.4);c.fillStyle=`hsl(${274+Math.sin(time*.45+x*.2)*5},48%,${10+pulse*1.8}%)`;c.fillRect(px,py,T,T);c.fillStyle='rgba(174,75,211,.22)';c.beginPath();c.ellipse(px+16+Math.sin(time*.7+y)*5,py+15+Math.cos(time*.6+x)*4,11,4,Math.sin(time+x)*.2,0,6.28);c.fill();c.strokeStyle='rgba(210,130,242,.24)';c.lineWidth=1;c.beginPath();c.arc(px+16,py+16,5+((time*7+x+y)%9),0,6.28);c.stroke();return}
 if(v==14){c.fillStyle=h%2?'#39283f':'#302239';c.fillRect(px,py,T,T);c.strokeStyle='rgba(165,87,184,.38)';c.lineWidth=1;c.beginPath();c.moveTo(px+4,py+8);c.lineTo(px+12,py+13);c.lineTo(px+9,py+23);c.moveTo(px+24,py+4);c.lineTo(px+19,py+12);c.stroke();c.fillStyle='#a55bb6';if(h%4==0)c.fillRect(px+h%23,py+h*3%24,3,3);return}
 if(inAbyss&&v==4){c.fillStyle='#2b2440';c.fillRect(px,py,T,T);c.fillStyle='#41365f';c.fillRect(px,py,T,8);return}
 const cor=x>=40,mar=y>=MY0;c.fillStyle=mar?(h%2?'#2a3326':'#2f392a'):cor?(h%2?'#2d2139':'#33253f'):(h%2?'#3e8c48':'#44954f');c.fillRect(px,py,T,T);
 c.fillStyle=mar?'#4a6a46':cor?'#8a4fc0':'#5fb566';if(h<30)c.fillRect(px+h%26,py+h*5%26,2,4);
 if(cor&&!mar&&v!==1&&v!==4&&v!==5){c.strokeStyle='rgba(150,77,174,.22)';c.lineWidth=1;if(h%5===0){c.beginPath();c.moveTo(px+4,py+7);c.lineTo(px+11,py+12);c.lineTo(px+9,py+21);c.stroke()}if(h%7===0){c.fillStyle='rgba(192,105,213,.18)';c.beginPath();c.arc(px+20,py+8,2,0,6.28);c.fill()}}
 if(!cor&&!mar&&v===0&&h%6===0){c.fillStyle='rgba(184,226,128,.24)';c.fillRect(px+h%25,py+h*3%26,2,3)}
 if(v==1){c.fillStyle='#5a3a22';c.fillRect(px+13,py+14,6,14);c.fillStyle=mar?'#1f3a30':cor?'#4a2a5e':'#2a6a34';c.fillRect(px+3,py-4,26,20);c.fillStyle=mar?'#2c5244':cor?'#6a3a82':'#368a42';c.fillRect(px+7,py-8,18,14)}
 else if(v==4){c.fillStyle='#777';c.fillRect(px+4,py+8,24,18);c.fillStyle='#9a9a9a';c.fillRect(px+7,py+6,16,10)}
 else if(v==5){const lab=x>=45;c.fillStyle=lab?'#38444c':'#4d4036';c.fillRect(px,py,T,T);c.fillStyle=lab?'#4c5b65':'#6a5848';c.fillRect(px,py,T,6);c.fillStyle='#0004';c.fillRect(px,py+T-3,T,3)}}
function drawMarshDecor(d){const {x,y,kind,phase,scale}=d;ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);const sway=Math.sin(time*1.4+phase)*2;
 if(kind==='reed'){ctx.strokeStyle='#587b50';ctx.lineWidth=2;for(let i=-1;i<=1;i++){ctx.beginPath();ctx.moveTo(i*4,3);ctx.quadraticCurveTo(i*5+sway,-7,i*4+sway,-17-(i===0?4:0));ctx.stroke();ctx.fillStyle='#a2a75c';ctx.fillRect(i*4+sway-1,-19-(i===0?4:0),3,6)}}
 else if(kind==='mushroom'){ctx.fillStyle='#263d2e';ctx.fillRect(-5,0,10,3);ctx.fillStyle='#c36b65';ctx.beginPath();ctx.ellipse(0,-3,6,4,0,Math.PI,Math.PI*2);ctx.fill();ctx.fillStyle='#f1c6a0';ctx.fillRect(-2,-6,2,2)}
 else if(kind==='root'){ctx.strokeStyle='#554632';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-8,2);ctx.quadraticCurveTo(-2,-7,2,-2);ctx.quadraticCurveTo(7,2,10,-5);ctx.stroke()}
 else if(kind==='lily'){ctx.fillStyle='#477d62';ctx.beginPath();ctx.ellipse(0,0,9,4,0,0,6.28);ctx.fill();ctx.strokeStyle='#9acb83';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(6,-2);ctx.stroke();ctx.fillStyle='#c8e78b';ctx.beginPath();ctx.arc(-2,-2,2,0,6.28);ctx.fill()}
 else{ctx.fillStyle='#426c4c';ctx.fillRect(-2,-3,4,6);ctx.fillStyle='#d5bd72';ctx.beginPath();ctx.arc(0,-5,4+Math.sin(time*2+phase)*.6,0,6.28);ctx.fill();ctx.fillStyle='#f3e8b2';ctx.fillRect(-1,-6,2,2)}
 ctx.restore()}
function drawVillageDecor(d){
 const {x,y,kind,phase,scale}=d;ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
 ctx.fillStyle='#0005';ctx.beginPath();ctx.ellipse(0,1,11,4,0,0,6.28);ctx.fill();
 if(kind==='barrel'){
  ctx.fillStyle='#68472d';ctx.fillRect(-7,-13,14,14);ctx.fillStyle='#8c633b';ctx.fillRect(-5,-12,10,12);
  ctx.fillStyle='#3c3028';ctx.fillRect(-7,-10,14,2);ctx.fillRect(-7,-2,14,2);ctx.fillStyle='#b18a55';ctx.fillRect(-1,-11,2,10);
 }else if(kind==='crate'){
  ctx.fillStyle='#67482d';ctx.fillRect(-9,-15,18,15);ctx.fillStyle='#a27a49';ctx.fillRect(-7,-13,14,11);
  ctx.strokeStyle='#563a28';ctx.lineWidth=2;ctx.strokeRect(-7,-13,14,11);ctx.beginPath();ctx.moveTo(-6,-12);ctx.lineTo(6,-2);ctx.moveTo(6,-12);ctx.lineTo(-6,-2);ctx.stroke();
 }else if(kind==='fence'){
  ctx.fillStyle='#60472f';for(let i=-1;i<=1;i++){ctx.fillRect(i*8-2,-13,4,15);ctx.fillRect(-13,-12,26,3);if(i!==0)ctx.fillRect(-13,-5,26,3)}
  ctx.fillStyle='#96714a';ctx.fillRect(-13,-13,26,2);
 }else if(kind==='lantern'){
  ctx.fillStyle='#57432f';ctx.fillRect(-2,-20,4,20);ctx.fillRect(-6,-21,12,3);ctx.fillStyle='#d8a94e';ctx.fillRect(-4,-18,8,7);
  const g=ctx.createRadialGradient(0,-14,1,0,-14,18);g.addColorStop(0,'rgba(255,211,111,.35)');g.addColorStop(1,'rgba(255,190,80,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,-14,18,0,6.28);ctx.fill();
  ctx.fillStyle='#ffe5a0';ctx.fillRect(-2,-16,4,4);
 }else if(kind==='well'){
  ctx.fillStyle='#716c60';ctx.fillRect(-13,-12,26,12);ctx.fillStyle='#aaa18c';ctx.fillRect(-11,-14,22,4);ctx.fillStyle='#27343a';ctx.fillRect(-8,-10,16,9);
  ctx.fillStyle='#5a4430';ctx.fillRect(-12,-23,3,12);ctx.fillRect(9,-23,3,12);ctx.fillRect(-13,-24,26,3);ctx.fillStyle='#8c6942';ctx.fillRect(-3,-27,6,4);
 }else if(kind==='stall'){
  ctx.fillStyle='#65472f';ctx.fillRect(-12,-13,3,13);ctx.fillRect(9,-13,3,13);ctx.fillRect(-13,-14,26,3);
  ctx.fillStyle='#9b6549';ctx.beginPath();ctx.moveTo(-15,-14);ctx.lineTo(-10,-23);ctx.lineTo(10,-23);ctx.lineTo(15,-14);ctx.closePath();ctx.fill();
  ctx.fillStyle='#d2b078';ctx.fillRect(-10,-12,20,3);ctx.fillStyle='#775338';ctx.fillRect(-8,-8,5,6);ctx.fillRect(3,-8,5,6);
 }else if(kind==='rubble'){
  ctx.fillStyle='#0004';ctx.beginPath();ctx.ellipse(0,0,15,5,0,0,6.28);ctx.fill();
  ctx.fillStyle='#625f59';ctx.beginPath();ctx.moveTo(-14,-1);ctx.lineTo(-11,-10);ctx.lineTo(-5,-12);ctx.lineTo(-1,-5);ctx.lineTo(-4,0);ctx.closePath();ctx.fill();
  ctx.fillStyle='#858176';ctx.beginPath();ctx.moveTo(-8,-2);ctx.lineTo(-5,-12);ctx.lineTo(1,-9);ctx.lineTo(3,-2);ctx.closePath();ctx.fill();
  ctx.fillStyle='#aaa395';ctx.beginPath();ctx.moveTo(2,-1);ctx.lineTo(6,-11);ctx.lineTo(13,-8);ctx.lineTo(14,-1);ctx.closePath();ctx.fill();
  ctx.fillStyle='#514d49';ctx.fillRect(-13,-2,6,2);ctx.fillRect(4,-3,8,2);
  ctx.fillStyle='#c0b8a7';ctx.fillRect(-5,-10,3,2);ctx.fillRect(8,-8,3,2);
 }else{
  const sway=Math.sin(time*1.2+phase)*1.5;ctx.strokeStyle='#58734b';ctx.lineWidth=2;
  for(let i=-1;i<=1;i++){ctx.beginPath();ctx.moveTo(i*4,0);ctx.quadraticCurveTo(i*5+sway,-7,i*4+sway,-13-(i===0?3:0));ctx.stroke()}
 }
 ctx.restore();
}
function drawRegionDecor(d){
 const {x,y,k,p}=d;ctx.save();ctx.translate(x,y);
 ctx.fillStyle='#0005';ctx.beginPath();ctx.ellipse(0,2,13,4,0,0,6.28);ctx.fill();
 if(k==='flower'){
  ctx.strokeStyle='#477b42';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,2);ctx.lineTo(0,-10);ctx.stroke();
  for(let i=0;i<5;i++){const a=i*1.256;ctx.fillStyle=i%2?'#e8d68a':'#e8a6b5';ctx.beginPath();ctx.arc(Math.cos(a)*4,-12+Math.sin(a)*4,2.8,0,6.28);ctx.fill()}
  ctx.fillStyle='#f5e8a0';ctx.beginPath();ctx.arc(0,-12,2,0,6.28);ctx.fill();
 }else if(k==='stone'){
  ctx.fillStyle='#777b70';ctx.beginPath();ctx.moveTo(-12,1);ctx.lineTo(-9,-9);ctx.lineTo(-2,-13);ctx.lineTo(9,-8);ctx.lineTo(12,1);ctx.closePath();ctx.fill();ctx.fillStyle='#a2a69a';ctx.fillRect(-5,-9,5,2);
 }else if(k==='stump'){
  ctx.fillStyle='#65472e';ctx.fillRect(-8,-10,16,12);ctx.fillStyle='#a47a4d';ctx.fillRect(-8,-12,16,4);ctx.strokeStyle='#493321';ctx.strokeRect(-5,-10,10,10);
 }else if(k==='sign'){
  ctx.fillStyle='#69472d';ctx.fillRect(-2,-20,4,22);ctx.fillStyle='#a47b4b';ctx.fillRect(-12,-21,24,10);ctx.strokeStyle='#543922';ctx.strokeRect(-12,-21,24,10);ctx.fillStyle='#e4d2a0';ctx.fillRect(-7,-17,14,2);
 }else if(k==='camp'){
  ctx.strokeStyle='#71543a';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-8,0);ctx.lineTo(8,-7);ctx.moveTo(-8,-7);ctx.lineTo(8,0);ctx.stroke();
  ctx.fillStyle='#e18a37';ctx.beginPath();ctx.moveTo(0,-17);ctx.quadraticCurveTo(10,-8,2,-4);ctx.quadraticCurveTo(-8,-8,0,-17);ctx.fill();ctx.fillStyle='#ffe59a';ctx.fillRect(-1,-12,2,6);
 }else if(k==='crystal'){
  ctx.fillStyle='#633b82';ctx.beginPath();ctx.moveTo(-9,1);ctx.lineTo(-6,-17);ctx.lineTo(0,-25);ctx.lineTo(6,-13);ctx.lineTo(9,1);ctx.closePath();ctx.fill();ctx.fillStyle='#bd78df';ctx.beginPath();ctx.moveTo(-2,-20);ctx.lineTo(0,-25);ctx.lineTo(3,-15);ctx.lineTo(1,-5);ctx.closePath();ctx.fill();
 }else if(k==='tendril'){
  ctx.strokeStyle='#784a8e';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-11,2);ctx.quadraticCurveTo(-15,-13,-4,-18);ctx.quadraticCurveTo(7,-23,10,-9);ctx.stroke();ctx.strokeStyle='#bd6acb';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-11,2);ctx.quadraticCurveTo(-15,-13,-4,-18);ctx.stroke();
 }else if(k==='wreck'){
  ctx.fillStyle='#504657';ctx.fillRect(-12,-12,24,13);ctx.fillStyle='#8c7295';ctx.fillRect(-9,-15,7,5);ctx.fillRect(3,-17,8,7);ctx.strokeStyle='#d08cdd';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-8,-9);ctx.lineTo(8,-2);ctx.stroke();
 }else if(k==='bones'){
  ctx.strokeStyle='#b5a6b9';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-10,-4);ctx.lineTo(10,-13);ctx.moveTo(-8,-13);ctx.lineTo(8,-3);ctx.stroke();ctx.fillStyle='#d2c4d4';[-10,10,-8,8].forEach((v,i)=>{ctx.beginPath();ctx.arc(v,i%2?-13:-4,3,0,6.28);ctx.fill()});
 }else if(k==='beam'){
  ctx.save();ctx.rotate((p%1-.5)*.4);ctx.fillStyle='#62452f';ctx.fillRect(-15,-3,30,6);ctx.fillStyle='#98704a';ctx.fillRect(-14,-3,28,2);ctx.restore();
 }
 ctx.restore();
}
function drawLabDecor(d){
 const {x,y,k}=d;ctx.save();ctx.translate(x,y);
 if(k==='pod'){
  ctx.fillStyle='#263941';ctx.fillRect(-10,-18,20,19);ctx.fillStyle='#7bd4d0';ctx.globalAlpha=.45;ctx.fillRect(-7,-15,14,13);ctx.globalAlpha=1;ctx.strokeStyle='#a7d4d0';ctx.lineWidth=2;ctx.strokeRect(-10,-18,20,19);ctx.fillStyle='#d9f5e7';ctx.fillRect(-2,-12,4,7);
 }else if(k==='console'){
  ctx.fillStyle='#344c55';ctx.fillRect(-12,-14,24,15);ctx.fillStyle='#77d5c8';ctx.fillRect(-8,-11,16,7);ctx.fillStyle='#e3d77b';ctx.fillRect(-5,-9,3,2);ctx.fillRect(2,-9,3,2);
 }else if(k==='table'){
  ctx.fillStyle='#5b6264';ctx.fillRect(-13,-10,26,9);ctx.fillStyle='#a3b4b5';ctx.fillRect(-11,-12,22,3);ctx.fillStyle='#b5e0d8';ctx.fillRect(-4,-16,8,4);
 }else{
  ctx.strokeStyle='#5b9a9c';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-14,-10);ctx.bezierCurveTo(-2,-24,3,3,14,-13);ctx.stroke();ctx.fillStyle='#79d7d0';ctx.fillRect(-15,-12,4,4);ctx.fillRect(12,-15,4,4);
 }
 ctx.restore();
}
function person(x,y,c,hair,w,f,s=1){ctx.save();ctx.translate(x,y);ctx.scale(s,s);const b=Math.sin(w)>0?1:0;
 ctx.fillStyle='#0004';ctx.fillRect(-7,-2,14,4);
 ctx.fillStyle='#2b3350';ctx.fillRect(-5,-7+b,4,7-b);ctx.fillRect(1,-7+(1-b),4,7-(1-b));
 ctx.fillStyle=c;ctx.fillRect(-6,-17,12,11);ctx.fillStyle='#f0c8a0';ctx.fillRect(-5,-25,10,9);ctx.fillStyle=hair;ctx.fillRect(-6,-27,12,5);
 ctx.fillStyle='#111';ctx.fillRect(f>0?0:-4,-21,2,2);ctx.fillRect(f>0?3:-1,-21,2,2);ctx.restore()}
function drawE(e){const x=e.x,y=e.y,f=P.x>x?1:-1;ctx.save();if(e.hit>0){ctx.filter='brightness(2.2) saturate(0.2)';ctx.globalAlpha=.85}
 if(e.type=='slime'){const s=Math.sin(time*5+e.walk)*2;ctx.fillStyle='#0004';ctx.fillRect(x-9,y-2,18,4);ctx.fillStyle='#6fd16f';ctx.beginPath();ctx.ellipse(x,y-8,11+s,9-s,0,0,6.3);ctx.fill();
  ctx.fillStyle='#b8f5a8';ctx.fillRect(x-5,y-13,4,3);ctx.fillStyle='#143';ctx.fillRect(x-4,y-9,2,3);ctx.fillRect(x+2,y-9,2,3)}
 else if(e.type=='hollow'){person(x,y,'#5a6270','#334',e.walk,f);ctx.fillStyle='#f55';ctx.fillRect(x-3,y-21,2,2);ctx.fillRect(x+2,y-21,2,2)}
 else if(e.type=='mutant'){person(x,y,'#7a3a9a','#2a1a3a',e.walk,f);ctx.fillStyle='#f4f';ctx.fillRect(x-1,y-31,3,3);ctx.fillStyle='#9a5ab8';ctx.fillRect(x+7,y-17,6,5);ctx.fillRect(x-13,y-14,6,4)}
 else if(e.type=='bogling'){const bob=Math.sin(time*4+e.walk)*2;ctx.fillStyle='#0005';ctx.beginPath();ctx.ellipse(x,y-1,13,4,0,0,6.3);ctx.fill();ctx.fillStyle='#344f3b';ctx.beginPath();ctx.ellipse(x,y-9+bob,12,11,0,0,6.3);ctx.fill();ctx.fillStyle='#5c8150';ctx.beginPath();ctx.ellipse(x-2,y-14+bob,7,5,-.2,0,6.3);ctx.fill();ctx.fillStyle='#b8e78a';ctx.fillRect(x-5,y-12+bob,3,3);ctx.fillRect(x+3,y-12+bob,3,3);ctx.fillStyle='#243323';ctx.fillRect(x-4,y-11+bob,2,2);ctx.fillRect(x+4,y-11+bob,2,2);ctx.fillStyle='#8d9d58';ctx.fillRect(x-9,y-22+bob,3,8);ctx.fillRect(x+6,y-21+bob,3,7)}
 else if(e.type=='wraith'){ctx.globalAlpha*=.85;const fl=Math.sin(time*4+e.walk)*3;ctx.fillStyle='#4a3f86';ctx.beginPath();ctx.moveTo(x-9,y-22+fl);ctx.lineTo(x+9,y-22+fl);ctx.lineTo(x+12,y+fl);ctx.lineTo(x,y-5+fl);ctx.lineTo(x-12,y+fl);ctx.fill();
  ctx.fillStyle='#d9d0ff';ctx.fillRect(x-5,y-18+fl,3,3);ctx.fillRect(x+2,y-18+fl,3,3)}
 else if(e.type=='warden'){const fl=e.wind>0&&((time*14)|0)%2,enr=e.hp<e.mhp/2;
  if(enr&&Math.random()<.25)fx.push({k:'spark',x:x+(Math.random()-.5)*30,y:y-20+(Math.random()-.5)*30,c:'#ff4422',t:.2,m:.2});
  person(x,y,fl?'#fff':enr?'#c11':'#a22','#eee',e.walk,f,2.2);if(e.mode=='charge'){ctx.fillStyle='#f446';ctx.beginPath();ctx.arc(x,y-20,30,0,6.3);ctx.fill()}}
 ctx.restore();
 if(e.wind>0&&!e.boss){ctx.fillStyle='#f44';ctx.font='bold 16px monospace';ctx.fillText('!',x-3,y-e.r-26)}
 if(!e.boss&&e.hp<e.mhp){const w=26;ctx.fillStyle='#000a';ctx.fillRect(x-w/2-1,y-e.r-23,w+2,5);ctx.fillStyle='#e33';ctx.fillRect(x-w/2,y-e.r-22,w*e.hp/e.mhp,3)}}
function render(){
 const vw=VW/Z,vh=VH/Z,mw=M.w*T,mh=M.h*T;ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#07060b';ctx.fillRect(0,0,VW,VH);if(!P)return;
 cam.x=mw<vw?-(vw-mw)/2:Math.max(0,Math.min(mw-vw,P.x-vw/2));cam.y=mh<vh?-(vh-mh)/2:Math.max(0,Math.min(mh-vh,P.y-vh/2));
 cam.x=Math.round(cam.x);cam.y=Math.round(cam.y);
 const sx=shake>0?(Math.random()-.5)*6:0,sy=shake>0?(Math.random()-.5)*6:0;
 ctx.setTransform(Z,0,0,Z,-cam.x*Z+sx,-cam.y*Z+sy);
 const x0=Math.max(0,cam.x/T|0),x1=Math.min(M.w-1,(cam.x+vw)/T|0),y0=Math.max(0,cam.y/T|0),y1=Math.min(M.h-1,(cam.y+vh)/T|0);
 for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)tile(M.t[y][x],x,y);
 const D=[];
 if(!inAbyss&&zoneOf(P)==='The Whispering Marsh')for(const d of MARSH_DECOR)if(d.x>cam.x-40&&d.x<cam.x+vw+40&&d.y>cam.y-40&&d.y<cam.y+vh+40)D.push([d.y,()=>drawMarshDecor(d)]);
 if(!inAbyss)for(const d of VILLAGE_DECOR)if(d.x>cam.x-40&&d.x<cam.x+vw+40&&d.y>cam.y-40&&d.y<cam.y+vh+40)D.push([d.y,()=>drawVillageDecor(d)]);
 if(!inAbyss)for(const d of REGION_DECOR)if(d.x>cam.x-40&&d.x<cam.x+vw+40&&d.y>cam.y-40&&d.y<cam.y+vh+40)D.push([d.y,()=>drawRegionDecor(d)]);
 if(!inAbyss&&inLab(P))for(const d of LAB_DECOR)D.push([d.y,()=>drawLabDecor(d)]);
 if(!inAbyss){
  for(const d of EXPLORATION_SECRETS)if(!secretFound(d.id)&&d.x>cam.x-40&&d.x<cam.x+vw+40&&d.y>cam.y-40&&d.y<cam.y+vh+40)D.push([d.y,()=>{const pulse=.35+Math.sin(time*2.3+d.x)*.15;ctx.save();ctx.globalAlpha=pulse;ctx.fillStyle='#b9e9c8';ctx.beginPath();ctx.arc(d.x,d.y-5,3+Math.sin(time*3+d.y)*1.2,0,6.28);ctx.fill();ctx.restore()}]);
  const activeStory=Q[P.q]&&P.qs===1?STORY_MARKERS.find(d=>d.k===Q[P.q].k):null;if(activeStory)D.push([activeStory.y,()=>{const pulse=.55+Math.sin(time*3)*.2;ctx.save();ctx.globalAlpha=pulse;ctx.strokeStyle=activeStory.color;ctx.lineWidth=2;ctx.beginPath();ctx.arc(activeStory.x,activeStory.y-7,8+Math.sin(time*2.5)*3,0,6.28);ctx.stroke();ctx.fillStyle=activeStory.color;ctx.beginPath();ctx.arc(activeStory.x,activeStory.y-7,3,0,6.28);ctx.fill();ctx.restore()}]);
  if(!secretFound('marsh_chamber'))D.push([52.5*T,()=>{ctx.save();ctx.fillStyle='#263e42';ctx.fillRect(49.5*T-11,52.5*T-12,22,18);ctx.fillStyle='#7fe7d0';ctx.globalAlpha=.75+.2*Math.sin(time*4);ctx.fillRect(49.5*T-7,52.5*T-9,14,7);ctx.fillStyle='#c7fff0';ctx.fillRect(49.5*T-2,52.5*T-7,4,3);ctx.restore()}]);
  if(!P.runeSolved)for(const d of GREENHAVEN_RUNE_STONES)D.push([d.y,()=>{const active=(P.runes||[]).includes(d.id);ctx.save();ctx.globalAlpha=active?.9:.62;ctx.fillStyle=active?'#9de7b2':'#9cb6a8';ctx.beginPath();ctx.ellipse(d.x,d.y-3,8,5,0,0,6.28);ctx.fill();ctx.fillStyle=active?'#e8ffe9':'#536c63';ctx.fillRect(d.x-3,d.y-13,6,10);ctx.globalAlpha=.22+Math.sin(time*2+d.order)*.08;ctx.fillStyle='#c9ffe1';ctx.beginPath();ctx.arc(d.x,d.y-12,12,0,6.28);ctx.fill();ctx.restore()}]);
  NPCS.forEach((n,i)=>D.push([n.y,()=>{person(n.x,n.y,n.c,n.h,time*2,P.x>n.x?1:-1);const q=Q[P.q];
   if(q&&q.giver===i&&P.qs!=1){ctx.fillStyle='#ffd84a';ctx.font='bold 18px monospace';ctx.fillText(P.qs==2?'?':'!',n.x-5,n.y-34+Math.sin(time*4)*2)}}]));
  if(!P.shard)D.push([26.5*T,()=>{ctx.fillStyle='#5ff9';ctx.beginPath();ctx.arc(26.5*T,15.5*T,10+Math.sin(time*5)*3,0,6.3);ctx.fill();ctx.fillStyle='#dff';ctx.fillRect(26.5*T-3,15.5*T-6,6,12)}]);
  if(!P.chest)D.push([33.5*T,()=>{ctx.fillStyle='#7a4a22';ctx.fillRect(5.5*T-10,33.5*T-8,20,14);ctx.fillStyle='#e8b84a';ctx.fillRect(5.5*T-10,33.5*T-3,20,3)}]);
  D.push([7.5*T,()=>{ctx.fillStyle='#223';ctx.fillRect(51.5*T-12,7.5*T-14,24,22);ctx.fillStyle=`hsl(150,80%,${45+Math.sin(time*6)*10}%)`;ctx.fillRect(51.5*T-9,7.5*T-11,18,10)}]);
 }
 if(portal)D.push([portal.y,()=>{ctx.fillStyle='#b07bffaa';ctx.beginPath();ctx.ellipse(portal.x,portal.y,16+Math.sin(time*6)*3,24,time,0,6.3);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(portal.x,portal.y,6,12,-time*2,0,6.3);ctx.fill()}]);
 const bBoss=E.find(e=>e.boss&&!e.dead);
 if(bBoss&&bBoss.wind>0&&bBoss.pat==2){
  const ba=Math.atan2(P.y-bBoss.y,P.x-bBoss.x);
  ctx.save();ctx.strokeStyle='rgba(255,50,50,0.45)';ctx.lineWidth=22;ctx.setLineDash([8,6]);
  ctx.beginPath();ctx.moveTo(bBoss.x,bBoss.y);ctx.lineTo(bBoss.x+Math.cos(ba)*260,bBoss.y+Math.sin(ba)*260);ctx.stroke();ctx.restore();
 }
 for(const l of loot)D.push([l.y,()=>{const b=Math.sin(time*4+l.x)*2;ctx.fillStyle='#fff3';ctx.beginPath();ctx.arc(l.x,l.y-6+b,9,0,6.3);ctx.fill();
  if(l.it.t=='potion'){ctx.fillStyle='#e33';ctx.fillRect(l.x-3,l.y-8+b,6,7);ctx.fillStyle='#ccd';ctx.fillRect(l.x-1,l.y-11+b,2,3)}else{ctx.fillStyle='#e8b84a';ctx.fillRect(l.x-4,l.y-10+b,8,8)}}]);
 for(const e of E)D.push([e.y,()=>drawE(e)]);
 D.push([P.y-.2,()=>{if(P.adminOwned||P.activeCharacter==='admin_prime'){ctx.save();const pulse=.72+Math.sin(time*3.4)*.18;ctx.globalAlpha=pulse;const g=ctx.createRadialGradient(P.x,P.y-10,4,P.x,P.y-10,48);g.addColorStop(0,'#fff9');g.addColorStop(.35,'#a9a0ff55');g.addColorStop(1,'#5d4cff00');ctx.fillStyle=g;ctx.beginPath();ctx.arc(P.x,P.y-10,48+Math.sin(time*4)*5,0,6.28);ctx.fill();ctx.strokeStyle='#e8e4ff';ctx.lineWidth=1.4;ctx.setLineDash([3,5]);ctx.beginPath();ctx.arc(P.x,P.y-10,29+Math.sin(time*2.5)*3,time*.7,time*.7+5.3);ctx.stroke();ctx.setLineDash([]);for(let i=0;i<4;i++){const a=time*1.3+i*Math.PI/2;const x=P.x+Math.cos(a)*36,y=P.y-10+Math.sin(a)*22;ctx.fillStyle=i%2?'#c6c0ff':'#fff';ctx.shadowColor='#b8b0ff';ctx.shadowBlur=12;ctx.font='bold 11px Georgia';ctx.fillText(['✦','◇','✧','✹'][i],x-4,y+4)}ctx.restore()}}]);
 D.push([P.y,()=>{ctx.save();if(P.inv>0&&((time*20)|0)%2)ctx.globalAlpha=.4;if(P.dash>0)ctx.globalAlpha=.5;const f=Math.cos(P.dir)>0?1:-1;
  person(P.x,P.y,'#3a7bd5','#3b2414',P.walk,f);
  const w=WP[P.w]||WP.sword,swProg=P.atk>0?P.atk/w.cd:0;
  const swOff=Math.sin(swProg*Math.PI)*(w.rg?12:5),swAng=P.dir+(P.atk>0?(swProg-.5)*(w.arc||1):0);
  ctx.strokeStyle=w.c;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(P.x,P.y-12);
  ctx.lineTo(P.x+Math.cos(swAng)*(16+swOff),P.y-12+Math.sin(swAng)*(16+swOff));ctx.stroke();ctx.restore()}]);
 D.sort((a,b)=>a[0]-b[0]).forEach(d=>d[1]());
 for(const b of bullets){ctx.fillStyle=b.c;ctx.globalAlpha=.35;ctx.beginPath();ctx.arc(b.x-b.vx*.03,b.y-b.vy*.03,b.r+3,0,6.3);ctx.fill();
  if(b.magic&&Math.random()<.3)fx.push({k:'spark',x:b.x,y:b.y,c:'#bdf',t:.12,m:.12});
  ctx.globalAlpha=1;ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,6.3);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(b.x,b.y,b.r*.4,0,6.3);ctx.fill()}
 for(const f of fx){const a=f.t/f.m;ctx.globalAlpha=Math.max(0,a);
  if(f.k=='slash'){ctx.strokeStyle=f.c||'#fff';ctx.lineWidth=4;ctx.beginPath();ctx.arc(f.x,f.y-10,f.rg*.75,f.a-f.arc/2,f.a+f.arc/2);ctx.stroke()}
  else if(f.k=='boom'){ctx.fillStyle=f.c;ctx.beginPath();ctx.arc(f.x,f.y-8,(1-a)*28+6,0,6.3);ctx.fill()}
  else if(f.k=='bolt'){ctx.strokeStyle='#bff';ctx.lineWidth=3;ctx.beginPath();let yy=f.y-240;ctx.moveTo(f.x,yy);while(yy<f.y){yy=Math.min(f.y,yy+24);ctx.lineTo(yy>=f.y?f.x:f.x+(Math.random()-.5)*30,yy)}ctx.stroke();ctx.fillStyle='#8ef6';ctx.beginPath();ctx.arc(f.x,f.y,44*(1-a*.3),0,6.3);ctx.fill()}
  else if(f.k=='shadow'){ctx.fillStyle='#6a2fb8';ctx.beginPath();ctx.moveTo(f.x,f.y-10);ctx.arc(f.x,f.y-10,f.rg*(1.1-a*.2),f.a-.9,f.a+.9);ctx.closePath();ctx.fill()}
  else if(f.k=='spark'){ctx.strokeStyle=f.c;ctx.lineWidth=2;for(let i=0;i<4;i++){const sa=i*1.57+a*2,len=(1-a)*12+4;ctx.beginPath();ctx.moveTo(f.x,f.y);ctx.lineTo(f.x+Math.cos(sa)*len,f.y+Math.sin(sa)*len);ctx.stroke()}}
  else if(f.k=='burst'){ctx.fillStyle=f.c;const count=f.n||10;for(let i=0;i<count;i++){const ba=i*(6.28/count),dist=(1-a)*24+4;ctx.fillRect(f.x+Math.cos(ba)*dist-2,f.y+Math.sin(ba)*dist-2,3,3)}}
  else if(f.k=='ghost'){ctx.globalAlpha=a*.35;person(f.x,f.y,'#3a7bd5','#3b2414',f.walk,Math.cos(f.dir)>0?1:-1)}
  else if(f.k=='redflash'){ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle=`rgba(255,0,0,${a*.22})`;ctx.fillRect(0,0,VW,VH);ctx.setTransform(Z,0,0,Z,-cam.x*Z+sx,-cam.y*Z+sy)}}
 ctx.globalAlpha=1;
 ctx.textAlign='center';for(const f of floats){ctx.globalAlpha=Math.min(1,f.t*2);ctx.font=f.crit?'bold 16px monospace':f.plr?'bold 15px monospace':'bold 13px monospace';ctx.strokeStyle='#000';ctx.lineWidth=f.crit?4:3;ctx.strokeText(f.s,f.x,f.y);ctx.fillStyle=f.c;ctx.fillText(f.s,f.x,f.y)} ctx.textAlign='left';ctx.globalAlpha=1;
 // Corrupted Zone: low purple haze and drifting spores, with the cursed pond as its visual anchor.
 if(!inAbyss&&zoneOf(P)==='Corrupted Zone'){
  ctx.save();ctx.globalCompositeOperation='screen';
  for(let i=0;i<4;i++){const ax=cam.x+((time*(7+i*2)+i*211)%(vw+220))-110,ay=cam.y+vh*(.22+i*.19)+Math.sin(time*.42+i*1.8)*20;const ag=ctx.createRadialGradient(ax,ay,4,ax,ay,115+i*12);ag.addColorStop(0,'rgba(153,67,190,.10)');ag.addColorStop(1,'rgba(110,38,145,0)');ctx.fillStyle=ag;ctx.beginPath();ctx.ellipse(ax,ay,140,32,0,0,6.28);ctx.fill()}
  for(let i=0;i<8;i++){const px=cam.x+((i*149+Math.sin(time*.8+i)*28)%(vw+24)),py=cam.y+((i*91-time*6)%(vh+24));ctx.globalAlpha=.18+Math.sin(time*2.5+i)*.10;ctx.fillStyle=i%2?'#d58bea':'#8e65cb';ctx.beginPath();ctx.arc(px,py,1.4+(i%3)*.35,0,6.28);ctx.fill()}
  ctx.restore();ctx.globalAlpha=1;
 }
 // Step 5: lightweight marsh mist and subtle firefly glow, only while inside the biome.
 if(!inAbyss&&zoneOf(P)==='The Whispering Marsh'){
  ctx.save();ctx.globalCompositeOperation='screen';
  for(let i=0;i<5;i++){const fxp=cam.x+((time*13+i*173)%(vw+260))-130,fyp=cam.y+vh*(.18+i*.16)+Math.sin(time*.35+i*1.7)*18;
   const g=ctx.createRadialGradient(fxp,fyp,8,fxp,fyp,105+i*9);g.addColorStop(0,'rgba(139,190,157,0.075)');g.addColorStop(1,'rgba(139,190,157,0)');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(fxp,fyp,125+i*8,24+i*3,0,0,6.28);ctx.fill()}
  for(let i=0;i<9;i++){const gx=cam.x+((i*137+Math.sin(time*.7+i)*24)%(vw+20)),gy=cam.y+((i*83+time*9)%(vh+20));ctx.globalAlpha=.22+Math.sin(time*3+i)*.12;ctx.fillStyle='#b8f4b8';ctx.beginPath();ctx.arc(gx,gy,1.4,0,6.28);ctx.fill()}
  ctx.restore();ctx.globalAlpha=1;
 }
 ctx.setTransform(1,0,0,1,0,0);
 const zn=zoneOf(P);ctx.fillStyle=zn=='Corrupted Zone'?'#50146e30':zn=='Greenhaven'?'#00000000':zn=='Forgotten Village'?'#3c321e18':zn=='The Whispering Marsh'?'#0e2a2218':'#00001440';ctx.fillRect(0,0,VW,VH)}

/* ---------- HUD ---------- */
function hud(){if(!P)return;const p=P;$('admin-title').classList.toggle('hidden',!p.adminOwned);
 $('hp').style.width=Math.max(0,p.hp/p.mhp*100)+'%';$('hpt').textContent=Math.max(0,Math.ceil(p.hp))+' / '+p.mhp;$('st').style.width=p.st/p.mst*100+'%';
 $('xp').style.width=(p.lvl>=20?100:p.xp/need(p.lvl)*100)+'%';$('lv').textContent='LV '+p.lvl;
 for(let i=0;i<3;i++){const h=p.pc[i]/PW[i].cd*100+'%';$('c'+(i+1)).style.height=h;const tc=$('tc'+(i+1));if(tc)tc.style.height=h}
 const q=Q[p.q];$('qt').innerHTML=q?`<b>${q.t}</b><br>${q.giver>=0&&p.qs==0?'Speak to '+NPCS[q.giver].n:q.giver>=0&&p.qs==2?'Return to '+NPCS[q.giver].n:q.o+(q.n>1?` (${p.qp}/${q.n})`:'')}`:'<b>The experiment is yours now.</b>';
 const b=E.find(e=>e.boss&&!e.dead);$('boss').classList.toggle('hidden',!(b&&inLab(p)));if(b)$('bossb').style.width=b.hp/b.mhp*100+'%';
 $('hint').textContent=state=='play'?hintText:'';const bInt=$('btn-int');if(bInt)bInt.classList.toggle('hidden',!(state=='play'&&hintText))}

/* ---------- save / load / menus ---------- */
function save(){if(!P)return;try{normalizeSummonSave();const s=Object.assign({},P);if(inAbyss){s.x=5.5*T;s.y=22.5*T;s.hp=s.mhp}localStorage.setItem(KEY,JSON.stringify(s))}catch(e){}}
function initWorld(){M=WORLD;inAbyss=false;E=[];loot=[];bullets=[];fx=[];floats=[];portal=null;zoneName='';
 for(const t in ZN){const n={slime:10,hollow:7,mutant:11,bogling:5}[t];for(let i=0;i<n;i++){const s=randSpot(...ZN[t]);if(s)E.push(mk(t,s.x,s.y))}}
 if(!P.boss)E.push(mk('warden',51.5*T,11*T))}
function begin(){$('menu').classList.add('hidden');$('hud').classList.remove('hidden');state='play'}
function showMenu(pause){state=pause?'pause':'menu';$('menu').classList.remove('hidden');$('mt').textContent=pause?'Paused':'The Last Experiment';
 $('bres').classList.toggle('hidden',!pause);$('bcont').classList.toggle('hidden',pause||!localStorage.getItem(KEY))}
$('bnew').onclick=()=>{P=mkP();normalizeSummonSave();recalc();P.hp=P.mhp;initWorld();begin();say('Narrator',['Humanity was never born. It was designed.','You wake in Greenhaven with no memory and a sword at your side. Find someone who remembers.'])};
$('bcont').onclick=()=>{try{P=Object.assign(mkP(),JSON.parse(localStorage.getItem(KEY)));normalizeSummonSave();recalc();if(!(P.hp>0))P.hp=P.mhp;if(P.q>=5&&P.qs===0){P.qs=1;P.qp=0;save()}initWorld();begin()}catch(e){toast('Save could not be loaded')}};
$('bres').onclick=()=>begin();
$('dlg').onclick=nextD;

/* ---------- input ---------- */
addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(['tab',' ','arrowup','arrowdown'].includes(k))e.preventDefault();keys[k]=true;if(e.repeat)return;
 if(state=='play'){if(k=='g')openSummon();else if(k==' '||k=='shift')dodge();else if(k=='1'||k=='2'||k=='3')power(+k-1);else if(k=='e')interact();else if(k=='h')usePotion();else if(k=='r')cycleW();
  else if(k=='i'||k=='tab')toggleInv(true);else if(k=='escape'||k=='p'){save();showMenu(true)}}
 else if(state=='dlg'){if(k=='e'||k==' '||k=='enter')nextD()}
 else if(state=='inv'){if(k=='i'||k=='tab'||k=='escape')toggleInv(false)}
 else if(state=='pause'&&(k=='escape'||k=='p'))begin();else if(state=='summon'&&k==='escape')closeSummon()});
addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
addEventListener('blur',()=>{for(const k in keys)keys[k]=false;mouse.down=false});
cv.addEventListener('mousemove',e=>{mouse.x=e.clientX;mouse.y=e.clientY});
cv.addEventListener('mousedown',e=>{mouse.x=e.clientX;mouse.y=e.clientY;if(state=='play'&&e.button==0)mouse.down=true});
addEventListener('mouseup',()=>mouse.down=false);
cv.addEventListener('contextmenu',e=>e.preventDefault());

/* ---------- main loop ---------- */
let last=0;
function loop(t){const dt=Math.min(.05,(t-last)/1000||0);last=t;if(P&&state=='play')update(dt);render();hud();requestAnimationFrame(loop)}
showMenu(false);requestAnimationFrame(loop);

/* ---------- mobile touch controls ---------- */
function autoAim(){
 if(!P)return;let cl=null,md=260;
 for(const e of E)if(!e.dead){const d=Math.hypot(e.x-P.x,e.y-P.y);if(d<md){md=d;cl=e}}
 if(cl){P.dir=Math.atan2(cl.y-P.y,cl.x-P.x);mx=cl.x;my=cl.y}
 else{mx=P.x+Math.cos(P.dir)*160;my=P.y+Math.sin(P.dir)*160}
}

const joyZone=$('joy-zone'),joyStick=$('joy-stick'),joyBase=$('joy-base');
const setJoyPos=(cx,cy,tx,ty)=>{
 const dx=tx-cx,dy=ty-cy,dist=Math.hypot(dx,dy),maxR=50;
 if(dist>maxR){joy.x=dx/dist;joy.y=dy/dist;joyStick.style.transform=`translate(${joy.x*maxR}px,${joy.y*maxR}px)`}
 else if(dist>5){joy.x=dx/maxR;joy.y=dy/maxR;joyStick.style.transform=`translate(${dx}px,${dy}px)`}
 else{joy.x=0;joy.y=0;joyStick.style.transform='translate(0,0)'}
 joy.active=true;
};
const resetJoy=()=>{joy.x=0;joy.y=0;joy.active=false;joy.tid=null;if(joyStick)joyStick.style.transform='translate(0,0)'};

if(joyZone){
 joyZone.addEventListener('touchstart',e=>{
  document.body.classList.add('has-touch');
  e.preventDefault();
  const t=e.changedTouches[0];
  joy.tid=t.identifier;
  const rect=joyBase.getBoundingClientRect();
  setJoyPos(rect.left+rect.width/2,rect.top+rect.height/2,t.clientX,t.clientY);
 },{passive:false});
 addEventListener('touchmove',e=>{
  if(joy.tid===null)return;
  for(let i=0;i<e.changedTouches.length;i++){
   const t=e.changedTouches[i];
   if(t.identifier===joy.tid){
    const rect=joyBase.getBoundingClientRect();
    setJoyPos(rect.left+rect.width/2,rect.top+rect.height/2,t.clientX,t.clientY);
    break;
   }
  }
 },{passive:false});
 const onTouchEnd=e=>{
  if(joy.tid===null)return;
  for(let i=0;i<e.changedTouches.length;i++){
   if(e.changedTouches[i].identifier===joy.tid){resetJoy();break}
  }
 };
 addEventListener('touchend',onTouchEnd);
 addEventListener('touchcancel',onTouchEnd);
}

const bindBtn=(id,onPress,onRelease)=>{
 const el=$(id);if(!el)return;
 el.addEventListener('touchstart',e=>{
  document.body.classList.add('has-touch');
  e.preventDefault();e.stopPropagation();
  onPress();
 },{passive:false});
 if(onRelease){
  el.addEventListener('touchend',e=>{e.preventDefault();onRelease()});
  el.addEventListener('touchcancel',e=>{e.preventDefault();onRelease()});
 }
 el.addEventListener('click',e=>{
  e.preventDefault();
  onPress();
  if(onRelease)onRelease();
 });
};

bindBtn('btn-atk',()=>{autoAim();touchAttack=true;attack()},()=>{touchAttack=false});
bindBtn('btn-dodge',()=>{dodge()});
bindBtn('btn-fire',()=>{autoAim();power(0)});
bindBtn('btn-bolt',()=>{autoAim();power(1)});
bindBtn('btn-shadow',()=>{autoAim();power(2)});
bindBtn('btn-pot',()=>{usePotion()});
bindBtn('btn-int',()=>{interact()});
bindBtn('btn-inv',()=>{toggleInv(state!='inv')});

addEventListener('touchstart',()=>{document.body.classList.add('has-touch')},{once:true,passive:true});

