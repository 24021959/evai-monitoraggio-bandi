
import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { CardContent } from "@/components/ui/card";
import { Bando } from "@/types";

interface BandiSearchProps {
  bandi: Bando[];
  filtro: string;
  setFiltro: (filtro: string) => void;
}

const BandiSearch: React.FC<BandiSearchProps> = ({ bandi, filtro, setFiltro }) => {
  const [isBandoDropdownOpen, setIsBandoDropdownOpen] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<Bando[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bandi.length > 0) {
      setSearchResults(bandi);
    }
  }, [bandi]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && 
          !dropdownRef.current.contains(event.target as Node) && 
          searchInputRef.current && 
          !searchInputRef.current.contains(event.target as Node)) {
        setIsBandoDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value;
    setFiltro(term);

    if (term) {
      const results = bandi.filter(bando =>
        bando.titolo.toLowerCase().includes(term.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults(bandi);
    }
  };

  const handleBandoClick = (bando: Bando) => {
    setFiltro(bando.titolo);
    setIsBandoDropdownOpen(false);
  };

  const clearSearch = () => {
    setFiltro('');
    setSearchResults(bandi);
  };

  const handleBandoInputFocus = () => {
    setIsBandoDropdownOpen(true);
    setSearchResults(bandi);
  };

  return (
    <div className="relative flex-grow">
      <label htmlFor="bando" className="text-sm font-medium mb-1 block text-slate-700">Cerca</label>
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        <Input
          ref={searchInputRef}
          type="text"
          id="bando"
          placeholder="Cerca bando per titolo..."
          value={filtro}
          onChange={handleSearch}
          onFocus={handleBandoInputFocus}
          onClick={handleBandoInputFocus}
          className="pl-10 pr-10"
          autoComplete="off"
        />
        {filtro && (
          <button 
            type="button" 
            onClick={clearSearch}
            className="absolute right-1 top-1 h-8 w-8 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      
      {isBandoDropdownOpen && (
        <div ref={dropdownRef} className="absolute z-50 w-full">
          <Card className="mt-1 shadow-lg">
            <CardContent className="p-1">
              <div className="max-h-60 overflow-y-auto">
                {searchResults.length > 0 ? (
                  <ul className="divide-y divide-slate-100">
                    {searchResults.map(bando => (
                      <li
                        key={bando.id}
                        className="hover:bg-slate-50 p-2 cursor-pointer rounded-md text-sm"
                        onClick={() => handleBandoClick(bando)}
                      >
                        <div className="font-medium text-slate-800">{bando.titolo}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <span className={`inline-block w-2 h-2 rounded-full ${
                            bando.tipo === 'europeo' ? 'bg-blue-500' : 
                            bando.tipo === 'statale' ? 'bg-green-500' :
                            bando.tipo === 'regionale' ? 'bg-teal-500' : 'bg-gray-500'
                          }`}></span>
                          {bando.fonte} · Scadenza: {new Date(bando.scadenza).toLocaleDateString('it-IT')}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-4 text-center text-slate-500">
                    Nessun bando trovato
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default BandiSearch;
