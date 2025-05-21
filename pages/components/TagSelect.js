// /pages/components/TagSelect.js
import React from "react";

export default function TagSelect({ tags = [], value = [], onChange }) {
  // Se non hai già una lista "tags", il componente sarà vuoto
  return (
    <div className="mb-2">
      <label className="block font-semibold mb-1">Tags</label>
      <select
        multiple
        className="input w-full"
        value={value}
        onChange={(e) =>
          onChange(
            Array.from(e.target.selectedOptions, (option) => option.value)
          )
        }
      >
        {tags.map((tag) => (
          <option key={tag} value={tag}>
            {tag}
          </option>
        ))}
      </select>
    </div>
  );
}
