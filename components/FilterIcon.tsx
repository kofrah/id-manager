import React from 'react';
import Svg, { Polyline, Rect } from 'react-native-svg';

interface FilterIconProps {
  size?: number;
  color?: string;
}

export const FilterIcon: React.FC<FilterIconProps> = ({ 
  size = 24, 
  color = '#000' 
}) => {
  return (
    <Svg 
      width={size} 
      height={size} 
      viewBox="0 0 48 48"
    >
      <Rect width="48" height="48" fill="none" />
      <Polyline
        points="6.33 7 20.01 24 20.01 42 28.01 37 28.01 24 27.99 24 41.99 7 15.01 7"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4"
      />
    </Svg>
  );
};