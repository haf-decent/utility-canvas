# utility-canvas
 Wrapper for HTML Canvas Element adding helpful methods and a simplified interface

## Installation
```bash
npm install utility-canvas
```

## Usage
You can import the `UtilityCanvas` class and instantiate it
```js
import UtilityCanvas from "utility-canvas";

const myCanvas = document.getElementById("my-canvas");
// all properties are optional
const uCanvas = new UtilityCanvas({
  canvas: myCanvas,     // provide an existing canvas element or one will be created by default
  width: 1024,          // in pixels (default)
  height: 1024,         // in pixels (default)
  parent: null          // provide an element to append the canvas to (default)
})
```

## Methods
The UtilityCanvas class exposes many utility methods that wrap and extend familiar [CanvasRenderingContext2D](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D) methods. These methods all return `this`, which allows you to chain method calls:
```js
const uCanvas = new UtilityCanvas({ parent: document.body });
uCanvas
  .rect({ width: 100, height: 100, color: "red" })
  .arc({ radius: 200, center: { x: 500, y: 500 }, color: "blue" })
  .setStroke({ thickness: 10, color: "limegreen" })
  .hexagon({ radius: 150, stroke: true })
```

### Important Note About Global vs One-off Settings
UtilityCanvas allows you to set the __global__ fillStlye, stokeStyle, composite operation, and alpha. These values, once set, will be applied to all subsequent draws. However, in any individual draw call, you have the option to set __one-off__ overwrite values for each global property. In this case, the state of the global context settings is saved using `ctx<CanvasRenderingContext2D>.save()`, the one-off values are set, and once the draw call is finished, `ctx<CanvasRenderingContext2D>.restore()` restores the saved state. This global vs one-off design is meant to be convenient and intuitive, but make sure you're always aware of what your global settings are.

### Index
<table>
  <tr>
    <td valign="top">
			<ul>
				<li><a href="#settings">Settings</a></li>
				<ul>
					<li><a href="#resize">resize</a></li>
					<li><a href="#setcolor">setColor</a></li>
					<li><a href="#setstroke">setStroke</a></li>
					<li><a href="#setcompositeoperation">setCompositeOperation</a></li>
					<li><a href="#setalpha">setAlpha</a></li>
					<li><a href="#parsesettings">_parseSettings</a></li>
				</ul>
				<li><a href="#clearing">Clearing</a></li>
				<ul>
					<li><a href="#clear">clear</a></li>
					<li><a href="#clearrect">clearRect</a></li>
				</ul>
				<li><a href="#data">Data</a></li>
				<ul>
					<li><a href="#download">download</a></li>
					<li><a href="#getdataurl">getDataURL</a></li>
					<li><a href="#setdataurl">setDataURL</a></li>
				</ul>
			</ul>
		</td>
		<td valign="top">
			<ul>
				<li><a href="#fills">Fills</a></li>
				<ul>
					<li><a href="#fill">fill</a></li>
					<li><a href="#fillrect">fillRect</a></li>
				</ul>
				<li><a href="#strokes">Strokes</a></li>
				<ul>
					<li><a href="#beginpath">beginPath</a></li>
					<li><a href="#closepath">closePath</a></li>
					<li><a href="#stroke">stroke</a></li>
				</ul>
				<li><a href="#images">Images</a></li>
				<ul>
					<li><a href="#fillimage">fillImage</a></li>
					<li><a href="#fillorfitimage">fillOrFitImage</a></li>
					<li><a href="#fillimagepattern">fillImagePattern</a></li>
					<li><a href="#drawimage">drawImage</a></li>
					<li><a href="#drawimagewithdimensions">drawImageWithDimensions</a></li>
				</ul>
			</ul>
		</td>
		<td valign="top">
			<ul>
				<li><a href="#shapes">Shapes</a></li>
				<ul>
					<li><a href="#rect">rect</a></li>
					<li><a href="#arc">arc</a></li>
					<li><a href="#ellipse">ellipse</a></li>
					<li><a href="#roundedrectangle">roundedRectangle</a></li>
					<li><a href="#polyline">polyline</a></li>
					<li><a href="#polygon">polygon</a></li>
					<li><a href="#rectangle">rectangle</a></li>
				</ul>
				<li><a href="#other">Other</a></li>
				<ul>
					<li><a href="#chromakey">chromakey</a></li>
				</ul>
			</ul>
		</td>
	</tr>
</table>

### Settings

#### Resize
Dynamically resize the canvas by providing a new width and/or height, in pixels
```js
uCanvas.resize({
  width: 2048,
  height: 2048
})
```

#### setColor
Sets the global [fillStyle](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillStyle), which is applied to any draw methods that set their `fill` property to `true`. The default value is `#000` (black)
```js
uCanvas
  .setColor("red")                                // sets global fillStyle to "red"
  .rect({ width: 100, height: 100, fill: true })  // this rectangle will be filled "red"
```

#### setStroke
Sets the global [lineWidth](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineWidth) and [strokeStyle](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/strokeStyle), which are applied to any draw methods that set their `stroke` property to `true`. The default stroke color is `#000` (black) and the default thickness is `1.0`
```js
uCanvas
  .setStroke({ thickness: 20, color: "red" })       // sets global fillStyle to "red"
  .rect({ width: 100, height: 100, stroke: true })  // this rectangle will be outlined in thick "red"
```

#### setCompositeOperation
Sets the [globalCompositeOperation](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation), which is applied to any subsequent draw calls. You can provide a string from the list of operations or use the `UtilityCanvas`'s static property `COMPOSITE` with more self-describing, human-readable operation names. The default value is `source-over`
```js
uCanvas
  .setCompositeOperation(UtilityCanvas.COMPOSITE.BEHIND) // all draw calls will be drawn "behind" existing elements (equivalent to "destination-over")
```

#### setAlpha
Sets the [globalAlpha](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalAlpha), which is applied to any subsequent draw calls. The default value is `1.0` (opaque)
```js
uCanvas
  .setAlpha(0.5)                                    // sets global transparency value to 50%
  .rect({ width: 100, height: 100, color: "red" })  // this rectangle will be 50% transparency red
```

#### parseSettings
This is a mostly internal method that gets called when draw calls use one-off settings, but you can use it to set all of the above settings in one call
```js
uCanvas
  ._parseSettings({
    color: "red",
    strokeSettings: {
      thickness: 20,
      color: "blue"
    },
    operation: UtilityCanvas.COMPOSITE.BEHIND,
    alpha: 0.75
  })                                                  // sets global settings, equivalent to using each configuration method separately
  .rect({ width: 100, height: 100, color: "black" })  // this rect calls _parseSettings to set its color to black
```

### Clearing

#### clear
A convenience method for clearing the entire canvas to a completely blank state.
```js
uCanvas.rect({ width: 100, height: 100, color: "red" }); // draw something to canvas

setTimeout(() => uCanvas.clear(), 2000);                 // wait 2s, then clear the canvas
```

#### clearRect
Wraps the `ctx<CanvasRenderingContext2D>.clearRect` method. Allows for clearing portions of the canvas
```js
uCanvas.rect({ width: 100, height: 100, color: "red" });                 // draw something to canvas

setTimeout(() => uCanvas.clearRect({ width: 100, height: 100 }), 2000);  // wait 2s, then clear only the rect
```

### Data

#### download
Downloads the canvas as an image, allowing you to specify the format and filename. Default behavior is to download a jpg with the name "export.jpg"
```js
uCanvas.download("image/png", "my-totally-sick-canvas-export.png");
```

#### getDataURL
Converts the current canvas into a base64 dataURL string using the `ctx<CanvasRenderingContext2D>.toDataURL()` method, allowing you to specify the format (default = image/jpeg) and quality (default = 1.0)
```js
const data = uCanvas.getDataURL("image/jpeg", 0.5);
const img = document.getElementById("screenshot-img");
img.src = data;
```

#### setDataURL
Accepts a base64 dataURL string and paints it to the canvas, stretching it, if necessary, to fully fill the canvas bounds. This process is async, so the function returns a Promise, which can be awaited or chained.
```js
uCanvas
  .setDataURL("...")
  .then(() => uCanvas.download());
```

### Fills

#### fill
Wraps the `ctx<CanvasRenderingContext2D>.fill()` method, allowing you to set one-off configuration for that fill call. Best used when you want to fill after multiple draw calls.
```js
uCanvas
	.polygon({
		sides: 6,
		center: { x: 430, y: 200 },
		closed: true
	})                                   // create open polygon
	.polyline({
		points: [ [0, 0 ], ... ],
		closed: true
	})                                   // draw a freehand shape
	.fill({ color: "red" })              // fill with "red"
	.stroke({
		strokeSettings: { color: "blue" }
	})                                   // stroke with blue
```

#### fillRect
Wraps the `ctx<CanvasRenderingContext2D>.fillRect()` method, allowing you to set one-off configuration for that fillRect call.
```js
uCanvas.fillRect({
	offset: { x: 100, y: 150 },
	width: 200,
	height: 100,
	color: "#4c3758"
})
```

### Strokes

#### beginPath
Wraps the `ctx<CanvasRenderingContext2D>.beginPath()` method for drawing custom strokes

#### stroke
Wraps the `ctx<CanvasRenderingContext2D>.stroke()` method, allowing you to set one-off configuration for that stroke call. Best used when you want to stroke after multiple draw calls.

<a href="#fill">See fill example</a>

#### closePath
Wraps the `ctx<CanvasRenderingContext2D>.closePath()` method for drawing custom strokes

### Images

#### fillImage
Draws an image (or canvas) to the UtilityCanvas, stretching the image to fit its width/height. You can also specify `preserveAspect: true | "fill" | "fit"` which will call `fillOrFitImage` instead and preserve the image's aspect ratio
```js
const img = document.getElementById("img-1");
uCanvas
	.fillImage(img, {operation: UtilityCanvas.COMPOSITE.BEHIND }) // draw image to canvas behind existing content
```

#### fillOrFitImage
Like `fillImage`, this method draws an image to the UtilityCanvas, but it preserves either the image's aspect ratio or a custom ratio. You can also specify the alignment anchors, offset, and margin
```js
const img = document.getElementById("img-1");
uCanvas
	.fillOrFitImage(img, {
		fill: false,                         // when true, scale the image to cover the entire canvas (potentially with overhang)
		aspect: 2,                           // set custom aspect ratio [height/width] (default is calculated from image)
		anchors: { x: "center", y: "top" },  // align the image, centering horizontally, and aligning the top edge
		offset: { x: 0, y: 100 },            // move image 100px down from top edge
		margin: 25                           // basically adds a frame of negative space to the image. You can also specify an object with different t (top), l (left), r (right), and b (bottom) margins
	})
```

#### fillImagePattern
This method allows for tiling an image. You can also customize the tiling with horizontal or vertical staggering, rotation, alignment anchors, offset, and margin
```js
const img = document.getElementById("img-1");
uCanvas
	.fillImagePattern(img, {
		anchors: { x: "center", y: "center" },      // default alignment, the middle of your pattern will be centered
		offset: { x: 100, y: 0 },                   // offset from your alignment
		repeat: { x: 7, y: 9 },                     // specify how many times the img should repeat in both directions (default will calculate how many are needed to fill x and y based on image size and rotation)
		margin: { x: 10, y: 10 },                   // frame of negative space around each tile
		rotation: Math.PI / 4,                      // rotate entire pattern
		stagger: 'x',                               // staggering offsets each other row to create a brick-like pattern in x or y direction
		operation: UtilityCanvas.COMPOSITE.BEHIND   // can still specify one-off operation setting
	})
```

#### drawImage
This method draws an image to the canvas, allowing you to customize the placement, rotation, and scale of the image.
```js
const img = document.getElementById("img-1");
uCanvas
	.drawImage(img, {
		center: { x: 300, y: 400 },    // center point
		rotation: Math.PI / 3,         // default = 0
		scale: 0.3                     // image will be drawn at 30% of its naturalWidth/Height
	})
```

#### drawImageWithDimensions
Rather than specifying a scale like `drawImage`, this method allows you to set absolute measurements for your image.
```js
const img = document.getElementById("img-1");
uCanvas
	.drawImageWithDimensions(img, {
		center: { x: 300, y: 400 },    // center point
		rotation: Math.PI / 3,         // default = 0
		width: 200,                    // specify fixed width
		height: 250                    // specify fixed height
	})
```

### Shapes

#### rect
Wraps the `ctx<CanvasRenderingContext2D>.rect()` method, allowing you to customize the one-off configuration settings
```js
uCanvas
	.rect({
		offset: { x: 0, y: 300 }, // position of top left corner of rect relative to the top left corner of the canvas
		width: 100,
		height: 200,
		fill: "red"
	})
```

#### arc
Wraps the `ctx<CanvasRenderingContext2D>.arc()` method, allowing you to customize the one-off configuration settings
```js
uCanvas
	.arc({
		radius: 100,                 // default is half the minimum dimension (width/height)
		center: { x: 100, y: 100 },  // position of the arc center (default is center of canvas)
		startAngle: 0,               // default
		endAngle: 2 * Math.PI,       // default
		cc: false,                   // whether arc should be drawn countclockwise (default)
		stroke: true
	})
```

#### ellipse
Wraps the `ctx<CanvasRenderingContext2D>.arc()` method, allowing you to customize the one-off configuration settings
```js
uCanvas
	.ellipse({
		radius: { x: 100, y: 50 },   // default is half the corresponding dimension
		center: { x: 100, y: 100 },  // position of the ellipse center (default is center of canvas)
		startAngle: 0,               // default
		endAngle: 2 * Math.PI,       // default
		cc: false,                   // whether arc should be drawn countclockwise (default)
		rotation: Math.PI / 4,       // default is 0
		stroke: true
	})
```

#### roundedRectangle
This method draws a rectangle with rounded corners. The corner radii are customizable.
```js
uCanvas
	.roundedRectangle({
		width: 500,                                
		height: 300,
		radius: { tl: 20, tr: 10, bl: 15, br: 25}, 
		// tl: topLeft, tr: topRight, bl: bottomLeft, br: bottomRight
		// can also be a single number that is applied to all corners
		fill: "red"
	})
```

#### polyline
This method draws a multi-point line.
```js
const points = [ [ 0, 0 ], [ 100, 0 ], [ 50, 50] ];
uCanvas
	.polyline(points, {  // must have at least 2 point arrays
		closed: false,     // should last point connect back to first point (default)
		stroke: true
	})
```

#### polygon
An abstraction of `polyine` to create regular polygons. One of `sideLength` or `radius` must be specified, with radius specifying the distance from the center of the shape to each vertex (circumsribed circle)
```js
uCanvas
	.polygon({
		sides: 6,                   // e.g. hexagon, must be greater than 2
		radius: 100,                // corresponds to a sideLength of 50 for a hexagon
		sideLength: 50,             // ignored because radius is specified
		center: { x: 200, y: 200 }, // location of shape, defaults to center of canvas
		closed: true,               // should shape be closed (default)
		fill: "yellow"
	})
```

#### rectangle
Another abstraction of `polyline` for drawing a rotatable rectangle
```js
uCanvas
	.rectangle({
		center: { x: 200, y: 200 }, // location of rectangle, defaults to center of canvas
		width: 200,
		height: 100,
		rotation: Math.PI / 6,      // default 0
		closed: false,              // should last point connect back to first point (default)
		stroke: true
	})
```

### Other

#### chromaKey
This method replaces a specified color on the canvas with transparent black pixels based on a threshold value. The higher the threshold value, the more colors will be replaced.
```js
const img = document.getElementById("img-1");
uCanvas
	.fillImage(img)
	.chromaKey("#00ff00", 0.05) 
// color can be a hex string or an object { r[0-255], g[0-255], b[0-255] }
// threshold will be clamped between 0.01 and 1
```