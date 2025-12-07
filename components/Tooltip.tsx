import React, { useState, useRef, useLayoutEffect, ReactNode, FC } from 'react';
import ReactDOM from 'react-dom';

interface TooltipProps {
  children: React.ReactElement; // Expect a single React element
  content: ReactNode | string;
  delay?: number;
}

const Tooltip: FC<TooltipProps> = ({ children, content, delay = 300 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [triggerNode, setTriggerNode] = useState<HTMLElement | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(false);
  };

  const TooltipContentPortal: FC = () => {
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

    useLayoutEffect(() => {
      if (tooltipRef.current && triggerNode) {
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        const triggerRect = triggerNode.getBoundingClientRect();

        let top = triggerRect.top - tooltipRect.height - 8; // 8px offset above
        let left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;

        if (top < 8) { // if not enough space on top, show below
          top = triggerRect.bottom + 8;
        }
        if (left < 8) {
          left = 8;
        }
        if (left + tooltipRect.width > window.innerWidth - 8) {
          left = window.innerWidth - tooltipRect.width - 8;
        }
        setPosition({ top, left });
      }
    }, [triggerNode]);

    if (!triggerNode) return null;

    return ReactDOM.createPortal(
      <div
        id="fd-tooltip"
        ref={tooltipRef}
        className="fixed z-[999] px-3 py-1.5 text-sm font-medium text-white bg-gray-900 dark:bg-black rounded-lg shadow-lg animate-in fade-in-0 zoom-in-95"
        style={position ? { top: `${position.top}px`, left: `${position.left}px` } : { opacity: 0 }}
        role="tooltip"
      >
        {content}
      </div>,
      document.body
    );
  };

  const child = React.Children.only(children);

  const trigger = React.cloneElement(child, {
    ref: setTriggerNode,
    onMouseEnter: (e: React.MouseEvent) => {
      handleMouseEnter();
      child.props.onMouseEnter?.(e);
    },
    onMouseLeave: (e: React.MouseEvent) => {
      handleMouseLeave();
      child.props.onMouseLeave?.(e);
    },
    onFocus: (e: React.FocusEvent) => {
      handleMouseEnter();
      child.props.onFocus?.(e);
    },
    onBlur: (e: React.FocusEvent) => {
      handleMouseLeave();
      child.props.onBlur?.(e);
    },
    'aria-describedby': isVisible ? 'fd-tooltip' : undefined,
    title: '' // Explicitly remove title to prevent native tooltips
  });

  return (
    <>
      {trigger}
      {isVisible && content && <TooltipContentPortal />}
    </>
  );
};

export default Tooltip;
