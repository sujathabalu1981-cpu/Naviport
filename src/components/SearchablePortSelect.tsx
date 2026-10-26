import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, Ship, Globe, X } from 'lucide-react';
import { VERIFIED_PORTS } from '../data/portsData';
import { PortMetadata } from '../types';

interface SearchablePortSelectProps {
  value: string;
  onChange: (portName: string) => void;
  availablePorts?: PortMetadata[];
  id?: string;
}

export const SearchablePortSelect: React.FC<SearchablePortSelectProps> = ({
  value,
  onChange,
  availablePorts,
  id = 'searchable-port-select',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const portsList = availablePorts && availablePorts.length > 0 ? availablePorts : VERIFIED_PORTS;

  const filteredPorts = portsList.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      p.port.toLowerCase().includes(q) ||
      p.country.toLowerCase().includes(q) ||
      p.region.toLowerCase().includes(q)
    );
  });

  const selectedPortObj = portsList.find((p) => p.port === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset highlight index when filter changes
  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchQuery]);

  const handleSelect = (portName: string) => {
    onChange(portName);
    setSearchQuery('');
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % Math.max(1, filteredPorts.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + filteredPorts.length) % Math.max(1, filteredPorts.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredPorts[highlightedIndex]) {
        handleSelect(filteredPorts[highlightedIndex].port);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Clickable Select Field */}
      <div
        id={id}
        tabIndex={0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        onClick={() => {
          setIsOpen(!isOpen);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
        onKeyDown={handleKeyDown}
        className={`flex w-full cursor-pointer items-center justify-between rounded-xl border bg-[#0B1F35] px-3.5 py-2.5 text-xs font-medium text-[#F3F7FC] transition focus:outline-none ${
          isOpen ? 'border-[#31D5E8] ring-2 ring-[#31D5E8]/20' : 'border-[#168BFF]/20 hover:border-[#168BFF]/50'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          <Ship className="h-4 w-4 text-[#31D5E8] shrink-0" />
          {selectedPortObj ? (
            <div className="flex items-center gap-2 truncate">
              <span className="font-bold text-[#F3F7FC]">{selectedPortObj.port}</span>
              <span className="text-[11px] text-[#9BB0C7]">({selectedPortObj.country})</span>
              <span className="hidden sm:inline-block rounded bg-[#168BFF]/15 px-1.5 py-0.5 text-[10px] font-mono text-[#31D5E8]">
                {selectedPortObj.avg_throughput_teu_mn}M TEU
              </span>
            </div>
          ) : (
            <span className="text-[#9BB0C7]">{value || 'Click to select or search a port...'}</span>
          )}
        </div>

        <ChevronDown
          className={`h-4 w-4 text-[#9BB0C7] transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-[#31D5E8]' : ''
          }`}
        />
      </div>

      {/* Dropdown Popup Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 z-50 mt-1.5 max-h-80 overflow-hidden rounded-2xl border border-[#168BFF]/30 bg-[#0B1F35] shadow-2xl shadow-black/80 backdrop-blur-md">
          {/* Search Box Header */}
          <div className="border-b border-[#168BFF]/15 p-2.5 bg-[#071426]">
            <div className="relative flex items-center">
              <Search className="absolute left-3 h-3.5 w-3.5 text-[#31D5E8]" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search by port, country, or region..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full rounded-xl border border-[#168BFF]/25 bg-[#102941] pl-8 pr-8 py-2 text-xs text-[#F3F7FC] placeholder-[#9BB0C7]/60 focus:border-[#31D5E8] focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 text-[#9BB0C7] hover:text-[#F3F7FC]"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <div className="mt-1.5 flex justify-between px-1 text-[10px] text-[#9BB0C7]">
              <span>Available in dataset: {portsList.length} global hub ports</span>
              {searchQuery && <span>Matching: {filteredPorts.length}</span>}
            </div>
          </div>

          {/* List of Ports */}
          <ul role="listbox" className="max-h-60 overflow-y-auto p-1.5 space-y-1">
            {filteredPorts.length > 0 ? (
              filteredPorts.map((p, idx) => {
                const isSelected = p.port === value;
                const isHighlighted = idx === highlightedIndex;

                return (
                  <li
                    key={p.port}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(p.port)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-xs transition ${
                      isSelected
                        ? 'bg-[#168BFF] text-white shadow-md shadow-[#168BFF]/30'
                        : isHighlighted
                        ? 'bg-[#102941] text-[#F3F7FC]'
                        : 'text-[#F3F7FC] hover:bg-[#102941]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-lg ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-[#071426] text-[#31D5E8]'
                        }`}
                      >
                        <Ship className="h-3 w-3" />
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold">{p.port}</span>
                          <span className={isSelected ? 'text-white/80 text-[11px]' : 'text-[#9BB0C7] text-[11px]'}>
                            ({p.country})
                          </span>
                        </div>
                        <div className={isSelected ? 'text-white/70 text-[10px]' : 'text-[#9BB0C7]/80 text-[10px]'}>
                          {p.region} • {p.avg_throughput_teu_mn}M TEU Throughput Capacity
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[9px] font-semibold ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-[#168BFF]/15 text-[#31D5E8] border border-[#168BFF]/25'
                        }`}
                      >
                        {p.region}
                      </span>
                      {isSelected && <Check className="h-4 w-4 text-white" />}
                    </div>
                  </li>
                );
              })
            ) : (
              <li className="py-6 text-center text-xs text-[#9BB0C7]">
                No ports found matching "{searchQuery}".
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};
