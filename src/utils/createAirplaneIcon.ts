import L from "leaflet";

export const createAirplaneIcon = (heading: number): L.DivIcon => {
  return L.divIcon({
    html: `
      <div style="
        transform: rotate(${heading}deg);
        transform-origin: center center;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        filter: drop-shadow(0 0 6px #010808);
      ">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#070d0d" width="24px" height="24px">
          <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
        </svg>
      </div>
    `,
    className: "custom-airplane-marker",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};
