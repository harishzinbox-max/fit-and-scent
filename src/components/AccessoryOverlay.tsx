"use client";

interface Landmark {
  x: number;
  y: number;
}

interface Props {
  image: HTMLImageElement;
  landmarks: Landmark[];
  accessory: "none" | "glasses-round" | "glasses-square" | "earrings";
}

// MediaPipe Face Mesh eye-corner indices (see face_mesh.md landmark map).
const EYE = {
  rightOuter: 33,
  rightInner: 133,
  leftInner: 362,
  leftOuter: 263,
  earLeft: 234,
  earRight: 454,
  earLobeY: 401,
};

export default function AccessoryOverlay({ image, landmarks, accessory }: Props) {
  if (accessory === "none" || landmarks.length === 0) {
    return <img src={image.src} alt="Your photo" className="result-photo" />;
  }

  const rightOuter = landmarks[EYE.rightOuter];
  const leftOuter = landmarks[EYE.leftOuter];
  const rightInner = landmarks[EYE.rightInner];
  const leftInner = landmarks[EYE.leftInner];

  const eyeSpan = Math.hypot(leftOuter.x - rightOuter.x, leftOuter.y - rightOuter.y);
  const centerX = (leftOuter.x + rightOuter.x) / 2;
  const centerY = (leftOuter.y + rightOuter.y) / 2;
  const bridgeY = (rightInner.y + leftInner.y) / 2;

  const glassesWidth = eyeSpan * 1.35;
  const glassesHeight = glassesWidth * 0.42;

  const earLeft = landmarks[EYE.earLeft];
  const earRight = landmarks[EYE.earRight];
  const lobeY = landmarks[EYE.earLobeY]?.y ?? centerY + eyeSpan;

  return (
    <div className="overlay-wrap">
      <img src={image.src} alt="Your photo" className="result-photo" />
      <svg
        className="overlay-svg"
        viewBox={`0 0 ${image.width} ${image.height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {(accessory === "glasses-round" || accessory === "glasses-square") && (
          <g stroke="#2b2320" strokeWidth={glassesWidth * 0.035} fill="none" opacity={0.92}>
            {accessory === "glasses-round" ? (
              <>
                <ellipse cx={centerX - glassesWidth * 0.28} cy={bridgeY} rx={glassesWidth * 0.22} ry={glassesHeight / 2} />
                <ellipse cx={centerX + glassesWidth * 0.28} cy={bridgeY} rx={glassesWidth * 0.22} ry={glassesHeight / 2} />
              </>
            ) : (
              <>
                <rect
                  x={centerX - glassesWidth * 0.5}
                  y={bridgeY - glassesHeight / 2}
                  width={glassesWidth * 0.44}
                  height={glassesHeight}
                  rx={glassesHeight * 0.15}
                />
                <rect
                  x={centerX + glassesWidth * 0.06}
                  y={bridgeY - glassesHeight / 2}
                  width={glassesWidth * 0.44}
                  height={glassesHeight}
                  rx={glassesHeight * 0.15}
                />
              </>
            )}
            <line
              x1={centerX - glassesWidth * 0.06}
              y1={bridgeY}
              x2={centerX + glassesWidth * 0.06}
              y2={bridgeY}
            />
          </g>
        )}
        {accessory === "earrings" && (
          <g fill="#c9a15c" opacity={0.95}>
            <circle cx={earRight.x} cy={lobeY} r={eyeSpan * 0.05} />
            <circle cx={earLeft.x} cy={lobeY} r={eyeSpan * 0.05} />
          </g>
        )}
      </svg>
    </div>
  );
}
