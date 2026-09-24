
import * as THREE from 'three';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { CONFIG, getCameraZ } from './config.js';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// --- MUSIC PLAYER 3D ---
        function initPlayerCharacter() {
            const canvas = document.getElementById('player-character');
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 20);
            camera.position.set(0, 0.3, 4.2);
            const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, CONFIG.render.maxPixelRatio));
            renderer.setSize(52, 52, false);
            scene.add(new THREE.AmbientLight(CONFIG.colors.ambientLight, 1.8));
            const light = new THREE.PointLight(CONFIG.colors.pink, 3, 8);
            light.position.set(2, 2, 3);
            scene.add(light);

            const dancer = new THREE.Group();
            const pink = new THREE.MeshStandardMaterial({ color: CONFIG.colors.pink, roughness: 0.4, metalness: 0.3 });
            const cyan = new THREE.MeshStandardMaterial({ color: CONFIG.colors.cyan, roughness: 0.3, metalness: 0.5 });
            const head = new THREE.Mesh(new THREE.SphereGeometry(0.34, 16, 12), pink);
            head.position.y = 1.05;
            dancer.add(head);
            const torso = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.75, 0.38), cyan);
            torso.position.y = 0.4;
            dancer.add(torso);
            const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.65, 0.16), pink);
            const rightArm = leftArm.clone();
            leftArm.position.set(-0.42, 0.48, 0);
            rightArm.position.set(0.42, 0.48, 0);
            dancer.add(leftArm, rightArm);
            const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.65, 0.18), cyan);
            const rightLeg = leftLeg.clone();
            leftLeg.position.set(-0.18, -0.3, 0);
            rightLeg.position.set(0.18, -0.3, 0);
            dancer.add(leftLeg, rightLeg);
            dancer.children.forEach((part) => { part.visible = false; });
            const starShape = new THREE.Shape();
            for (let point = 0; point < 10; point++) {
                const radius = point % 2 === 0 ? 0.9 : 0.38;
                const angle = (point / 10) * Math.PI * 2 - Math.PI / 2;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                if (point === 0) starShape.moveTo(x, y); else starShape.lineTo(x, y);
            }
            starShape.closePath();
            const star = new THREE.Mesh(new THREE.ExtrudeGeometry(starShape, { depth: 0.28, bevelEnabled: true, bevelSize: 0.08, bevelThickness: 0.08 }), pink);
            star.position.z = -0.14;
            dancer.add(star);
            scene.add(dancer);

            const animate = (time) => {
                const beat = prefersReducedMotion ? 0 : Math.sin(time * 0.006);
                dancer.position.y = beat * 0.08;
                dancer.rotation.y = beat * 0.22;
                star.rotation.z = beat * 0.35;
                star.rotation.x = beat * 0.18;
                renderer.render(scene, camera);
                requestAnimationFrame(animate);
            };
            animate(0);
        }
        initPlayerCharacter();



// --- PIXEL TRAIL (Background) ---

        const trailCanvas = document.getElementById('pixel-canvas');
        const trailCtx = trailCanvas.getContext('2d');
        let particles = [];
        const pixelColors = ['#ff66b2', '#b366ff', '#00ffcc', '#ffffff', '#ff99cc'];

        function resizeTrailCanvas() { trailCanvas.width = window.innerWidth; trailCanvas.height = window.innerHeight; }
        window.addEventListener('resize', resizeTrailCanvas);
        resizeTrailCanvas();

        function addPixel(x, y) {
            if (prefersReducedMotion) return;
            for (let i = 0; i < 2; i++) {
                particles.push({
                    x, y, size: Math.random() * 5 + 3,
                    color: pixelColors[Math.floor(Math.random() * pixelColors.length)],
                    life: 1, vx: (Math.random() - 0.5) * 1.5, vy: (Math.random() - 0.5) * 1.5
                });
            }
        }
        window.addEventListener('mousemove', (e) => addPixel(e.clientX, e.clientY));
        window.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) addPixel(e.touches[0].clientX, e.touches[0].clientY);
        });

        function animatePixels() {
            trailCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
            for (let i = particles.length - 1; i >= 0; i--) {
                let p = particles[i];
                p.x += p.vx; p.y += p.vy; p.life -= 0.025;
                if (p.life <= 0) particles.splice(i, 1);
                else {
                    trailCtx.fillStyle = p.color; trailCtx.globalAlpha = p.life;
                    trailCtx.fillRect(p.x, p.y, p.size, p.size);
                }
            }
            trailCtx.globalAlpha = 1;
            requestAnimationFrame(animatePixels);
        }
        animatePixels();

        // ============================================================
        // 3D PHONE MODE


// --- PHONE SCENE 3D ---
        let scene, camera, webglRenderer, cssRenderer, phoneGroup, charmGroup;
        let collageItems = [];
        let mode3dRunning = false;
        let mode3dInitialized = false;

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2(-100, -100);
        let hoveredMesh = null;

        window.addEventListener('mousemove', (event) => {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        });
        window.addEventListener('touchstart', (event) => {
            if (event.touches.length > 0) {
                mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
                mouse.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
            }
        }, { passive: true });

        const globalAssets = [
            'img/asset_1.jpg', 'img/asset_10.jpg', 'img/asset_11.jpg', 'img/asset_12.jpg',
            'img/asset_13.gif', 'img/asset_14.jpg', 'img/asset_2.jpg', 'img/asset_3.jpg',
            'img/asset_4.jpg', 'img/asset_6.jpg', 'img/asset_7.jpg', 'img/asset_8.jpg',
            'img/asset_9.jpg', 'img/demo.gif'
        ];

        const sectionImages = {
            home: ['img/home_1.jpg', 'img/home_2.jpg', 'img/home_3.jpg', 'img/home_4.jpg', 'img/home_5.jpg', 'img/home_6.jpg'],
            about: ['img/about_1.jpg', 'img/about_2.jpg', 'img/about_3.jpg', 'img/about_4.jpg', 'img/about_5.jpg', 'img/about_6.jpg'],
            skills: ['img/projects_1.jpg', 'img/demo.gif'],
            projects: ['img/projects_1.jpg', 'img/projects_2.jpg', 'img/demo.gif'],
            experience: ['img/about_1.jpg', 'img/sessions_2.jpg'],
            proj1: ['img/qdrift_1.jpg', 'img/qdrift_2.jpg'],
            proj2: ['img/neuro_1.jpg', 'img/neuro_2.jpg'],
            community: ['img/sessions_1.jpg', 'img/sessions_2.jpg', 'img/sessions_3.jpg'],
            sessions: ['img/aws_summit.jpg'],
            contact: ['img/contact_1.jpg']
        };

        const textureLoader = new THREE.TextureLoader();
        function loadTextureSafe(url, onLoad) {
            textureLoader.load(url, onLoad, undefined, () => { });
        }

        function initMode3D() {
            if (mode3dInitialized) return;
            mode3dInitialized = true;

            scene = new THREE.Scene();
            scene.fog = new THREE.FogExp2(CONFIG.colors.ink, CONFIG.render.fogDensity);

            const { fov, near, far } = CONFIG.camera;
            camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, near, far);

            webglRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            webglRenderer.setSize(window.innerWidth, window.innerHeight);
            webglRenderer.setPixelRatio(Math.min(window.devicePixelRatio, CONFIG.render.maxPixelRatio));
            webglRenderer.shadowMap.enabled = true;
            webglRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
            document.getElementById('webgl-container').appendChild(webglRenderer.domElement);

            cssRenderer = new CSS3DRenderer();
            cssRenderer.setSize(window.innerWidth, window.innerHeight);
            document.getElementById('css3d-container').appendChild(cssRenderer.domElement);

            const ambientLight = new THREE.AmbientLight(CONFIG.colors.ambientLight, 1.2);
            scene.add(ambientLight);

            const dirLight = new THREE.DirectionalLight(CONFIG.colors.lightPink, 3.5);
            dirLight.position.set(5, 12, 12);
            dirLight.castShadow = true;
            dirLight.shadow.mapSize.width = CONFIG.render.shadowMapSize;
            dirLight.shadow.mapSize.height = CONFIG.render.shadowMapSize;
            dirLight.shadow.camera.near = 0.5;
            dirLight.shadow.camera.far = 50;
            scene.add(dirLight);

            const pointLight = new THREE.PointLight(CONFIG.colors.cyan, 1.8, 30);
            pointLight.position.set(-5, -5, 5);
            scene.add(pointLight);

            const backLight = new THREE.PointLight(CONFIG.colors.pink, 3.0, 40);
            backLight.position.set(0, 0, -10);
            scene.add(backLight);

            const bgPlaneGeo = new THREE.PlaneGeometry(150, 150);
            const bgPlaneMat = new THREE.ShadowMaterial({ opacity: 0.15 });
            const bgPlane = new THREE.Mesh(bgPlaneGeo, bgPlaneMat);
            bgPlane.position.z = -20;
            bgPlane.receiveShadow = true;
            scene.add(bgPlane);

            const gridHelper = new THREE.GridHelper(100, 40, CONFIG.colors.cyan, CONFIG.colors.pink);
            gridHelper.position.y = -12;
            gridHelper.position.z = -10;
            scene.add(gridHelper);

            createCollageBackground('home');
            createPhoneY2K();

            adjustCameraForDevice();

            if (!prefersReducedMotion) {
                gsap.from(phoneGroup.position, { y: -20, duration: 2.5, ease: "power3.out" });
                gsap.from(phoneGroup.rotation, { y: Math.PI * 2, x: 0.5, duration: 2.5, ease: "power3.out" });
            }
        }

        function createLiquidMetalGeometry() {
            const types = ['star', 'torus', 'gem', 'octahedron', 'heart', 'drop'];
            const type = types[Math.floor(Math.random() * types.length)];

            let geometry;
            if (type === 'star') {
                const shape = new THREE.Shape();
                for (let i = 0; i < 10; i++) {
                    const r = i % 2 === 0 ? 2.0 : 0.8;
                    const a = (i / 10) * Math.PI * 2;
                    if (i === 0) shape.moveTo(Math.cos(a) * r, Math.sin(a) * r);
                    else shape.lineTo(Math.cos(a) * r, Math.sin(a) * r);
                }
                geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.4, bevelEnabled: true, bevelSize: 0.1, bevelThickness: 0.1 });
            } else if (type === 'torus') {
                geometry = new THREE.TorusKnotGeometry(1.2, 0.4, 64, 16);
            } else if (type === 'gem') {
                geometry = new THREE.OctahedronGeometry(1.5, 0);
            } else if (type === 'octahedron') {
                geometry = new THREE.IcosahedronGeometry(1.3, 0);
            } else if (type === 'heart') {
                const shape = new THREE.Shape();
                shape.moveTo(0, 0.3);
                shape.bezierCurveTo(0.3, 0.6, 1.2, 0.3, 0, -1.0);
                shape.bezierCurveTo(-1.2, 0.3, -0.3, 0.6, 0, 0.3);
                geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.3, bevelEnabled: true, bevelSegments: 3, steps: 2, bevelSize: 0.05, bevelThickness: 0.05 });
            } else if (type === 'drop') {
                const shape = new THREE.Shape();
                shape.moveTo(0, 1.5);
                shape.bezierCurveTo(0.8, -0.5, 0.8, -1.5, 0, -1.5);
                shape.bezierCurveTo(-0.8, -1.5, -0.8, -0.5, 0, 1.5);
                geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.4, bevelEnabled: true, bevelSize: 0.1, bevelThickness: 0.1 });
            }

            const colors = [0xffb3ba, 0xffdfba, 0xffffba, 0xbaffc9, 0xbae1ff, 0xe6b3ff, 0xcccccc];
            const isCyber = Math.random() > 0.7;
            const material = new THREE.MeshPhongMaterial({
                color: isCyber ? CONFIG.colors.cyan : colors[Math.floor(Math.random() * colors.length)],
                specular: 0xffffff,
                shininess: 100,
                reflectivity: 1,
                wireframe: isCyber,
                emissive: isCyber ? 0x003322 : 0x000000
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.userData.isY2KObject = true;
            return mesh;
        }

        function getNonOverlappingPosition(boxes, w, h, scale, isPrimary, attempt = 0) {
            let nz = isPrimary ? (CONFIG.collage.depth.primaryMax - Math.random() * (CONFIG.collage.depth.primaryMax - CONFIG.collage.depth.primaryMin)) : (CONFIG.collage.depth.secondaryMax - Math.random() * (CONFIG.collage.depth.secondaryMax - CONFIG.collage.depth.secondaryMin));
            const ww = window.innerWidth;
            const wh = window.innerHeight;
            let cameraZ = getCameraZ(ww);

            const distance = cameraZ - nz;
            const frustumHeight = 2 * distance * Math.tan((CONFIG.collage.frustumFov / 2) * (Math.PI / 180));
            const frustumWidth = frustumHeight * (ww / wh);

            const itemW = w * scale;
            const itemH = h * scale;

            let maxX = (frustumWidth / 2) - (itemW / 2) - 0.2;
            let maxY = (frustumHeight / 2) - (itemH / 2) - 0.2;
            const safeMaxX = Math.max(0, maxX);
            const safeMaxY = Math.max(0, maxY);

            if (attempt > CONFIG.collage.maxPlacementAttempts) {
                return { x: (Math.random() - 0.5) * 2 * safeMaxX, y: (Math.random() - 0.5) * 2 * safeMaxY, z: nz };
            }

            let nx = (Math.random() - 0.5) * 2 * safeMaxX;
            let ny = (Math.random() - 0.5) * 2 * safeMaxY;

            if (Math.abs(nx) < CONFIG.collage.exclusionZone.x && Math.abs(ny) < CONFIG.collage.exclusionZone.y) {
                return getNonOverlappingPosition(boxes, w, h, scale, isPrimary, attempt + 1);
            }

            let overlap = false;
            for (let b of boxes) {
                if (Math.abs(nx - b.x) < (itemW + b.w) / 2 * CONFIG.collage.overlapFactor &&
                    Math.abs(ny - b.y) < (itemH + b.h) / 2 * CONFIG.collage.overlapFactor) {
                    overlap = true;
                    break;
                }
            }

            if (overlap) return getNonOverlappingPosition(boxes, w, h, scale, isPrimary, attempt + 1);

            return { x: nx, y: ny, z: nz };
        }

        function createCollageBackground(sectionKey) {
            let placedBoxes = [];
            collageItems.forEach(item => scene.remove(item));
            collageItems = [];

            const availableImages = sectionImages[sectionKey] || sectionImages['home'];
            let uniqueAvailable = [...new Set(availableImages)];
            let shuffledAssets = [...globalAssets].sort(() => Math.random() - 0.5);
            shuffledAssets = shuffledAssets.filter(img => !uniqueAvailable.includes(img));
            let mixedImages = [...uniqueAvailable, ...shuffledAssets];

            let imageIndex = 0;
            for (let i = 0; i < CONFIG.collage.totalItems; i++) {
                let mesh;
                if (Math.random() > 0.8 || imageIndex >= mixedImages.length) {
                    mesh = createLiquidMetalGeometry();
                } else {
                    const texUrl = mixedImages[imageIndex];
                    imageIndex++;
                    const isPrimary = uniqueAvailable.includes(texUrl);
                    const w = isPrimary ? (3.0 + Math.random() * 1.5) : (2.0 + Math.random() * 1.5);
                    const h = w * (0.7 + Math.random() * 0.5);
                    const geometry = new THREE.PlaneGeometry(w, h);

                    const material = new THREE.MeshStandardMaterial({
                        color: 0xffffff, side: THREE.DoubleSide, roughness: 0.4, metalness: 0.1, emissive: 0x111111
                    });

                    loadTextureSafe(texUrl, (tex) => {
                        tex.colorSpace = THREE.SRGBColorSpace;
                        material.map = tex; material.needsUpdate = true;
                    });

                    mesh = new THREE.Mesh(geometry, material);
                    mesh.userData.isY2KObject = false;
                    mesh.userData.isPrimary = isPrimary;
                    mesh.userData.w = w;
                    mesh.userData.h = h;
                }

                mesh.receiveShadow = true; mesh.castShadow = true;
                randomizeMeshTransform(mesh, placedBoxes);
                scene.add(mesh);
                collageItems.push(mesh);
            }
        }

        function updateCollageForSection(sectionKey) {
            const availableImages = sectionImages[sectionKey] || sectionImages['home'];
            let uniqueAvailable = [...new Set(availableImages)];
            let shuffledAssets = [...globalAssets].sort(() => Math.random() - 0.5);
            shuffledAssets = shuffledAssets.filter(img => !uniqueAvailable.includes(img));
            let mixedImages = [...uniqueAvailable, ...shuffledAssets];

            let imageIndex = 0;
            let placedBoxes = [];
            collageItems.forEach((mesh) => {
                if (mesh.userData.isY2KObject) {
                    mesh.visible = true;
                    const nx = (Math.random() - 0.5) * 30;
                    const ny = (Math.random() - 0.5) * 20;
                    const nz = -4 - (Math.random() * 10);
                    const nScale = 0.6 + Math.random() * 1.4;
                    mesh.userData.originalScale = nScale;
                    const dur = prefersReducedMotion ? 0 : 1.6;
                    gsap.to(mesh.position, { x: nx, y: ny, z: nz, duration: dur, ease: "power2.inOut" });
                    gsap.to(mesh.scale, { x: nScale, y: nScale, z: nScale, duration: dur, ease: "power2.inOut" });
                    gsap.to(mesh.rotation, { x: Math.random() * Math.PI * 2, y: Math.random() * Math.PI * 2, z: Math.random() * Math.PI * 2, duration: dur, ease: "power2.inOut" });
                } else {
                    const texUrl = mixedImages[imageIndex];
                    if (!texUrl) { mesh.visible = false; return; }
                    mesh.visible = true;
                    imageIndex++;
                    const isPrimary = uniqueAvailable.includes(texUrl);
                    mesh.userData.isPrimary = isPrimary;

                    const wMultiplier = (window.innerWidth <= 600) ? 0.5 : (window.innerWidth <= 1024 ? 0.75 : 1.0);
                    const nScale = (isPrimary ? (1.0 + Math.random() * 0.4) : (0.6 + Math.random() * 0.4)) * wMultiplier;
                    mesh.userData.originalScale = nScale;
                    const pos = getNonOverlappingPosition(placedBoxes, mesh.userData.w, mesh.userData.h, nScale, isPrimary);
                    placedBoxes.push({ x: pos.x, y: pos.y, w: mesh.userData.w * nScale, h: mesh.userData.h * nScale });

                    const dur = prefersReducedMotion ? 0 : 1.6;
                    gsap.to(mesh.position, { x: pos.x, y: pos.y, z: pos.z, duration: dur, ease: "power2.inOut" });
                    gsap.to(mesh.scale, { x: nScale, y: nScale, z: nScale, duration: dur, ease: "power2.inOut" });
                    const rotZ = isPrimary ? 0 : ((Math.random() - 0.5) * 0.2);
                    gsap.to(mesh.rotation, { x: 0, y: 0, z: rotZ, duration: dur });

                    loadTextureSafe(texUrl, (tex) => {
                        tex.colorSpace = THREE.SRGBColorSpace;
                        mesh.material.map = tex; mesh.material.needsUpdate = true;
                    });
                }
            });
        }

        function randomizeMeshTransform(mesh, placedBoxes = []) {
            if (mesh.userData.isY2KObject) {
                mesh.position.set((Math.random() - 0.5) * 30, (Math.random() - 0.5) * 20, -4 - (Math.random() * 10));
                const sc = 0.6 + Math.random() * 1.4;
                mesh.userData.originalScale = sc;
                mesh.scale.set(sc, sc, sc);
                mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
            } else {
                const isPrimary = mesh.userData.isPrimary;
                const wMultiplier = (window.innerWidth <= CONFIG.breakpoints.mobile) ? CONFIG.collage.scale.viewportFactors.mobile : (window.innerWidth <= CONFIG.breakpoints.tablet ? CONFIG.collage.scale.viewportFactors.tablet : CONFIG.collage.scale.viewportFactors.desktop);
                const sc = (isPrimary ? (CONFIG.collage.scale.primaryBase + Math.random() * CONFIG.collage.scale.primaryVariance) : (CONFIG.collage.scale.secondaryBase + Math.random() * CONFIG.collage.scale.secondaryVariance)) * wMultiplier;
                mesh.userData.originalScale = sc;
                const pos = getNonOverlappingPosition(placedBoxes, mesh.userData.w, mesh.userData.h, sc, isPrimary);
                placedBoxes.push({ x: pos.x, y: pos.y, w: mesh.userData.w * sc, h: mesh.userData.h * sc });

                mesh.position.set(pos.x, pos.y, pos.z);
                mesh.scale.set(sc, sc, sc);
                mesh.rotation.set(0, 0, isPrimary ? 0 : ((Math.random() - 0.5) * 0.2));
            }
        }

        function createPhoneY2K() {
            phoneGroup = new THREE.Group();
            const { width: bodyWidth, height: bodyHeight, depth: bodyDepth, screenScale, zOffset, radius, smoothness, bezelInset, bezelDepth, floatingZ, charms } = CONFIG.phone;

            const chassisGeo = new RoundedBoxGeometry(bodyWidth, bodyHeight, bodyDepth, smoothness, radius);
            const chassisMat = new THREE.MeshStandardMaterial({ color: CONFIG.colors.chassis, roughness: 0.08, metalness: 1.0 });
            const chassis = new THREE.Mesh(chassisGeo, chassisMat);
            chassis.castShadow = true; chassis.receiveShadow = true;

            const bezelGeo = new RoundedBoxGeometry(bodyWidth - bezelInset, bodyHeight - bezelInset, bezelDepth, smoothness / 2, radius / 2);
            const bezelMat = new THREE.MeshStandardMaterial({ color: CONFIG.colors.ink, roughness: 0.1, metalness: 0.8 });
            const bezel = new THREE.Mesh(bezelGeo, bezelMat);
            bezel.position.z = (bodyDepth / 2);

            phoneGroup.add(chassis); phoneGroup.add(bezel);

            const gemMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0, transmission: 0.9, thickness: 1.2, ior: 1.5 });
            const heartGeo = new THREE.OctahedronGeometry(0.35, 0);
            const heart1 = new THREE.Mesh(heartGeo, gemMat);
            heart1.position.set(-1.3, 3.1, (bodyDepth / 2) + 0.08);
            phoneGroup.add(heart1);

            const starGeo = new THREE.ConeGeometry(0.3, 0.2, 5);
            const star1 = new THREE.Mesh(starGeo, new THREE.MeshStandardMaterial({ color: CONFIG.colors.lightPink, metalness: 0.8, roughness: 0.2 }));
            star1.position.set(1.3, 3.2, (bodyDepth / 2) + 0.08);
            star1.rotation.x = Math.PI / 2;
            phoneGroup.add(star1);

            charmGroup = new THREE.Group();
            charmGroup.position.set(bodyWidth / 2 - 0.1, -bodyHeight / 2 + 0.5, 0);

            const beadMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.05, metalness: 0.9 });
            const crystalBeadMat = new THREE.MeshPhysicalMaterial({ color: CONFIG.colors.lightPink, roughness: 0, transmission: 0.9, thickness: 0.8 });

            let prevY = 0;
            for (let i = 0; i < charms.count; i++) {
                const isCrystal = i % 2 === 0;
                const bGeo = isCrystal ? new THREE.SphereGeometry(charms.beadSize, 16, 16) : new THREE.BoxGeometry(charms.boxSize, charms.boxSize, charms.boxSize);
                const bMesh = new THREE.Mesh(bGeo, isCrystal ? crystalBeadMat : beadMat);
                bMesh.position.set(Math.sin(i * 0.6) * 0.15, prevY - charms.spacing, Math.cos(i * 0.4) * 0.1);
                prevY = bMesh.position.y;
                charmGroup.add(bMesh);
            }
            phoneGroup.add(charmGroup);

            document.getElementById('phone-ui').style.display = 'block';
            const screenElement = document.getElementById('phone-screen');
            const cssObject = new CSS3DObject(screenElement);
            cssObject.scale.set(screenScale, screenScale, screenScale);
            cssObject.position.set(0, 0, (bodyDepth / 2) + zOffset);

            phoneGroup.add(cssObject);
            phoneGroup.position.z = floatingZ;
            scene.add(phoneGroup);
        }

        function adjustCameraForDevice() {
            if (!camera) return;
            camera.position.z = getCameraZ(window.innerWidth);
        }

        function onWindowResize3D() {
            if (!mode3dInitialized) return;
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            webglRenderer.setSize(window.innerWidth, window.innerHeight);
            cssRenderer.setSize(window.innerWidth, window.innerHeight);
            adjustCameraForDevice();
        }
        window.addEventListener('resize', onWindowResize3D);

        function animate3D() {
            if (!mode3dRunning) return;
            requestAnimationFrame(animate3D);
            const time = Date.now() * 0.001;

            if (phoneGroup && !prefersReducedMotion) {
                phoneGroup.position.y = Math.sin(time) * 0.12;
                if (charmGroup) charmGroup.rotation.z = Math.sin(time * 2) * 0.15;
            }

            if (!prefersReducedMotion) {
                collageItems.forEach((mesh, i) => {
                    mesh.position.y += Math.sin(time + i) * 0.002;
                    if (mesh.userData.isY2KObject) {
                        mesh.rotation.x += 0.005; mesh.rotation.y += 0.008;
                    }
                });
            }

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(collageItems);

            if (intersects.length > 0) {
                const object = intersects[0].object;
                if (hoveredMesh !== object) {
                    if (hoveredMesh) {
                        gsap.to(hoveredMesh.scale, {
                            x: hoveredMesh.userData.originalScale, y: hoveredMesh.userData.originalScale, z: hoveredMesh.userData.originalScale, duration: 0.3
                        });
                        hoveredMesh.material.emissive.setHex(hoveredMesh.userData.originalEmissive || 0x000000);
                    }
                    hoveredMesh = object;
                    document.body.style.cursor = 'crosshair';

                    if (!hoveredMesh.userData.originalScale) hoveredMesh.userData.originalScale = hoveredMesh.scale.x;
                    if (hoveredMesh.userData.originalEmissive === undefined) hoveredMesh.userData.originalEmissive = hoveredMesh.material.emissive.getHex();

                    gsap.to(hoveredMesh.scale, {
                        x: hoveredMesh.userData.originalScale * 1.15, y: hoveredMesh.userData.originalScale * 1.15, z: hoveredMesh.userData.originalScale * 1.15,
                        duration: 0.4, ease: "back.out(2)"
                    });

                    if (hoveredMesh.userData.isY2KObject) hoveredMesh.material.emissive.setHex(CONFIG.colors.emissiveY2K);
                    else hoveredMesh.material.emissive.setHex(CONFIG.colors.emissiveHover);
                }
            } else {
                if (hoveredMesh) {
                    gsap.to(hoveredMesh.scale, {
                        x: hoveredMesh.userData.originalScale, y: hoveredMesh.userData.originalScale, z: hoveredMesh.userData.originalScale, duration: 0.3
                    });
                    hoveredMesh.material.emissive.setHex(hoveredMesh.userData.originalEmissive || 0x000000);
                    hoveredMesh = null;
                    document.body.style.cursor = 'default';
                }
            }
            webglRenderer.render(scene, camera);
            cssRenderer.render(scene, camera);
        }

        function startMode3D() { initMode3D(); mode3dRunning = true; onWindowResize3D(); animate3D(); }
        function stopMode3D() { mode3dRunning = false; }


// --- CLASSIC SCENE 3D ---
        // CLASSIC MODE - ACTUALIZADO PARA DEJAR EL CENTRO LIBRE
        // ============================================================
        let classicScene, classicCamera, classicRenderer, classicShapes = [];
        let classicRunning = false;
        let classicInitialized = false;

        function initClassicBg() {
            if (classicInitialized) return;
            classicInitialized = true;

            const canvas = document.getElementById('classic-bg-canvas');
            classicScene = new THREE.Scene();
            classicCamera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
            classicCamera.position.z = 18;

            classicRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
            classicRenderer.setSize(window.innerWidth, window.innerHeight);
            classicRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

            const light = new THREE.DirectionalLight(0xffffff, 2);
            light.position.set(4, 6, 10);
            classicScene.add(light);
            classicScene.add(new THREE.AmbientLight(0xffffff, 0.6));

            const geos = [
                new THREE.IcosahedronGeometry(1, 0),
                new THREE.OctahedronGeometry(1, 0),
                new THREE.TorusGeometry(0.7, 0.25, 12, 24)
            ];
            const colors = [CONFIG.colors.cyan, CONFIG.colors.pink, 0xffffff];

            for (let i = 0; i < 16; i++) {
                const geo = geos[i % geos.length];
                const mat = new THREE.MeshStandardMaterial({
                    color: colors[i % colors.length],
                    wireframe: i % 3 === 0,
                    roughness: 0.4,
                    metalness: 0.3,
                    transparent: true,
                    opacity: 0.6
                });
                const mesh = new THREE.Mesh(geo, mat);

                const side = i % 2 === 0 ? -1 : 1;
                const xPos = side * (9 + Math.random() * 13);

                mesh.position.set(xPos, (Math.random() - 0.5) * 20, -4 - Math.random() * 8);

                const sc = 0.6 + Math.random() * 1.0;
                mesh.scale.set(sc, sc, sc);
                mesh.userData.speed = 0.05 + Math.random() * 0.1;
                mesh.userData.offset = Math.random() * Math.PI * 2;
                classicScene.add(mesh);
                classicShapes.push(mesh);
            }
            window.addEventListener('resize', onClassicResize);
        }

        function onClassicResize() {
            if (!classicInitialized) return;
            classicCamera.aspect = window.innerWidth / window.innerHeight;
            classicCamera.updateProjectionMatrix();
            classicRenderer.setSize(window.innerWidth, window.innerHeight);
        }

        function animateClassic() {
            if (!classicRunning) return;
            requestAnimationFrame(animateClassic);
            if (!prefersReducedMotion) {
                const t = Date.now() * 0.001;
                classicShapes.forEach((m) => {
                    m.rotation.x += m.userData.speed * 0.01;
                    m.rotation.y += m.userData.speed * 0.015;
                    m.position.y += Math.sin(t + m.userData.offset) * 0.003;
                });
            }
            classicRenderer.render(classicScene, classicCamera);
        }

        function startClassicMode() { initClassicBg(); classicRunning = true; onClassicResize(); animateClassic(); }
        function stopClassicMode() { classicRunning = false; }


// --- EXPORTED CLASSES ---

export class PlayerCharacter3D {
    static init() {
        initPlayerCharacter();
    }
}

export class PixelTrail {
    static init() {
        resizeTrailCanvas();
        window.addEventListener('resize', resizeTrailCanvas);
        animatePixels();
    }
    static addPixel(x, y) {
        addPixel(x, y);
    }
}

export class PhoneScene3D {
    static start() {
        startMode3D();
    }
    static stop() {
        stopMode3D();
    }
    static updateCollage(sectionKey) {
        updateCollageForSection(sectionKey);
    }
}

export class ClassicScene3D {
    static start() {
        startClassicMode();
    }
    static stop() {
        stopClassicMode();
    }
}
