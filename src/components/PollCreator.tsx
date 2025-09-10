import React, { useState } from 'react';
import { Plus, X, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface PollCreatorProps {
  onPollCreated: (title: string, options: string[]) => void;
  className?: string;
}

const PollCreator: React.FC<PollCreatorProps> = ({ onPollCreated, className = '' }) => {
  const [showCreator, setShowCreator] = useState(false);
  const [title, setTitle] = useState('');
  const [options, setOptions] = useState(['', '']);

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleCreate = () => {
    const validOptions = options.filter(opt => opt.trim().length > 0);
    if (title.trim() && validOptions.length >= 2) {
      onPollCreated(title.trim(), validOptions);
      setTitle('');
      setOptions(['', '']);
      setShowCreator(false);
    }
  };

  const canCreate = title.trim() && options.filter(opt => opt.trim().length > 0).length >= 2;

  if (!showCreator) {
    return (
      <div className={className}>
        <Button
          onClick={() => setShowCreator(true)}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <BarChart3 className="w-4 h-4" />
          Umfrage
        </Button>
      </div>
    );
  }

  return (
    <Card className={`p-4 space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="font-medium flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Umfrage erstellen
        </h3>
        <Button
          onClick={() => setShowCreator(false)}
          variant="ghost"
          size="sm"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <Input
        placeholder="Umfrage-Titel..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="font-medium"
      />

      <div className="space-y-2">
        {options.map((option, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground min-w-[20px]">{index + 1}.</span>
            <Input
              placeholder={`Option ${index + 1}`}
              value={option}
              onChange={(e) => updateOption(index, e.target.value)}
              className="flex-1"
            />
            {options.length > 2 && (
              <Button
                onClick={() => removeOption(index)}
                variant="ghost"
                size="sm"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <Button
          onClick={addOption}
          variant="ghost"
          size="sm"
          disabled={options.length >= 6}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Option hinzufügen
        </Button>

        <div className="flex gap-2">
          <Button
            onClick={() => setShowCreator(false)}
            variant="ghost"
            size="sm"
          >
            Abbrechen
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!canCreate}
            size="sm"
          >
            Erstellen
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default PollCreator;