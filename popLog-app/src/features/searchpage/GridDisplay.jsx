import SearchDisplay from "./SearchDisplay";
import "./GridDisplay.css";

const GridDisplay = ({ itemsArray }) => {
  return (
    <div className="grid-display">
      {itemsArray.map((item, index) => (
        <SearchDisplay
          key={index}
          title={item.title}
          description={item.summary}
          releaseYear={item.releaseYear}
          imageUrl={item.coverUrl}
        />
      ))}
    </div>
  );
};

export default GridDisplay;
