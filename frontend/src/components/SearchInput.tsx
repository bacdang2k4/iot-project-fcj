import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  placeholder?: string;
  isLoading?: boolean;
}

const SearchInput = ({ value, onChange, onSearch, placeholder, isLoading }: SearchInputProps) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSearch();
    }
  };

  return (
    <div className="flex gap-2 w-full max-w-2xl">
      <Input
        type="text"
        placeholder={placeholder || "Nhập số CCCD..."}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={handleKeyPress}
        className="flex-1"
        disabled={isLoading}
      />
      <Button onClick={onSearch} disabled={isLoading || !value.trim()} className="gap-2">
        <Search className="h-4 w-4" />
        Tìm kiếm
      </Button>
    </div>
  );
};

export default SearchInput;
