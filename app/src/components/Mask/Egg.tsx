export default function EggMask({
  svgId,
  imgId,
  visible,
}: {
  svgId: string;
  imgId: string;
  visible: boolean;
}) {
  return (
    <svg
      id={svgId}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 216.03 216.03"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      style={{ display: visible ? "block" : "none" }}
    >
      <defs>
        <clipPath id={`clip-path-${svgId}`} transform="translate(56.67 29.81)">
          <path
            id="EGG"
            d="M109.45,96.27A54.73,54.73,0,1,1,0,96.27C0,66.05,24.5,0,54.72,0S109.45,66.05,109.45,96.27Z"
            fill="none"
          />
        </clipPath>
      </defs>
      <g id="Layer_2" data-name="Layer 2">
        <g id="SVG">
          <g clipPath={`url(#clip-path-${svgId})`}>
            <image
              id={imgId}
              width="451"
              height="451"
              transform="scale(0.48)"
              xlinkHref=""
            />
          </g>
        </g>
      </g>
    </svg>
  );
}
