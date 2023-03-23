import { useState, useEffect, useMemo, Suspense } from "react";
import { useAppSelector } from "app/hooks";
import { useLoader, useFrame } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls, useProgress, Html } from "@react-three/drei";
import { selectCurrentMediaRunning } from "app/mediaRunning/mediaRunning";
import { Canvas } from "@react-three/fiber";
import { BiFullscreen } from "react-icons/bi";
import { IconButton } from "@mui/material";
import NcModal from "shared/NcModal/NcModal";
import * as THREE from 'three';

const Loader = () => {
  const { active, progress, errors, item, loaded, total } = useProgress();
  return <Html className="" center>{progress} % loaded</Html>;
}

const ThreeDForNft = ({ src = '', isPlay = false }) => {
  let mixer;
  // Here's the animation part
  // ************************* 
  let materials, scene, animations;
  useEffect(() => {
    if (animations?.length) {
      mixer = new THREE.AnimationMixer(scene);
      animations.forEach(clip => {
        const action = mixer.clipAction(clip)
        action.play();
      });
    }
  }, [animations])

  useFrame((state, delta) => {
    if (mixer) {
      mixer?.update(delta);
    }
  })

  useMemo(() => {
    // scene.scale.x = 6;
    if (scene) {
      scene.position.y = -0.5;
      scene.position.x = 0.0;
      // scene.scale.z = 6;
      for (const material in materials) {
        // iterate the materials
        if (Object.prototype.hasOwnProperty.call(materials, material)) {
          // change the color of all the materials (there's only one in this model)
          materials[material].color.set("#bb6f3e");

          // you can also change the color of a specific material if you know the name of the material
        }
      }
    }

  }, [materials, scene]);

  try {
    const geometry = useLoader(GLTFLoader, src);
    if (!isPlay) {
      return <></>
    }
    materials = geometry.materials;
    scene = geometry.scene;
    animations = geometry.animations;
  } catch (err) {
    console.log(err);
    return <></>
  }

  return (
    <>
      <ambientLight intensity={0.6} color={"0xffffff"} />
      <pointLight position={[10, 10, 10]} />

      <Suspense fallback={null}>
        <primitive object={scene} />
      </Suspense>

      <OrbitControls />
    </>
  )
};


const NFT3Canvas = (
  {
    nftId,
    className = "absolute inset-0 z-20 flex items-center justify-center bg-neutral-700 rounded-3xl overflow-hidden",
    src = "./",
  }
) => {
  const [show, setShow] = useState(false);
  const currentMediaRunning = useAppSelector(selectCurrentMediaRunning);
  const IS_PLAY =
    currentMediaRunning.nftId === nftId &&
    currentMediaRunning.state === "playing";

  if (!IS_PLAY)
    return <></>

  const renderContent = (newClass = "", content = true) => {
    return (
      <div
        className={`${className} ${newClass} ${IS_PLAY ? "" : "opacity-0 z-[-1]"}`}
      >
        <Canvas camera={{
          position: [0, 0, 2], fov: 55
        }} className={`${className}`}>
          {content && (
            <ThreeDForNft src={src} isPlay={IS_PLAY} />
          )}
        </Canvas>
      </div>
    )
  }

  return (
    <>
      {renderContent("", !show)}
      <IconButton className="!absolute right-3 top-3 z-20 !bg-black/50" onClick={() => setShow(true)}>
        <BiFullscreen size={23} />
      </IconButton>
      <NcModal
        isOpenProp={show}
        onCloseModal={() => setShow(false)}
        contentPaddingClass="w-full h-full py-4 px-6 md:py-5"
        contentExtraClass="max-w-4xl w-full aspect-[4/3]"
        renderContent={() => renderContent("w-full h-full relative")}
        renderTrigger={() => null}
        isHeader={false}
      />
    </>
  )
}
export default NFT3Canvas;