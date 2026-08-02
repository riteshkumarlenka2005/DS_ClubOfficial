import React from 'react';

/**
 * MetallicRibbedBackground — A CSS-based background that perfectly matches 
 * the metallic silver vertical ribbed image with the horizontal shadow band.
 */
const LightTunnelBackground: React.FC = () => {
  return (
    <div
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{
        zIndex: 0,
        backgroundColor: '#606060',
        backgroundImage: `
          /* Layer 1: Horizontal lighting (Shadow in the middle, highlights on top/bottom) */
          linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.7) 0%,
            rgba(200, 200, 200, 0.3) 15%,
            rgba(30, 30, 30, 0.8) 35%,
            rgba(20, 20, 20, 0.95) 50%,
            rgba(30, 30, 30, 0.8) 65%,
            rgba(200, 200, 200, 0.2) 85%,
            rgba(255, 255, 255, 0.5) 100%
          ),
          /* Layer 2: Macroscopic vertical grouping/waviness */
          repeating-linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.4) 0px,
            rgba(255, 255, 255, 0) 10px,
            rgba(0, 0, 0, 0.2) 20px,
            rgba(255, 255, 255, 0) 30px,
            rgba(0, 0, 0, 0.5) 40px,
            rgba(255, 255, 255, 0.2) 50px
          ),
          /* Layer 3: Fine metallic ribbed texture */
          repeating-linear-gradient(
            90deg,
            #e5e5e5 0px,
            #ffffff 1px,
            #999999 2px,
            #cccccc 4px,
            #333333 5px,
            #eeeeee 7px,
            #ffffff 8px,
            #777777 9px,
            #bbbbbb 11px,
            #222222 13px,
            #dddddd 15px,
            #f9f9f9 16px,
            #666666 17px,
            #aaaaaa 19px,
            #111111 21px,
            #e5e5e5 23px
          )
        `,
      }}
    />
  );
};

export default LightTunnelBackground;
