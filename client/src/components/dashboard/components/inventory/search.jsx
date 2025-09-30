import { Input } from "../../../ui/input";
import { useState, useEffect } from "react";

export default function Search({ search, setSearch }) {
  const [query, setQuery] = useState(search);
  useEffect(() => {
    const debounce = setTimeout(() => {
      if (query.trim()){
        setSearch(query);
      }else{
        setSearch("")
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [query]);
  return (
    <>
      <Input
      className="w-full lg:w-auto"
        placeholder="SEARCH..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
        }}
      />
    </>
  );
}
