const buildPalette = (colorsList) => {
  const paletteContainer = document.getElementById("palette");
  // reset the HTML in case you load various images
  paletteContainer.innerHTML = "";
  // const orderedByColor = orderByLuminance(colorsList);
  for (let i = 0; i < colorsList.length; i++) {
    const hexColor = rgbToHex(colorsList[i]);
    if (i > 0) {
      const difference = calculateColorDifference(
        colorsList[i],
        colorsList[i - 1]
      );
      // if the distance is less than 120 we ommit that color
      if (difference < 120) {
        continue;
      }
    }
    // create the div and text elements for both colors & append it to the document
    const colorElement = document.createElement("div");
    colorElement.style.backgroundColor = hexColor;
    paletteContainer.appendChild(colorElement);
  }
};

const rgbToHex = (pixel) => {
  const componentToHex = (c) => {
    const hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  };

  return (
    "#" +
    componentToHex(pixel.r) +
    componentToHex(pixel.g) +
    componentToHex(pixel.b)
  ).toUpperCase();
};

const buildRgb = (imageData) => {
  const rgbValues = [];
  // note that we are loopin every 4!
  // for every Red, Green, Blue and Alpha
  for (let i = 0; i < imageData.length; i += 4) {
    const rgb = {
      r: imageData[i],
      g: imageData[i + 1],
      b: imageData[i + 2],
    };

    rgbValues.push(rgb);
  }

  return rgbValues;
};

const calculateColorDifference = (color1, color2) => {
  const rDifference = Math.pow(color2.r - color1.r, 2);
  const gDifference = Math.pow(color2.g - color1.g, 2);
  const bDifference = Math.pow(color2.b - color1.b, 2);

  return rDifference + gDifference + bDifference;
};

const findBiggestColorRange = (rgbValues) => {
  let rMin = Number.MAX_VALUE;
  let gMin = Number.MAX_VALUE;
  let bMin = Number.MAX_VALUE;

  let rMax = Number.MIN_VALUE;
  let gMax = Number.MIN_VALUE;
  let bMax = Number.MIN_VALUE;

  rgbValues.forEach((pixel) => {
    rMin = Math.min(rMin, pixel.r);
    gMin = Math.min(gMin, pixel.g);
    bMin = Math.min(bMin, pixel.b);

    rMax = Math.max(rMax, pixel.r);
    gMax = Math.max(gMax, pixel.g);
    bMax = Math.max(bMax, pixel.b);
  });

  const rRange = rMax - rMin;
  const gRange = gMax - gMin;
  const bRange = bMax - bMin;

  // determine which color has the biggest difference
  const biggestRange = Math.max(rRange, gRange, bRange);
  if (biggestRange === rRange) {
    return "r";
  } else if (biggestRange === gRange) {
    return "g";
  } else {
    return "b";
  }
};

const quantization = (rgbValues, depth) => {
  const MAX_DEPTH = 4;

  if (depth === MAX_DEPTH || rgbValues.length === 0) {
    const color = rgbValues.reduce(
      (prev, curr) => {
        prev.r += curr.r;
        prev.g += curr.g;
        prev.b += curr.b;

        return prev;
      },
      {
        r: 0,
        g: 0,
        b: 0,
      }
    );

    color.r = Math.round(color.r / rgbValues.length);
    color.g = Math.round(color.g / rgbValues.length);
    color.b = Math.round(color.b / rgbValues.length);

    return [color];
  }

  const componentToSortBy = findBiggestColorRange(rgbValues);
  rgbValues.sort((p1, p2) => {
    return p1[componentToSortBy] - p2[componentToSortBy];
  });
  
  const mid = rgbValues.length / 2;
  return [
    ...quantization(rgbValues.slice(0, mid), depth + 1),
    ...quantization(rgbValues.slice(mid + 1), depth + 1),
  ];
};

const drawColors = () => {
  const imgFile = document.getElementById("imgfile");
  const image = new Image();
  const file = imgFile.files[0];
  const fileReader = new FileReader();

  fileReader.onload = () => {
    image.onload = () => {
      const canvas = document.getElementById("canvas");
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext("2d");

      ctx.drawImage(image, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const rgbArray = buildRgb(imageData.data);
      const quantColors = quantization(rgbArray, 0);
      buildPalette(quantColors);
    };
    image.src = fileReader.result;
  };
  fileReader.readAsDataURL(file);
}

const main = () => {
  const salida = document.getElementById("salida");
  const entrada = document.getElementById("entrada");
  const loader = document.getElementById("loader");
  
  salida.classList.remove("oculto");
  loader.classList.remove("oculto");
  entrada.classList.add("oculto");

  drawColors();

  loader.classList.add("oculto");
  entrada.classList.remove("oculto");
};

// Función para calcular la distancia euclidiana entre dos colores RGB
// function colorDistance(color1, color2) {
//   const r1 = parseInt(color1.slice(1, 3), 16);
//   const g1 = parseInt(color1.slice(3, 5), 16);
//   const b1 = parseInt(color1.slice(5, 7), 16);
  
//   const r2 = parseInt(color2.slice(1, 3), 16);
//   const g2 = parseInt(color2.slice(3, 5), 16);
//   const b2 = parseInt(color2.slice(5, 7), 16);
  
//   const dr = r1 - r2;
//   const dg = g1 - g2;
//   const db = b1 - b2;

//   return Math.sqrt(dr * dr + dg * dg + db * db);
// }

// Colores para agrupar
// const beigeColors = ['#EFE5D2', '#E1D7C9', '#BBB8B4'];

// Umbral para considerar colores como similares (puedes ajustarlo)
// const threshold = 50;

// Función para asignar un color a la categoría "Beige"
// function categorizeColor(color) {
//   for (const beigeColor of beigeColors) {
//       if (colorDistance(beigeColor, color) < threshold) {
//           return 'Beige';
//       }
//   }
//   return 'Otro';
// }

// Ejemplo de uso
// const colorToCategorize = '#E6D4BF'; // Un color similar a beige
// const category = categorizeColor(colorToCategorize);
// console.log(`El color ${colorToCategorize} pertenece a la categoría "${category}".`);
