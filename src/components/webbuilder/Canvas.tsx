import React, { useRef, useCallback, useEffect } from 'react';
import { Card } from '@/components/ui/card';

interface Element {
  id: string;
  type: string;
  content: string;
  styles: {
    position: 'absolute';
    left: number;
    top: number;
    width: number;
    height: number;
    fontSize: number;
    color: string;
    backgroundColor: string;
    padding: number;
    borderRadius: number;
    fontWeight: 'normal' | 'bold';
    textAlign: 'left' | 'center' | 'right';
    zIndex: number;
  };
  props?: any;
}

interface CanvasProps {
  elements: Element[];
  selectedElement: Element | null;
  onElementClick: (element: Element) => void;
  onElementMove: (id: string, x: number, y: number) => void;
  dragMode: boolean;
  setDragMode: (mode: boolean) => void;
  draggedElement: string | null;
  setDraggedElement: (id: string | null) => void;
}

const Canvas: React.FC<CanvasProps> = ({
  elements,
  selectedElement,
  onElementClick,
  onElementMove,
  dragMode,
  setDragMode,
  draggedElement,
  setDraggedElement
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!dragMode || !draggedElement || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    onElementMove(draggedElement, Math.max(0, x - 75), Math.max(0, y - 20));
  }, [dragMode, draggedElement, onElementMove]);

  const handleMouseUp = useCallback(() => {
    setDragMode(false);
    setDraggedElement(null);
  }, [setDragMode, setDraggedElement]);

  useEffect(() => {
    if (dragMode) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleMouseMove);
      document.addEventListener('touchend', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleMouseMove);
        document.removeEventListener('touchend', handleMouseUp);
      };
    }
  }, [dragMode, handleMouseMove, handleMouseUp]);

  const renderElement = (element: Element) => {
    const { styles } = element;
    const isSelected = selectedElement?.id === element.id;
    
    const elementStyle = {
      position: styles.position as 'absolute',
      left: `${styles.left}px`,
      top: `${styles.top}px`,
      width: `${styles.width}px`,
      height: element.type === 'image' ? `${styles.height}px` : 'auto',
      minHeight: element.type !== 'image' ? `${styles.height}px` : undefined,
      fontSize: `${styles.fontSize}px`,
      color: styles.color,
      backgroundColor: styles.backgroundColor,
      padding: `${styles.padding}px`,
      borderRadius: `${styles.borderRadius}px`,
      fontWeight: styles.fontWeight,
      textAlign: styles.textAlign,
      zIndex: styles.zIndex,
      border: isSelected ? '2px dashed #007bff' : '1px solid transparent',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: styles.textAlign === 'center' ? 'center' : 'flex-start',
      overflow: 'hidden',
      userSelect: 'none' as const,
      transition: 'border 0.2s ease'
    };

    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
      e.stopPropagation();
      setDraggedElement(element.id);
      setDragMode(true);
    };

    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onElementClick(element);
    };

    const commonProps = {
      style: elementStyle,
      onClick: handleClick,
      onMouseDown: handleMouseDown,
      onTouchStart: handleMouseDown,
      className: `canvas-element ${isSelected ? 'selected' : ''}`
    };

    switch (element.type) {
      case 'text':
        return (
          <div key={element.id} {...commonProps}>
            {element.content || 'Text eingeben...'}
          </div>
        );
      case 'image':
        return (
          <img 
            key={element.id} 
            {...commonProps} 
            src={element.props?.src || 'https://via.placeholder.com/200x150?text=Bild'} 
            alt={element.props?.alt || 'Bild'} 
            style={{ ...elementStyle, objectFit: 'cover' }}
          />
        );
      case 'button':
        return (
          <button key={element.id} {...commonProps}>
            {element.content || 'Button'}
          </button>
        );
      case 'container':
        return (
          <div 
            key={element.id} 
            {...commonProps}
            style={{ 
              ...elementStyle, 
              border: isSelected ? '2px dashed #007bff' : '2px solid #e0e0e0',
              backgroundColor: styles.backgroundColor || '#f5f5f5'
            }}
          >
            {element.content || 'Container'}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 bg-gray-50 relative overflow-hidden">
      {/* Made with Bread Banner */}
      <div className="absolute top-4 left-4 z-50">
        <Card className="px-3 py-1 bg-primary text-primary-foreground shadow-lg">
          <span className="text-sm font-medium">🍞 Made with Bread</span>
        </Card>
      </div>

      {/* Canvas Area */}
      <div
        ref={canvasRef}
        className="relative w-full h-full min-h-[600px] bg-white mx-auto shadow-lg"
        style={{ 
          maxWidth: '1200px',
          background: 'linear-gradient(45deg, #f0f9ff 25%, transparent 25%), linear-gradient(-45deg, #f0f9ff 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f9ff 75%), linear-gradient(-45deg, transparent 75%, #f0f9ff 75%)',
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
        }}
        onClick={() => onElementClick(null as any)}
      >
        {elements.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <div className="text-6xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold mb-2">Willkommen im WebBuilder!</h3>
              <p className="text-sm">Klicke auf die Plus-Buttons, um Elemente hinzuzufügen</p>
            </div>
          </div>
        ) : (
          elements.map(element => renderElement(element))
        )}
        
        {/* Powered by Login in bottom right */}
        <div className="absolute bottom-4 right-4 z-50">
          <Card className="px-4 py-2 bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
            <span className="text-sm font-medium">🍞 Login with Bread</span>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Canvas;