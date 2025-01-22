import { useState, useRef } from "react";
import { Stage, Layer, Image, Transformer } from "react-konva";

const CanvasAppWithImageUpload = () => {
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [isCanvasReady, setCanvasReady] = useState(false);
  const [image, setImage] = useState(null);
  const [imageProps, setImageProps] = useState({ x: 50, y: 50, scaleX: 1, scaleY: 1 });
  const fileInputRef = useRef(null);
  const transformerRef = useRef(null);
  const imageRef = useRef(null);

  // Handle dimension input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDimensions({ ...dimensions, [name]: parseInt(value, 10) || 0 });
  };

  // Create canvas
  const handleCreateCanvas = (e) => {
    e.preventDefault();
    setCanvasReady(true);
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.src = reader.result;
      img.onload = () => {
        setImage(img);
        setImageProps({
          ...imageProps,
          scaleX: 1,
          scaleY: 1,
        });
      };
    };
    if (file) reader.readAsDataURL(file);
  };

  // Remove uploaded image
  const handleRemoveImage = () => {
    setImage(null);
  };

  // Resize the image dynamically
  const handleTransformEnd = () => {
    const node = imageRef.current;
    setImageProps({
      x: node.x(),
      y: node.y(),
      scaleX: node.scaleX(),
      scaleY: node.scaleY(),
    });
  };

  // Attach transformer for resizing
  const attachTransformer = () => {
    transformerRef.current.nodes([imageRef.current]);
    transformerRef.current.getLayer().batchDraw();
  };

  return (
    <div>
      {/* Form to set canvas dimensions */}
      {!isCanvasReady ? (
        <form onSubmit={handleCreateCanvas}>
          <label>
            Width:
            <input
              type="number"
              name="width"
              value={dimensions.width}
              onChange={handleInputChange}
              required
            />
          </label>
          <label>
            Height:
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

          {/* Resize canvas dimensions */}
          <div style={{ marginBottom: "10px" }}>
            <label>
              Resize Width:
              <input
                type="number"
                name="width"
                value={dimensions.width}
                onChange={handleInputChange}
              />
            </label>
            <label>
              Resize Height:
              <input
                type="number"
                name="height"
                value={dimensions.height}
                onChange={handleInputChange}
              />
            </label>
          </div>

          {/* Image upload input */}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ marginBottom: "10px" }}
            onChange={handleImageUpload}
          />
          <button onClick={handleRemoveImage} disabled={!image}>
            Remove Image
          </button>

          {/* Konva Stage */}
          <Stage
            width={dimensions.width}
            height={dimensions.height}
            style={{
              border: "1px solid black",
              backgroundColor: "white",
              margin: "20px 0",
            }}
          >
            <Layer>
              {image && (
                <>
                  <Image
                    ref={imageRef}
                    image={image}
                    x={imageProps.x}
                    y={imageProps.y}
                    scaleX={imageProps.scaleX}
                    scaleY={imageProps.scaleY}
                    draggable
                    onClick={attachTransformer}
                    onTap={attachTransformer}
                    onTransformEnd={handleTransformEnd}
                  />
                  <Transformer ref={transformerRef} />
                </>
              )}
            </Layer>
          </Stage>
        </div>
      )}
    </div>
  );
};

export default CanvasAppWithImageUpload;
