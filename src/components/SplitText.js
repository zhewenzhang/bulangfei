import React, { useEffect, useRef, useState } from 'react';
import { Typography } from '@mui/material';

const SplitText = ({ 
  text = '', 
  delay = 100, 
  duration = 0.6, 
  variant = 'h1',
  sx = {},
  ...props 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    // 简化实现，直接显示动画
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const letters = text.split('');

  return (
    <Typography
      ref={containerRef}
      variant={variant}
      sx={{
        textAlign: 'center',
        fontWeight: 700,
        background: 'linear-gradient(45deg, #6366f1, #ec4899)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        mb: 2,
        ...sx
      }}
      {...props}
    >
      {letters.map((letter, index) => (
        <span
          key={index}
          style={{
            display: 'inline-block',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0px)' : 'translateY(40px)',
            transition: `all ${duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
            transitionDelay: isVisible ? `${index * delay}ms` : '0ms',
          }}
        >
          {letter === ' ' ? '\u00A0' : letter}
        </span>
      ))}
    </Typography>
  );
};

export default SplitText;