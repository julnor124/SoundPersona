type SearchBarProps = {
  query: string;
  onQueryChange: (value: string) => void;
  onSearch: () => void;
  disabled?: boolean;
};

export default function SearchBar({
  query,
  onQueryChange,
  onSearch,
  disabled,
}: SearchBarProps) {
  return (
    <div className="search-wrap">
      <input
        className="search-input"
        type="text"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !disabled) {
            onSearch();
          }
        }}
        placeholder="Search for a track..."
        disabled={disabled}
      />
      <button className="search-button" onClick={onSearch} disabled={disabled}>
        Search
      </button>
    </div>
  );
}
