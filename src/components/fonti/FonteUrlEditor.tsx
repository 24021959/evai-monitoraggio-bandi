
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface FonteUrlEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUrl: string;
  onSave: (newUrl: string) => Promise<void>;
}

export const FonteUrlEditor: React.FC<FonteUrlEditorProps> = ({
  open,
  onOpenChange,
  currentUrl,
  onSave
}) => {
  const [newUrl, setNewUrl] = useState(currentUrl);
  const [isValid, setIsValid] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewUrl(e.target.value);
    
    try {
      new URL(e.target.value);
      setIsValid(true);
    } catch {
      setIsValid(false);
    }
  };
  
  const handleSave = async () => {
    if (!isValid) return;
    
    setIsSaving(true);
    try {
      await onSave(newUrl);
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifica URL</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <Label htmlFor="url">URL della fonte</Label>
          <Input 
            id="url"
            value={newUrl}
            onChange={handleUrlChange}
            placeholder="https://esempio.com"
            className={!isValid ? "border-red-500" : ""}
          />
          {!isValid && (
            <p className="text-red-500 text-sm mt-1">
              Inserisci un URL valido
            </p>
          )}
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Annulla
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!isValid || isSaving || newUrl === currentUrl}
          >
            {isSaving ? (
              <>
                <span className="animate-spin h-4 w-4 mr-2 border-2 border-t-transparent border-current rounded-full"></span>
                Salvataggio...
              </>
            ) : 'Salva'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
