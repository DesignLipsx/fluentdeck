import React, { useState, useRef, useEffect, ReactNode, FC } from 'react';
import ReactDOM from 'react-dom';

interface TooltipProps {
  // FIX: Allow any props on the child to simplify event handler access.
  children: React.ReactElement<any>;
  content: ReactNode | string;
  delay?: number;
}

const Tooltip: FC<TooltipProps> = ({ children, content, delay = 300 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setIsVisible(true), delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
    setIsVisible(false);
  };
  
  const setTriggerRef = (node: HTMLElement | null) => {
    triggerRef.current = node;
    // FIX: The 'ref' property is not part of the public ReactElement type.
    // We use a type assertion to access the child's ref for merging.
    const { ref } = children as { ref?: React.Ref<any> };
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      (ref as React.MutableRefObject<HTMLElement | null>).current = node;
    }
  };

  const TooltipContentPortal: FC = () => {
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

    useEffect(() => {
      if (tooltipRef.current && triggerRef.current) {
        const triggerRect = triggerRef.current.getBoundingClientRect();
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        
        const viewportWidth = document.documentElement.clientWidth;
        const offset = 20;

        let top = triggerRect.top - tooltipRect.height - offset;
        let left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);

        if (top < offset) {
          top = triggerRect.bottom + offset;
        }

        if (left < offset) {
          left = offset;
        } else if (left + tooltipRect.width > viewportWidth - offset) {
          left = viewportWidth - tooltipRect.width - offset;
        }
        
        setPosition({ top, left });
      }
    }, []);

    return ReactDOM.createPortal(
      <div
        id="fd-tooltip"
        ref={tooltipRef}
        className="fixed z-[999] px-3 py-1.5 text-sm font-medium text-black bg-gray-200 rounded-lg shadow-lg animate-in fade-in-0 zoom-in-95"
        style={position ? { top: `${position.top}px`, left: `${position.left}px` } : { opacity: 0 }}
        role="tooltip"
      >
        {content}
      </div>,
      document.body
    );
  };

  const child = React.Children.only(children);
  // FIX: Cast props to `any` to allow adding a `ref`, which is not a standard prop.
  // This is a common workaround for cloneElement with generic children in TypeScript.
  const trigger = React.cloneElement(child, {
    ref: setTriggerRef,
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
    title: ''
  } as any);

  return (
    <>
      {trigger}
      {isVisible && content && <TooltipContentPortal />}
    </>
  );
};

export default Tooltip;
