interface RubElHizbProps {
  className?: string;
  color?: string;
}

export const RubElHizb = ({ className = "", color = "currentColor" }: RubElHizbProps) => {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background circle for solid fill */}
      <circle cx="50" cy="50" r="48" fill={color} />
      
      {/* First square */}
      <rect
        x="15"
        y="15"
        width="70"
        height="70"
        fill="none"
        stroke="white"
        strokeWidth="2"
        transform="rotate(45 50 50)"
      />
      
      {/* Second square rotated 45 degrees */}
      <rect
        x="15"
        y="15"
        width="70"
        height="70"
        fill="none"
        stroke="white"
        strokeWidth="2"
      />
      
      {/* Central octagonal core */}
      <circle
        cx="50"
        cy="50"
        r="12"
        fill="white"
      />
      
      {/* Eight points */}
      <circle cx="50" cy="5" r="4" fill="white" />
      <circle cx="50" cy="95" r="4" fill="white" />
      <circle cx="5" cy="50" r="4" fill="white" />
      <circle cx="95" cy="50" r="4" fill="white" />
      <circle cx="15" cy="15" r="4" fill="white" />
      <circle cx="85" cy="15" r="4" fill="white" />
      <circle cx="15" cy="85" r="4" fill="white" />
      <circle cx="85" cy="85" r="4" fill="white" />
    </svg>
  );
};
