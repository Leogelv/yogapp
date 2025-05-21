import React from 'react';
import './LibraryCategories.css';

interface LibraryCategoriesProps {
  onCategorySelect: (categorySlug: string) => void;
}

// Категории, соответствующие тем, что есть в базе данных
const categories = [
  { id: 'physical', name: 'Телесные', color: '#4caf50' },
  { id: 'meditation', name: 'Медитации', color: '#2196f3' },
  { id: 'breathing', name: 'Дыхательные', color: '#9c27b0' },
];

const LibraryCategories: React.FC<LibraryCategoriesProps> = ({ onCategorySelect }) => {
  return (
    <div className="library-categories">
      {categories.map((category) => (
        <button 
          key={category.id}
          className="category-card-new"
          onClick={() => onCategorySelect(category.id)}
          style={{ borderColor: category.color }}
          aria-label={`Категория ${category.name}`}
        >
          <span className="category-name-new" style={{ color: category.color }}>{category.name}</span>
        </button>
      ))}
    </div>
  );
};

export default LibraryCategories; 