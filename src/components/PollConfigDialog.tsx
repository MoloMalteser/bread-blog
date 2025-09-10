import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Plus, X } from 'lucide-react';

interface PollConfigDialogProps {
  onPollCreated: (title: string, options: string[]) => void;
}

const PollConfigDialog: React.FC<PollConfigDialogProps> = ({ onPollCreated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [newOption, setNewOption] = useState('');

  const addOption = () => {
    if (newOption.trim() && options.length < 6) {
      setOptions([...options, newOption.trim()]);
      setNewOption('');
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const updatedOptions = [...options];
    updatedOptions[index] = value;
    setOptions(updatedOptions);
  };

  const handleCreate = () => {
    const validOptions = options.filter(opt => opt.trim());
    if (title.trim() && validOptions.length >= 2) {
      onPollCreated(title.trim(), validOptions);
      setIsOpen(false);
      // Reset form
      setTitle('');
      setOptions(['', '']);
      setNewOption('');
    }
  };

  const isValid = title.trim() && options.filter(opt => opt.trim()).length >= 2;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 p-0 rounded-lg hover:bg-background"
          title="Umfrage erstellen"
        >
          <BarChart3 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Umfrage erstellen</DialogTitle>
          <DialogDescription>
            Erstelle eine interaktive Umfrage für deinen Post. Nutzer können abstimmen und die Ergebnisse sehen.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="poll-title">Umfrage-Titel</Label>
            <Input
              id="poll-title"
              placeholder="z.B. Was ist dein Lieblings-Framework?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <Label>Antwortmöglichkeiten</Label>
            
            {options.map((option, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Badge variant="outline" className="px-2 py-1 text-xs min-w-fit">
                  {index + 1}
                </Badge>
                <Input
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                />
                {options.length > 2 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOption(index)}
                    className="h-9 w-9 p-0 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}

            {options.length < 6 && (
              <div className="flex gap-2 items-center">
                <Badge variant="outline" className="px-2 py-1 text-xs min-w-fit">
                  {options.length + 1}
                </Badge>
                <Input
                  placeholder="Weitere Option hinzufügen"
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addOption();
                    }
                  }}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={addOption}
                  disabled={!newOption.trim()}
                  className="h-9 w-9 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!isValid}
            >
              Umfrage erstellen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PollConfigDialog;