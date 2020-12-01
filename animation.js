function animate() {
  // Shape settings
  const width = 400;
  const height = 153;
  const numCanvas = 2;
  const maxShapes = 10;
  const xStart = 0;
  const yStart = 0;
  const speed = 1;
  const delay = 20; // milliseconds between updates
  const initSize = 30;
  const maxSize = 60;
  const minSize = 16;
  const growth = 5;
  const tStatic = 200;
  const tMorph = 200;
  const tLoop = (tStatic + tMorph)*4;

  // Initialize shape data
  let x = Array(maxShapes).fill(xStart);
  let y = Array(maxShapes).fill(yStart);
  let dx = Array(maxShapes).fill(speed);
  let dy = Array(maxShapes).fill(speed);
  let size = Array(maxShapes).fill(initSize);
  let dSize = Array(maxShapes).fill(-growth);
  let num = 1;
  let increase = 1;
  let t = 0;
  let change = 0;
  let phase = 0;

  const iv = setInterval(draw, delay);
  const ctxl = document.getElementById("left-canvas").getContext('2d');
  ctxl.canvas.width = width;
  const ctxr = document.getElementById("right-canvas").getContext('2d');
  ctxr.canvas.width = width;
  const contextArray = [ctxl, ctxr];
  const transform = [[1, 1], [-1, 1]];

  // set context properties
  contextArray.forEach(context => {
    context.strokeStyle = '#bfdcae';
    context.lineWidth = 2;
  });

  // reset values for shape (when adding)
  function resetValues(index) {
    x[index] = xStart;
    y[index] = yStart;
    dx[index] = speed;
    dy[index] = speed;
    size[index] = initSize;
    dSize[index] = -growth;
  }

  // draws polygon for each context with coordinates in arrays
  function drawPolygon(xCoord, yCoord) {
    let sides = xCoord.length;

    for (j = 0; j < numCanvas; j++) {
      const ctx = contextArray[j];
      xCoord = xCoord.map(elem => (transform[j][0] === 1) ? elem : width - elem);
      yCoord = yCoord.map(elem => (transform[j][1] === 1) ? elem : height - elem);
      ctx.beginPath();
      ctx.moveTo(xCoord[0], yCoord[0]);
      for (k = 1; k < sides; k++) {
        ctx.lineTo(xCoord[k], yCoord[k]);
      }
      if (sides > 2) {
        ctx.closePath();
      }
      ctx.stroke();
    }
  }

  function drawShape(i) {
    //start with squares
    if (t < tStatic){
      ctxl.strokeRect(x[i], y[i], size[i], size[i]);
      ctxr.strokeRect(width-size[i]-x[i], y[i], size[i], size[i]);
    }

    // morph to triangle (lower right of square)
    else if (t < tStatic+tMorph) {
      change = (t - tStatic)*size[i]/tMorph;
      let xCoord = [x[i]+change, x[i] + size[i], x[i]+size[i], x[i]];
      let yCoord = [y[i], y[i], y[i] + size[i], y[i] + size[i]];
      drawPolygon(xCoord, yCoord);
    }

    // Static triangle (lower-right of square)
    else if (t < tStatic*2 + tMorph) {
      let xCoord = [x[i] + size[i], x[i] + size[i], x[i]];
      let yCoord = [y[i], y[i] + size[i], y[i] + size[i]];
      drawPolygon(xCoord, yCoord);
    }

    // Morph to diagonal line
    else if (t < tStatic*2 + tMorph*2) {
      change = (t - (2*tStatic + tMorph))*size[i]/tMorph;
      let xCoord = [x[i] + size[i], x[i] - change + size[i], x[i]];
      let yCoord = [y[i], y[i] + size[i], y[i] + size[i]];
      drawPolygon(xCoord, yCoord);
    }

    // draw diagonal upper right to lower left
    else if (t < tStatic*3 + tMorph*2) {
      let xCoord = [x[i] + size[i], x[i]];
      let yCoord = [y[i], y[i] + size[i]];
      drawPolygon(xCoord, yCoord);
    }

    // rotate line to top of box
    else if (t < tStatic*3 + tMorph*3) {
      change = (t - (3*tStatic + 2*tMorph))*size[i]/tMorph;
      let xCoord = [x[i], x[i] + size[i]];
      let yCoord = [y[i] + size[i] - change, y[i]];
      drawPolygon(xCoord, yCoord);
    }

    // line at top
    else if (t < tStatic*4 + tStatic*3) {
      let xCoord = [x[i], x[i] + size[i]];
      let yCoord = [y[i], y[i]];
      drawPolygon(xCoord, yCoord);
    }

    // morph to box
    else {
      change = (t - (4*tStatic + 3*tMorph))*size[i]/tMorph
      let xCoord = [x[i], x[i] + size[i], x[i] + size[i], x[i]];
      let yCoord = [y[i], y[i], y[i] + change, y[i] + change];
      drawPolygon(xCoord, yCoord);
    }

  }

  function draw() {
    // clear the space
    ctxl.clearRect(0, 0, width, height);
    ctxr.clearRect(0, 0, width, height);

    // Change number of shapes
    if ((x[num - 1] > (width - size[num - 1])) && (size[num - 1] < minSize)) {
      if (num >= maxShapes-1) {
        increase = -1;
      }
      if (num <= 1) {
        increase = 1;
      }
      if (increase === 1) {
        resetValues(num);
      }
      num += increase;
    }

    // Process each shape
    for (i = 0; i < num; i++) {
      drawShape(i);

      // Update data
      x[i] += dx[i];
      if (x[i] < 0) dx[i] = speed;
      if (x[i] > width - size[i]) dx[i] = -speed;
      y[i] += dy[i];
      if (y[i] < 0) dy[i] = speed;
      if (y[i] > height - size[i]) dy[i] = -speed;

      if (x[i] < 0) {
        size[i] += dSize[i];
        if (size[i] < minSize) dSize[i] = growth;
        if (size[i] > maxSize) dSize[i] = -growth;
      }
    }
    // increment time
    t++;
    if (t > tLoop) t -= tLoop;
  }
}

window.requestAnimationFrame(animate);
