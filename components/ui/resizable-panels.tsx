'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ResizablePanelsProps {
  children: ReactNode;
  className?: string;
  defaultSizes?: number[]; // Percentages for each panel
  minSizes?: number[]; // Minimum percentages
  onResize?: (sizes: number[]) => void;
}

export function ResizablePanels({
  children,
  className,
  defaultSizes = [25, 35, 40],
  minSizes = [15, 20, 30],
  onResize
}: ResizablePanelsProps) {
  const [sizes, setSizes] = useState<number[]>(defaultSizes);
  const [isDragging, setIsDragging] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const childrenArray = Array.isArray(children) ? children : [children];
  const panelCount = childrenArray.length;

  const handleMouseDown = (index: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(index);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging === null || !containerRef.current) return;

      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const mouseX = e.clientX - containerRect.left;
      const mousePercent = (mouseX / containerWidth) * 100;

      setSizes(prevSizes => {
        const newSizes = [...prevSizes];

        // Calculate the total size of panels before the dragged handle
        let totalBefore = 0;
        for (let i = 0; i <= isDragging; i++) {
          totalBefore += newSizes[i];
        }

        // Calculate how much the size changed
        const delta = mousePercent - totalBefore;

        // Apply the delta to the current panel and the next panel
        const newCurrentSize = newSizes[isDragging] + delta;
        const newNextSize = newSizes[isDragging + 1] - delta;

        // Check if the new sizes respect the minimum constraints
        if (
          newCurrentSize >= (minSizes[isDragging] || 10) &&
          newNextSize >= (minSizes[isDragging + 1] || 10)
        ) {
          newSizes[isDragging] = newCurrentSize;
          newSizes[isDragging + 1] = newNextSize;
        }

        onResize?.(newSizes);
        return newSizes;
      });
    };

    const handleMouseUp = () => {
      setIsDragging(null);
    };

    if (isDragging !== null) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, minSizes, onResize]);

  return (
    <div ref={containerRef} className={cn('flex h-full w-full', className)}>
      {childrenArray.map((child, index) => {
        const isLastPanel = index === panelCount - 1;
        return (
          <div key={index} className="flex" style={{ width: `${sizes[index]}%`, minWidth: 0 }}>
            <div className="flex-1 overflow-hidden">
              {child}
            </div>
            {!isLastPanel && (
              <div
                onMouseDown={handleMouseDown(index)}
                className={cn(
                  'w-1 cursor-col-resize flex-shrink-0',
                  'bg-[var(--color-bg-secondary)]',
                  'hover:bg-[var(--color-bg-brand)]',
                  'active:bg-[var(--color-bg-brand-secondary)]',
                  'transition-colors',
                  isDragging === index && 'bg-[var(--color-bg-brand)]'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
