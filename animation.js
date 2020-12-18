// initialization of canvas(es), setting height and width,
// shape parameters all need to be set elsewhere

function animate() {

  // lenghth of animation loop
  const tLoop = tStatic + tMorph;

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

  // initial shapes
  let static_shape = 'box';
  let next_shape;
  let old_coords = Array(4);
  let new_coords = Array(4);
  let choices = ['box', 'tl_tri_1', 'tl_tri_2', 'tr_tri_1', 'tr_tri_2',
            'bl_tri_1', 'bl_tri_2', 'br_tri_1', 'br_tri_2',
            'line_top', 'line_left', 'line_right', 'line_bottom',
            'neg_diag_1', 'neg_diag_2', 'pos_diag_1', 'pos_diag_2']
  let box_array = ['box'];
  let triangles = ['tl_tri_1', 'tl_tri_2', 'tr_tri_1', 'tr_tri_2',
                  'bl_tri_1', 'bl_tri_2', 'br_tri_1', 'br_tri_2'];
  let edges = ['line_top', 'line_left', 'line_right', 'line_bottom'];
  let diags = ['neg_diag_1', 'neg_diag_2', 'pos_diag_1', 'pos_diag_2'];
  let difference = Array(4);
  const iv = setInterval(draw, delay);

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

  // update shape locations and movement directions
  function updateShapeData(i) {
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

  function drawPolygon(coords) {
    let sides = coords.length;

    for (j = 0; j < numCanvas; j++) {
      const ctx = contextArray[j];
      let coords_tr = coords.map(elem =>
        (transform[j][0] === 1) ? elem : [width - elem[0], elem[1]]);
      coords_tr = coords_tr.map(elem =>
        (transform[j][1] === 1) ? elem : [elem[0], height - elem[1]]);
      ctx.beginPath();
      ctx.moveTo(coords_tr[0][0], coords_tr[0][1]);
      for (k = 1; k < sides; k++) {
        ctx.lineTo(coords_tr[k][0], coords_tr[k][1]);
      }
      if (sides > 2) {
        ctx.closePath();
      }
      ctx.stroke();
    }
  }

  function drawShape(i) {
    // Define points of the shapes
    let tl = [x[i], y[i]];
    let tr = [x[i] + size[i], y[i]];
    let bl = [x[i], y[i] + size[i]];
    let br = [x[i] + size[i], y[i] + size[i]];
    // Define coordinates for static shapes
    let shape_coords = {
      'box': [tl, tr, br, bl],
      'br_tri_1': [tr, tr, br, bl],
      'br_tri_2': [bl, tr, br, bl],
      'tr_tri_1': [tl, tl, tr, br],
      'tr_tri_2': [tl, tr, br, tl],
      'bl_tri_1': [tl, tl, br, bl],
      'bl_tri_2': [tl, br, br, bl],
      'tl_tri_1': [tl, tr, tr, bl],
      'tl_tri_2': [tl, tr, bl, bl],
      'neg_diag_1': [tl, tl, br, br],
      'neg_diag_2': [tl, br, br, tl],
      'pos_diag_1': [tr, tr, bl, bl],
      'pos_diag_2': [bl, tr, tr, bl],
      'line_top': [tl, tr, tr, tl],
      'line_right': [tr, tr, br, br],
      'line_bottom': [bl, br, br, bl],
      'line_left': [tl, tl, bl, bl],
    }
    // draw static shape
    if (t < tStatic){
      drawPolygon(shape_coords[static_shape]);
    }
    //pick next shape on the first shape where t is exactly tStatic
    if (i === 0 && t === tStatic) {
      next_shape = choices[Math.floor(Math.random() * choices.length)];
    }
    // draw changing shape
    if (t >= tStatic) {
      old_coords = shape_coords[static_shape];
      new_coords = shape_coords[next_shape];
      let change = Array(4);
      for (j = 0; j < 4; j++) {
        change[j] = [old_coords[j][0] + (new_coords[j][0] - old_coords[j][0])*(t - tStatic)/tMorph,
          old_coords[j][1] + (new_coords[j][1] - old_coords[j][1])*(t - tStatic)/tMorph];
      }
      drawPolygon(change);
    }
    // update current shape at end of morph
    if (i === 0 && t === tLoop) {
      static_shape = next_shape;
    }
  }

  function draw() {
    // clear the space
    for (j = 0; j < numCanvas; j++) {
      const ctx = contextArray[j];
      ctx.clearRect(0, 0, width, height);
    }

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
      updateShapeData(i);
    }
    // increment time
    t++;
    if (t > tLoop) t = t % tLoop;
  }
}

window.requestAnimationFrame(animate);
