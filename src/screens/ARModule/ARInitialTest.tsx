import React, { useState, FunctionComponent, useEffect, useCallback } from 'react';
import { SafeAreaView, StatusBar, Button, View, Text, ViewProps, Image } from 'react-native';

import { EngineView, useEngine, EngineViewCallbacks } from '@babylonjs/react-native';
import { Scene, Vector3, ArcRotateCamera, Camera, WebXRSessionManager, SceneLoader, TransformNode, DeviceSourceManager, DeviceType, PointerInput, WebXRTrackingState, IMouseEvent, Mesh, VertexBuffer } from '@babylonjs/core';
import '@babylonjs/loaders';
import Slider from '@react-native-community/slider';

const EngineScreen: FunctionComponent<ViewProps> = (props: ViewProps) => {
  const defaultScale = 3.5;

  const engine = useEngine();
  const [camera, setCamera] = useState<Camera>();
  const [rootNode, setRootNode] = useState<TransformNode>();
  const [scene, setScene] = useState<Scene>();
  const [xrSession, setXrSession] = useState<WebXRSessionManager>();
  const [scale, setScale] = useState<number>(defaultScale);

  useEffect(() => {
    if (engine) {
      const scene = new Scene(engine);
      setScene(scene);
      scene.createDefaultCamera(true);
      (scene.activeCamera as ArcRotateCamera).beta -= Math.PI / 8;
      setCamera(scene.activeCamera!);
      scene.createDefaultLight(true);
      const rootNode = new TransformNode('Root Container', scene);
      setRootNode(rootNode);

      const deviceSourceManager = new DeviceSourceManager(engine);
      const handlePointerInput = (event: IMouseEvent) => {
        if (event.inputIndex === PointerInput.Move && event.movementX) {
          rootNode.rotate(Vector3.Down(), event.movementX * 0.005);
        }
      };

      deviceSourceManager.onDeviceConnectedObservable.add(device => {
        if (device.deviceType === DeviceType.Touch) {
          const touch = deviceSourceManager.getDeviceSource(device.deviceType, device.deviceSlot)!;
          touch.onInputChangedObservable.add(touchEvent => {
            handlePointerInput(touchEvent);
          });
        } else if (device.deviceType === DeviceType.Mouse) {
          const mouse = deviceSourceManager.getDeviceSource(device.deviceType, device.deviceSlot)!;
          mouse.onInputChangedObservable.add(mouseEvent => {
            if (mouse.getInput(PointerInput.LeftClick)) {
              handlePointerInput(mouseEvent);
            }
          });
        }
      });

      const transformContainer = new TransformNode('Transform Container', scene);
      transformContainer.parent = rootNode;
      transformContainer.scaling.scaleInPlace(0.2);
      // transformContainer.position.y -= .2;

      // scene.beforeRender = function () {
      //   transformContainer.rotate(Vector3.Up(), 0.005 * scene.getAnimationRatio());
      // };


      SceneLoader.ImportMesh('', 'https://dl.dropbox.com/s/ry6lm67ell7grwa/', '72.glb', scene, (newMeshes: any) => {
        for (let i = 0; i < newMeshes.length; i++) {
          const mesh = newMeshes[i];
          // mesh.forceSharedVertices();
        }

        if (scene.activeCamera) {
          scene.activeCamera.minZ = 0.1;
        }
        const mesh = newMeshes[0];
        mesh.parent = transformContainer;
      });
    }
  }, [engine]);

  useEffect(() => {
    if (rootNode) {
      rootNode.scaling = new Vector3(scale, scale, scale);
    }
  }, [rootNode, scale]);

  const trackingStateToString = (trackingState: WebXRTrackingState | undefined): string => {
    return trackingState === undefined ? '' : WebXRTrackingState[trackingState];
  };

  const onToggleXr = useCallback(() => {
    (async () => {
      if (xrSession) {
        await xrSession.exitXRAsync();
      } else {
        if (rootNode !== undefined && scene !== undefined) {
          const xr = await scene.createDefaultXRExperienceAsync({ disableDefaultUI: true, disableTeleportation: true })
          const session = await xr.baseExperience.enterXRAsync('immersive-ar', 'unbounded', xr.renderTarget);
          setXrSession(session);
          session.onXRSessionEnded.add(() => {
            setXrSession(undefined);
          })
          // TODO: Figure out why getFrontPosition stopped working
          // box.position = (scene.activeCamera as TargetCamera).getFrontPosition(2);
          const cameraRay = scene.activeCamera!.getForwardRay(1);
          rootNode.position = cameraRay.origin.add(cameraRay.direction.scale(cameraRay.length));
          rootNode.rotate(Vector3.Up(), 3.14159);
        }
      }
    })();
  }, [rootNode, scene, xrSession]);

  const onInitialized = useCallback(async (engineViewCallbacks: EngineViewCallbacks) => {
    console.log('onInitialized')
  }, [engine]);

  useEffect(() => {

  }, [])

  return (
    <>
      <View style={props.style}>
        <Button title={xrSession ? 'Stop XR' : 'Start XR'} onPress={onToggleXr} />
        <View style={{ flex: 1 }}>
          <EngineView camera={camera} onInitialized={onInitialized} displayFrameRate={false} />
          {/* @ts-ignore */}
          <Slider style={{ position: 'absolute', minHeight: 50, margin: 10, left: 0, right: 0, bottom: 0 }} minimumValue={0.2} maximumValue={7} step={0.01} value={defaultScale} onValueChange={setScale} />
        </View>
      </View>
    </>
  );
};

const App = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar barStyle="dark-content" />
      <EngineScreen style={{ flex: 1 }} />
    </SafeAreaView>
  );
};

export default App;
