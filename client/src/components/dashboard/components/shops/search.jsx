import { useState, useEffect } from "react";

import { Input } from "../../../ui/input";

export default function Search({setSearch}) {
    const [query, setQuery] = useState("");
  useEffect(() => {
    const debounce = setTimeout(() => {
      if (query) {
        setSearch(query.trim());
      } else {
        setSearch("");
      }
    }, 200);

    return () => clearTimeout(debounce);
  }, [query]);

  return (
    <Input
      placeholder="Search for shops..."
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}
