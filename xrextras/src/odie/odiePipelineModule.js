let odiePipelineModule = null;

const create = (PIXI, ODIE, renderer) => {
    let sceneAR

    return {
        name: 'customodie',
        onStart: ({canvas, canvasWidth, canvasHeight, GLctx}) => {
            const view = new PIXI.Container();
            const camera = new ODIE.CameraEntity({
                // fov: 60.0,
                // near: 0.01,
                // far: 1000.0,
            });

            camera.position.set(0, 0, 0);

            const scene = new ODIE.Scene3D({
                renderer,
                stage: view,
                camera,
                shadows: true,
                culling: false,
            });
    
            scene.view3d.setCamera(camera);
            sceneAR = { scene, camera, renderer };

            // Hack
            window.xrOdieScene = sceneAR;
        },
        onUpdate: ({ processCpuResult }) => {
            if (!processCpuResult.reality) return;
            const { rotation, position, intrinsics } = processCpuResult.reality
            const { camera } = sceneAR

            for (let i = 0; i < 16; i++)
            {
                camera.camera.projection.elements[i] = intrinsics[i]
            }

            // Fix for broken raycasting in r103 and higher. Related to https://github.com/mrdoob/three.js/pull/15996
            // Note: camera.projectionMatrixInverse wasn't introduced until r96 so check before calling getInverse()
            if (camera.projectionMatrixInverse)
            {
                // camera.projectionMatrixInverse.getInverse(camera.projectionMatrix)
                camera.camera.projection.getInverse(camera.camera.projection);
            }

            if (rotation)
            {
                camera.transform.quat.set(rotation.x, rotation.y, rotation.z, rotation.w);
            }
            if (position)
            {
                camera.position.set(position.x, position.y, position.z);
            }
        },
        // onProcessCpu: ({frameStartResult}) => {
        //     const { cameraTexture } = frameStartResult

        //     window.xrCameraTexture = cameraTexture;
        // },
        onCanvasSizeChange: ({canvasWidth, canvasHeight}) => {
            // const {renderer} = scene3
            // renderer.setSize(canvasWidth, canvasHeight)
        },
        onRender: () => {
            // const {scene, renderer, camera} = sceneAR
            // renderer.clearDepth()
            // renderer.render(scene, camera)
        },
        // Get a handle to the xr scene, camera and renderer. Returns:
        // {
        //   scene: The Threejs scene.
        //   camera: The Threejs main camera.
        //   renderer: The Threejs renderer.
        // }
        xrScene: () => {
            return sceneAR
        },
    }
}

const OdiePipelineFactory = (PIXI, ODIE, renderer) => {
    if (odiePipelineModule === null)
    {
        odiePipelineModule = create(PIXI, ODIE, renderer);
    }

    return odiePipelineModule;
}

export {
    OdiePipelineFactory,
}