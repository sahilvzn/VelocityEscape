/*
 Escape Road - Web Skeleton
 - Three.js-based runner with simple car, road, police AI, pickups, obstacles, UI, and garage stub.
 - Runs on desktop and mobile (with touch controls).

 Controls
 - Accelerate: W or ArrowUp
 - Brake/Reverse: S or ArrowDown
 - Steer: A/D or ArrowLeft/ArrowRight

 This is a learning scaffold: visuals and physics are simplified for clarity.
*/
(() => {
  const TAU = Math.PI * 2;

  // Persistent profile in localStorage
  const STORAGE_KEYS = {
    profile: 'escapeRoad.profile.v1',
    hiScore: 'escapeRoad.hiscore.v1',
  };

  const DEFAULT_VEHICLES = [
    { id: 'starter', name: 'Starter', price: 0, maxSpeed: 60, accel: 24, turnRate: 2.4, color: 0x2ed573 },
    { id: 'sprinter', name: 'Sprinter', price: 200, maxSpeed: 80, accel: 32, turnRate: 2.8, color: 0x3a86ff },
    { id: 'enforcer', name: 'Enforcer', price: 400, maxSpeed: 70, accel: 28, turnRate: 2.0, color: 0xff4757 },
  ];

  const PROFILE_DEFAULT = {
    money: 0,
    ownedVehicles: ['starter'],
    selectedVehicle: 'starter',
    settings: { sfx: true, music: true },
  };

  function loadProfile() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.profile);
      if (!raw) return { ...PROFILE_DEFAULT };
      const parsed = JSON.parse(raw);
      return { ...PROFILE_DEFAULT, ...parsed, settings: { ...PROFILE_DEFAULT.settings, ...(parsed.settings||{}) } };
    } catch {
      return { ...PROFILE_DEFAULT };
    }
  }
  function saveProfile(profile) {
    localStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(profile));
  }

  // Simple event bus (not heavily used yet)
  const Bus = (() => {
    const map = new Map();
    return {
      on(type, fn) { map.set(type, [...(map.get(type)||[]), fn]); },
      emit(type, data) { (map.get(type)||[]).forEach(fn => fn(data)); },
      off(type, fn) { map.set(type, (map.get(type)||[]).filter(f => f!==fn)); },
    };
  })();

  // Audio placeholders (use Oscillator for minimal sounds)
  const Audio = (() => {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    let ctx = null;
    function ensureCtx(){ if (!ctx && Ctx) ctx = new Ctx(); return ctx; }
    function beep(freq = 440, time = 0.1, type = 'sine', gain = 0.05) {
      const ac = ensureCtx();
      if (!ac) return;
      const osc = ac.createOscillator();
      const g = ac.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      g.gain.value = gain;
      osc.connect(g); g.connect(ac.destination);
      const now = ac.currentTime;
      osc.start(now);
      osc.stop(now + time);
    }
    return {
      pickup(){ beep(880, 0.06, 'triangle', 0.08); },
      crash(){ beep(110, 0.3, 'sawtooth', 0.15); },
      sirenTick(){ beep(660, 0.05, 'square', 0.03); },
      engineTick(speed){ beep(120 + speed*2, 0.02, 'sine', 0.01); },
    };
  })();

  // Input manager (keyboard + touch)
  const Input = (() => {
    const state = { up:false, down:false, left:false, right:false };
    const keys = {
      ArrowUp: 'up', KeyW: 'up',
      ArrowDown: 'down', KeyS: 'down',
      ArrowLeft: 'left', KeyA: 'left',
      ArrowRight: 'right', KeyD: 'right',
    };
    window.addEventListener('keydown', (e)=>{ const k = keys[e.code]; if (k) { state[k] = true; e.preventDefault(); } });
    window.addEventListener('keyup', (e)=>{ const k = keys[e.code]; if (k) { state[k] = false; e.preventDefault(); } });

    const btnLeft = document.getElementById('btnLeft');
    const btnRight = document.getElementById('btnRight');
    const btnAccel = document.getElementById('btnAccel');
    const btnBrake = document.getElementById('btnBrake');
    function bindHold(btn, prop) {
      if (!btn) return;
      const start = (e)=>{ state[prop] = true; e.preventDefault(); };
      const end = (e)=>{ state[prop] = false; e.preventDefault(); };
      ['mousedown','touchstart','pointerdown'].forEach(t=>btn.addEventListener(t, start));
      ['mouseup','mouseleave','touchend','pointerup','touchcancel','pointercancel'].forEach(t=>btn.addEventListener(t, end));
    }
    bindHold(btnLeft, 'left');
    bindHold(btnRight, 'right');
    bindHold(btnAccel, 'up');
    bindHold(btnBrake, 'down');
    return state;
  })();

  // THREE setup
  const canvas = document.getElementById('game');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0b0e14);

  const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);

  const ambient = new THREE.AmbientLight(0xffffff, 0.4); scene.add(ambient);
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
  dirLight.position.set(10, 15, 10);
  dirLight.castShadow = true;
  scene.add(dirLight);

  // Ground/road materials
  const roadMat = new THREE.MeshStandardMaterial({ color: 0x2b2f3b, roughness: 1 });
  const lineMat = new THREE.MeshStandardMaterial({ color: 0xf1c40f });
  const grassMat = new THREE.MeshStandardMaterial({ color: 0x1e2a1e });
  const obstacleMat = new THREE.MeshStandardMaterial({ color: 0x8e9aaf });
  const coinMat = new THREE.MeshStandardMaterial({ color: 0xffd166, emissive: 0xffd166, emissiveIntensity: 0.3 });

  // Utilities
  function makeBox(w,h,d,mat){ const g = new THREE.BoxGeometry(w,h,d); const m = new THREE.Mesh(g, mat); m.castShadow = true; m.receiveShadow = true; return m; }
  function rand(min, max){ return Math.random()*(max-min)+min; }
  function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }

  // Game State
  const profile = loadProfile();
  let currentVehicle = DEFAULT_VEHICLES.find(v=>v.id===profile.selectedVehicle) || DEFAULT_VEHICLES[0];
  let state = 'menu'; // menu | running | gameover | garage
  let distance = 0; // meters
  let moneyRun = 0;
  let runTime = 0;

  // Entities
  const player = {
    mesh: null,
    width: 1.2, length: 2.4, height: 0.8,
    speed: 0, heading: 0,
    maxSpeed: currentVehicle.maxSpeed, accel: currentVehicle.accel, turnRate: currentVehicle.turnRate,
  };
  const police = [];
  const obstacles = [];
  const coins = [];
  const roadSegments = [];

  // UI bindings
  const elMenu = document.getElementById('menu');
  const elGarage = document.getElementById('garage');
  const elHUD = document.getElementById('hud');
  const elMobile = document.getElementById('mobileControls');
  const elGameOver = document.getElementById('gameOver');
  const elDistance = document.getElementById('statDistance');
  const elMoney = document.getElementById('statMoney');
  const elSpeed = document.getElementById('statSpeed');
  const elFinalDistance = document.getElementById('finalDistance');
  const elFinalMoney = document.getElementById('finalMoney');

  const btnPlay = document.getElementById('btnPlay');
  const btnGarage = document.getElementById('btnGarage');
  const btnBackToMenu = document.getElementById('btnBackToMenu');
  const btnRestart = document.getElementById('btnRestart');
  const btnGoGarage = document.getElementById('btnGoGarage');
  const btnGoMenu = document.getElementById('btnGoMenu');
  const garageList = document.getElementById('garageList');

  function showScreen(name){
    elMenu.classList.remove('visible');
    elGarage.classList.remove('visible');
    elGameOver.classList.remove('visible');
    elHUD.classList.add('hidden');
    if (name==='menu') { elMenu.classList.add('visible'); }
    if (name==='garage') { elGarage.classList.add('visible'); buildGarage(); }
    if (name==='running') { elHUD.classList.remove('hidden'); }
    if (name==='gameover') { elGameOver.classList.add('visible'); }
    // mobile
    const isMobile = window.matchMedia('(max-width: 820px)').matches;
    elMobile.classList.toggle('hidden', !(name==='running' && isMobile));
  }

  btnPlay.addEventListener('click', () => startRun());
  btnGarage.addEventListener('click', () => { state='garage'; showScreen('garage'); });
  btnBackToMenu.addEventListener('click', () => { state='menu'; showScreen('menu'); });
  btnRestart.addEventListener('click', () => startRun());
  btnGoGarage.addEventListener('click', () => { state='garage'; showScreen('garage'); });
  btnGoMenu.addEventListener('click', () => { state='menu'; showScreen('menu'); });

  // Build Garage UI
  function buildGarage(){
    garageList.innerHTML = '';
    const moneyLabel = document.createElement('div');
    moneyLabel.className = 'meta';
    moneyLabel.textContent = `Money: $${profile.money}`;
    garageList.appendChild(moneyLabel);

    DEFAULT_VEHICLES.forEach(v => {
      const card = document.createElement('div');
      card.className = 'vehicle-card';
      const title = document.createElement('h3'); title.textContent = v.name;
      const meta = document.createElement('div'); meta.className = 'meta'; meta.textContent = `Max ${v.maxSpeed} | Accel ${v.accel} | Turn ${v.turnRate}`;
      const actions = document.createElement('div'); actions.className = 'actions';

      const selectBtn = document.createElement('button'); selectBtn.textContent = profile.selectedVehicle === v.id ? 'Selected' : 'Select';
      selectBtn.disabled = profile.selectedVehicle === v.id || !profile.ownedVehicles.includes(v.id);
      selectBtn.addEventListener('click', ()=>{
        profile.selectedVehicle = v.id;
        saveProfile(profile);
        currentVehicle = v;
        buildGarage();
      });

      const owns = profile.ownedVehicles.includes(v.id);
      const priceBtn = document.createElement('button'); priceBtn.textContent = owns ? 'Owned' : `$${v.price}`;
      priceBtn.disabled = owns || profile.money < v.price;
      priceBtn.className = owns ? 'secondary' : '';
      priceBtn.addEventListener('click', ()=>{
        if (profile.money >= v.price && !owns) {
          profile.money -= v.price;
          profile.ownedVehicles.push(v.id);
          saveProfile(profile);
          buildGarage();
        }
      });

      const swatch = document.createElement('div');
      swatch.style.width = '100%'; swatch.style.height = '10px'; swatch.style.borderRadius = '6px';
      swatch.style.background = `#${v.color.toString(16).padStart(6,'0')}`;

      actions.appendChild(selectBtn);
      actions.appendChild(priceBtn);

      card.appendChild(title);
      card.appendChild(swatch);
      card.appendChild(meta);
      card.appendChild(actions);
      garageList.appendChild(card);
    });
  }

  // World creation
  function createPlayer(){
    const mat = new THREE.MeshStandardMaterial({ color: currentVehicle.color });
    const body = makeBox(player.width, player.height, player.length, mat);
    body.position.set(0, player.height/2, 0);
    scene.add(body);
    player.mesh = body;
    player.speed = 0;
    player.heading = 0;
    player.maxSpeed = currentVehicle.maxSpeed;
    player.accel = currentVehicle.accel;
    player.turnRate = currentVehicle.turnRate;
  }

  function createPolice(count=1){
    for (let i=0;i<count;i++){
      const mat = new THREE.MeshStandardMaterial({ color: 0x3355ff, emissive: 0x2233aa, emissiveIntensity: 0.2 });
      const p = makeBox(1.2, 0.8, 2.4, mat);
      p.position.set(rand(-2.5, 2.5), 0.4, rand(-12, -6));
      scene.add(p);
      police.push({ mesh: p, speed: 0, maxSpeed: 56, aggressiveness: 0.8 });
    }
  }

  function createRoadSegments(){
    const segmentLen = 20;
    const roadWidth = 8;
    for (let i=0;i<8;i++){
      const seg = makeBox(roadWidth, 0.1, segmentLen, roadMat);
      seg.receiveShadow = true;
      seg.position.set(0, 0, i*segmentLen);
      scene.add(seg);
      // lane lines
      const line = makeBox(0.15, 0.02, segmentLen-1, lineMat);
      line.position.set(0, 0.06, i*segmentLen);
      scene.add(line);
      // sides (grass)
      const sideL = makeBox(6, 0.1, segmentLen, grassMat); sideL.position.set(-7, 0, i*segmentLen); scene.add(sideL);
      const sideR = makeBox(6, 0.1, segmentLen, grassMat); sideR.position.set(7, 0, i*segmentLen); scene.add(sideR);
      roadSegments.push({ seg, line, sideL, sideR });
    }
  }

  function resetWorld(){
    // remove old
    [player.mesh, ...police.map(p=>p.mesh), ...obstacles, ...coins, ...roadSegments.flatMap(r=>[r.seg, r.line, r.sideL, r.sideR])].forEach(m=>{ if(m){ scene.remove(m); if (m.geometry) m.geometry.dispose?.(); if (m.material) m.material.dispose?.(); }});
    police.length = 0; obstacles.length = 0; coins.length = 0; roadSegments.length = 0;

    // recreate
    createRoadSegments();
    createPlayer();
    createPolice(1);

    // reset stats
    distance = 0; moneyRun = 0; runTime = 0;
  }

  // Spawning timers (kept for possible future)
  let policeRampTimer = 0;

  function spawnObstacle(zAhead){
    const w = rand(0.8, 1.6), h = rand(0.8, 1.4), d = rand(1.0, 2.0);
    const x = rand(-3.0, 3.0);
    const m = makeBox(w,h,d, obstacleMat);
    m.position.set(x, h/2, zAhead);
    scene.add(m);
    obstacles.push(m);
  }
  function spawnCoin(zAhead){
    const x = rand(-3.2, 3.2);
    const m = makeBox(0.4,0.4,0.4, coinMat);
    m.position.set(x, 0.3, zAhead);
    scene.add(m);
    coins.push(m);
  }

  // Simple AABB collision
  function aabbIntersect(a, b){
    const ab = a.geometry.boundingBox || (a.geometry.computeBoundingBox(), a.geometry.boundingBox);
    const bb = b.geometry.boundingBox || (b.geometry.computeBoundingBox(), b.geometry.boundingBox);
    const aMin = a.localToWorld(ab.min.clone());
    const aMax = a.localToWorld(ab.max.clone());
    const bMin = b.localToWorld(bb.min.clone());
    const bMax = b.localToWorld(bb.max.clone());
    return (aMin.x <= bMax.x && aMax.x >= bMin.x) && (aMin.y <= bMax.y && aMax.y >= bMin.y) && (aMin.z <= bMax.z && aMax.z >= bMin.z);
  }

  // Run lifecycle
  function startRun(){
    state = 'running';
    resetWorld();
    showScreen('running');
  }
  function endRun(){
    state = 'gameover';
    profile.money += moneyRun + Math.floor(distance/50);
    saveProfile(profile);
    elFinalDistance.textContent = Math.floor(distance).toString();
    elFinalMoney.textContent = moneyRun.toString();
    showScreen('gameover');
  }

  // Camera follow
  function updateCamera(dt){
    const target = player.mesh.position.clone().add(new THREE.Vector3(0, 3.2, -6));
    camera.position.lerp(target, clamp(dt*4, 0, 1));
    const lookAt = player.mesh.position.clone().add(new THREE.Vector3(0, 1.0, 4));
    camera.lookAt(lookAt);
  }

  // Update systems
  function updatePlayer(dt){
    if (!player.mesh) return;
    const accel = player.accel;
    if (Input.up) { player.speed += accel*dt; }
    if (Input.down) { player.speed -= accel*dt*1.2; }
    player.speed = clamp(player.speed, -player.maxSpeed*0.5, player.maxSpeed);

    const turn = player.turnRate * (Input.left ? 1 : 0) - player.turnRate * (Input.right ? 1 : 0);
    player.heading += turn * dt * (player.speed>=0?1:-1);

    const forward = new THREE.Vector3(Math.sin(player.heading), 0, Math.cos(player.heading));
    player.mesh.position.addScaledVector(forward, player.speed * dt * 0.2);

    // keep within road bounds
    player.mesh.position.x = clamp(player.mesh.position.x, -3.8, 3.8);

    // friction
    player.speed *= 0.992;

    // engine sound tick
    if (Math.random() < 0.2) Audio.engineTick(Math.abs(player.speed));
  }

  function updatePolice(dt){
    if (police.length===0) return;
    for (const p of police){
      const dir = player.mesh.position.clone().sub(p.mesh.position);
      dir.y = 0;
      const desired = dir.normalize();

      const speedTarget = Math.min(player.maxSpeed*0.9 + runTime*0.5, 90);
      p.speed += (speedTarget - p.speed) * dt * 0.5;
      p.mesh.position.addScaledVector(desired, p.speed * dt * 0.18);

      // simple collision with player -> end
      if (aabbIntersect(p.mesh, player.mesh)) { Audio.crash(); endRun(); return; }

      // siren tick sometimes
      if (Math.random()<0.02) Audio.sirenTick();
    }
    // ramp difficulty over time
    policeRampTimer += dt;
    if (policeRampTimer > 10 && police.length < 3){
      policeRampTimer = 0;
      createPolice(1);
    }
  }

  function updateRoad(dt){
    const segmentLen = 20;
    const recycleZ = camera.position.z - 10;
    for (const r of roadSegments){
      if (r.seg.position.z < recycleZ){
        const maxZ = Math.max(...roadSegments.map(rr=>rr.seg.position.z));
        const newZ = maxZ + segmentLen;
        [r.seg, r.line, r.sideL, r.sideR].forEach((m)=>{ m.position.z = newZ; });

        // maybe spawn obstacle or coin on this refreshed segment
        if (Math.random()<0.6) spawnObstacle(newZ + rand(-8,8));
        if (Math.random()<0.5) spawnCoin(newZ + rand(-8,8));
      }
    }
  }

  function updateObstacles(dt){
    for (let i=obstacles.length-1;i>=0;i--){
      const o = obstacles[i];
      if (o.position.z < camera.position.z - 30){
        scene.remove(o); obstacles.splice(i,1); continue;
      }
      if (aabbIntersect(player.mesh, o)) {
        Audio.crash();
        endRun();
        return;
      }
    }
  }
  function updateCoins(dt){
    for (let i=coins.length-1;i>=0;i--){
      const c = coins[i];
      c.rotation.y += dt*4;
      if (c.position.z < camera.position.z - 30){ scene.remove(c); coins.splice(i,1); continue; }
      if (aabbIntersect(player.mesh, c)) {
        moneyRun += 1;
        Audio.pickup();
        scene.remove(c); coins.splice(i,1);
      }
    }
  }

  // HUD update
  function updateHUD(){
    elDistance.textContent = Math.floor(distance).toString();
    elMoney.textContent = moneyRun.toString();
    elSpeed.textContent = Math.floor(Math.abs(player.speed)).toString();
  }

  // Resize
  function onResize(){
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w/h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', onResize);

  // Main loop
  let last = performance.now() / 1000;
  function tick(){
    const now = performance.now() / 1000;
    let dt = now - last;
    if (dt > 0.05) dt = 0.05; // clamp
    last = now;

    if (state === 'running'){
      runTime += dt;
      updatePlayer(dt);
      updatePolice(dt);
      updateRoad(dt);
      updateObstacles(dt);
      updateCoins(dt);
      updateCamera(dt);
      distance += Math.max(0, player.speed) * dt * 0.6;
      updateHUD();
    }

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }

  // Boot
  showScreen('menu');
  onResize();
  tick();
})();
