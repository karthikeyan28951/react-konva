import { useState, useRef, useEffect } from "react";
import { Stage, Layer, Image, Rect, Transformer, Group } from "react-konva";

const CanvasAppWithUserDimensionsAndZoom = () => {
  const FIXED_WIDTH = 800;
  const FIXED_HEIGHT = 600;

  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [isCanvasReady, setCanvasReady] = useState(false);
  const [rectangles, setRectangles] = useState([]);
  const [selectedRectangleId, setSelectedRectangleId] = useState(null);
  const [scale, setScale] = useState(1);
  const fileInputRef = useRef(null);
  const transformerRef = useRef(null);

  // Adjust zoom level when dimensions exceed the fixed container
  useEffect(() => {
    const { width, height } = dimensions;
    if (width > FIXED_WIDTH || height > FIXED_HEIGHT) {
      const scaleWidth = FIXED_WIDTH / width;
      const scaleHeight = FIXED_HEIGHT / height;
      setScale(Math.min(scaleWidth, scaleHeight));
    } else {
      setScale(1);
    }
  }, [dimensions]);

  // Handle canvas dimensions input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDimensions({ ...dimensions, [name]: parseInt(value, 10) || 0 });
  };

  // Create canvas with user-defined dimensions
  const handleCreateCanvas = (e) => {
    e.preventDefault();
    setCanvasReady(true);
  };

  // Add a rectangle to the canvas
  const handleAddRectangle = () => {
    const id = `rect-${Date.now()}`;
    setRectangles((prev) => [
      ...prev,
      { id, x: 100, y: 100, width: 200, height: 150, fill: "lightblue", image: null },
    ]);
  };

  // Handle rectangle drag and resize
  const handleRectangleTransformEnd = (id, e) => {
    const node = e.target;
    const { x, y } = node.position();
    const { width, height } = node.size();
    setRectangles((prev) =>
      prev.map((rect) =>
        rect.id === id ? { ...rect, x, y, width, height } : rect
      )
    );
  };

  // Handle rectangle selection
  const handleSelectRectangle = (id) => {
    setSelectedRectangleId(id);
  };

  // Handle image upload inside a selected rectangle
  const handleImageUpload = (e) => {
    if (!selectedRectangleId) {
      alert("Please select a rectangle to upload an image.");
      return;
    }
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    const img = new window.Image();
    img.onload = () => {
      setRectangles((prev) =>
        prev.map((rect) =>
          rect.id === selectedRectangleId ? { ...rect, image: img } : rect
        )
      );
    };
    reader.onload = () => {
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ overflow: "hidden" }}>
      {!isCanvasReady ? (
        <form onSubmit={handleCreateCanvas}>
          <label>
            Canvas Width:
            <input
              type="number"
              name="width"
              value={dimensions.width}
              onChange={handleInputChange}
              required
            />
          </label>
          <label>
            Canvas Height:
            <input
              type="number"
              name="height"
              value={dimensions.height}
              onChange={handleInputChange}
              required
            />
          </label>
          <button type="submit">Create Canvas</button>
        </form>
      ) : (
        <div>
          <h3>Canvas</h3>
          <label>
            Canvas Width:
            <input
              type="number"
              name="width"
              value={dimensions.width}
              onChange={handleInputChange}
              required
            />
          </label>
          <label>
            Canvas Height:
            <input
              type="number"
              name="height"
              value={dimensions.height}
              onChange={handleInputChange}
              required
            />
          </label>

          <div style={{ marginBottom: "10px" }}>
            <button onClick={handleAddRectangle}>Add Rectangle</button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ marginLeft: "10px" }}
              onChange={handleImageUpload}
            />
          </div>

          <div
            style={{
              overflow: "auto",
              border: "1px solid black",
              width: `${FIXED_WIDTH}px`,
              height: `${FIXED_HEIGHT}px`,
              backgroundColor: "white",
              margin: "20px 0",
            }}
          >
            <Stage
              width={dimensions.width}
              height={dimensions.height}
              scaleX={scale}
              scaleY={scale}
            >
              <Layer>
                {rectangles.map((rect) => (
                  <Group
                    key={rect.id}
                    x={rect.x}
                    y={rect.y}
                    draggable
                    onClick={() => handleSelectRectangle(rect.id)}
                    onTransformEnd={(e) => handleRectangleTransformEnd(rect.id, e)}
                  >
                    <Rect
                      width={rect.width}
                      height={rect.height}
                      fill={rect.fill}
                      stroke={rect.id === selectedRectangleId ? "red" : "black"}
                      strokeWidth={2}
                    />
                    {rect.image && (
                      <Image
                        image={rect.image}
                        width={rect.width}
                        height={rect.height}
                      />
                    )}
                  </Group>
                ))}
                <Transformer ref={transformerRef} />
              </Layer>
            </Stage>
          </div>
        </div>
      )}
    </div>
  );
};

export default CanvasAppWithUserDimensionsAndZoom;
