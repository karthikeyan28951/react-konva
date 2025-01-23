import { useState, useRef, useEffect } from "react";
import { Stage, Layer, Image, Transformer } from "react-konva";

const CanvasAppWithUserDimensionsAndZoom = () => {
  const FIXED_WIDTH = 800;
  const FIXED_HEIGHT = 600;

  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  console.log('dimensions', dimensions)
  const [isCanvasReady, setCanvasReady] = useState(false);
  const [images, setImages] = useState([]);
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [scale, setScale] = useState(1);
  console.log('scale', scale)
  const fileInputRef = useRef(null);
  const transformerRef = useRef(null);

  // Adjust zoom level automatically when dimensions exceed the fixed container
  useEffect(() => {
    const { width, height } = dimensions;
    if (width > FIXED_WIDTH || height > FIXED_HEIGHT) {
      const scaleWidth = FIXED_WIDTH / width;
      const scaleHeight = FIXED_HEIGHT / height;
      setScale(Math.min(scaleWidth, scaleHeight));
    } else {
      setScale(1); // Reset scale if dimensions fit within the container
    }
  }, [dimensions]);

  // Handle dimension input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDimensions({ ...dimensions, [name]: parseInt(value, 10) || 0 });
  };

  // Create canvas with user dimensions
  const handleCreateCanvas = (e) => {
    e.preventDefault();
    setCanvasReady(true);
  };

  // Handle zoom in/out manually
  const handleZoom = (zoomFactor) => {
    const newScale = Math.max(0.5, Math.min(3, scale + zoomFactor)); // Limit zoom range between 0.5x and 3x
    setScale(newScale);
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file, index) => {
      const id = `${file.name}-${Date.now()}-${index}`;
      const reader = new FileReader();
      const img = new window.Image();
      img.onload = () => {
        setImages((prev) => [
          ...prev,
          { id, image: img, x: 50, y: 50, scaleX: 1, scaleY: 1 },
        ]);
      };
      reader.onload = () => {
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove an image
  const handleRemoveImage = (id) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    if (selectedImageId === id) {
      setSelectedImageId(null);
    }
  };

  // Resize the image dynamically
  const handleTransformEnd = (id) => {
    const node = transformerRef.current.getNode();
    setImages((prev) =>
      prev.map((img) =>
        img.id === id
          ? { ...img, x: node.x(), y: node.y(), scaleX: node.scaleX(), scaleY: node.scaleY() }
          : img
      )
    );
  };

  // Attach transformer for resizing
  const attachTransformer = (id) => {
    setSelectedImageId(id);
    const node = images.find((img) => img.id === id);
    transformerRef.current.nodes([node?.imageRef]);
    transformerRef.current.getLayer().batchDraw();
  };

  return (
    <div style={{ overflow: "hidden" }}>
      {/* Form to set canvas dimensions */}
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

          {/* Zoom controls */}
          <div style={{ marginBottom: "10px" }}>
            <button onClick={() => handleZoom(-0.1)}>Zoom Out</button>
            <button onClick={() => handleZoom(0.1)}>Zoom In</button>
            <span>Zoom: {Math.round(scale * 100)}%</span>
          </div>

          {/* Image upload input */}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ marginBottom: "10px" }}
            multiple
            onChange={handleImageUpload}
          />

          {/* Konva Stage */}
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
              visible={true}
              style={{backgroundColor: "yellow", border: "1px solid red"}}
            >
              <Layer>
                {images.map((img) => (
                  <Image
                    key={img.id}
                    image={img.image}
                    x={img.x}
                    y={img.y}
                    scaleX={img.scaleX}
                    scaleY={img.scaleY}
                    draggable
                    onClick={() => attachTransformer(img.id)}
                    onTap={() => attachTransformer(img.id)}
                    onTransformEnd={() => handleTransformEnd(img.id)}
                    ref={(node) => (img.imageRef = node)}
                    visible={true}
                  />
                ))}
                <Transformer ref={transformerRef} />
              </Layer>
            </Stage>
          </div>

          {/* Display image list for removal */}
          <div>
            <h4>Uploaded Images</h4>
            {images.map((img) => (
              <div key={img.id} style={{ marginBottom: "10px" }}>
                <span>{img.id}</span>
                <button onClick={() => handleRemoveImage(img.id)}>Remove</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CanvasAppWithUserDimensionsAndZoom;
