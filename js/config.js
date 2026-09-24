/**
 * @file config.js
 * Centralización exhaustiva de constantes, geometrías, materiales y configuraciones.
 */
export const CONFIG = Object.freeze({
    breakpoints: Object.freeze({
        mobile: 600,
        tablet: 1024
    }),

    camera: Object.freeze({
        fov: 45,
        near: 0.1,
        far: 100,
        distance: Object.freeze({
            desktop: 16,
            tablet: 18,
            mobile: 24
        })
    }),

    phone: Object.freeze({
        width: 4.1,
        height: 8.2,
        depth: 0.45,
        radius: 0.4,
        smoothness: 8,
        bezelInset: 0.2,
        bezelDepth: 0.1,
        screenScale: 0.01,
        zOffset: 0.05,
        floatingZ: 3.0,
        floatAmplitude: 0.12,
        floatSpeed: 1.0,
        charms: Object.freeze({
            count: 9,
            spacing: 0.35,
            beadSize: 0.18,
            boxSize: 0.25
        })
    }),

    collage: Object.freeze({
        totalItems: 22,
        frustumFov: 45,
        exclusionZone: Object.freeze({ x: 4.5, y: 6.0 }),
        overlapFactor: 0.85,
        maxPlacementAttempts: 150,
        depth: Object.freeze({
            primaryMin: -2.0,
            primaryMax: -0.5,
            secondaryMin: -5.0,
            secondaryMax: -2.5
        }),
        scale: Object.freeze({
            primaryBase: 1.0,
            primaryVariance: 0.4,
            secondaryBase: 0.6,
            secondaryVariance: 0.4,
            viewportFactors: Object.freeze({
                mobile: 0.5,
                tablet: 0.75,
                desktop: 1.0
            })
        })
    }),

    colors: Object.freeze({
        ink: 0x050308,
        cyan: 0x00ffcc,
        pink: 0xff66b2,
        lightPink: 0xffb3d9,
        chassis: 0xf0e6ff,
        ambientLight: 0xffffff,
        emissiveHover: 0x003333,
        emissiveY2K: 0xff66b2
    }),

    render: Object.freeze({
        maxPixelRatio: 2,
        fogDensity: 0.035,
        shadowMapSize: 2048
    })
});

/**
 * Retorna la distancia Z óptima de la cámara según el ancho de viewport.
 * @param {number} width 
 * @returns {number}
 */
export function getCameraZ(width) {
    if (width <= CONFIG.breakpoints.mobile) return CONFIG.camera.distance.mobile;
    if (width <= CONFIG.breakpoints.tablet) return CONFIG.camera.distance.tablet;
    return CONFIG.camera.distance.desktop;
}
