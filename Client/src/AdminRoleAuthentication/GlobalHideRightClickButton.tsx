import React, { useEffect } from 'react';

const GlobalEventHandler: React.FC = () => {
  useEffect(() => {
    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.keyCode === 123) {
        event.preventDefault();
      }
      if (event.ctrlKey && event.shiftKey && event.keyCode === 73) {
        event.preventDefault();
      }
      if (event.ctrlKey && event.keyCode === 85) {
        event.preventDefault();
      }
    };

    const detectDevTools = () => {
      const threshold = 160;
      let widthThreshold = window.outerWidth - window.innerWidth > threshold;
      let heightThreshold = window.outerHeight - window.innerHeight > threshold;

      if (widthThreshold || heightThreshold) {
        alert('Developer tools detected!');
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    const interval = setInterval(detectDevTools, 1000);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      clearInterval(interval);
    };
  }, []);

  return null;
};

export default GlobalEventHandler;
