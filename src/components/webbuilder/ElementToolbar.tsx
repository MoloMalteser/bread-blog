import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Type, Image, Square, Circle, MousePointer, FileText } from 'lucide-react';
import { useUserRoles } from '@/hooks/useUserRoles';

interface ElementToolbarProps {
  onAddElement: (type: string) => void;
}

const ElementToolbar: React.FC<ElementToolbarProps> = ({ onAddElement }) => {
  const { isAdmin } = useUserRoles();
  
  const elementTypes = [
    { type: 'text', icon: Type, label: 'Text', color: 'bg-blue-500' },
    { type: 'image', icon: Image, label: 'Bild', color: 'bg-green-500' },
    { type: 'button', icon: MousePointer, label: 'Button', color: 'bg-purple-500' },
    { type: 'container', icon: Square, label: 'Container', color: 'bg-orange-500' },
    ...(isAdmin() ? [{ type: 'blog', icon: FileText, label: 'Blog Artikel', color: 'bg-red-500' }] : [])
  ];

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Plus className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Elemente hinzufügen</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {elementTypes.map((element) => {
            const IconComponent = element.icon;
            return (
              <Button
                key={element.type}
                variant="outline"
                className="h-20 flex flex-col gap-2 hover:bg-accent/50 transition-all duration-200"
                onClick={() => onAddElement(element.type)}
              >
                <div className={`p-2 rounded-lg ${element.color} text-white`}>
                  <IconComponent className="h-6 w-6" />
                </div>
                <span className="text-xs font-medium">{element.label}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ElementToolbar;