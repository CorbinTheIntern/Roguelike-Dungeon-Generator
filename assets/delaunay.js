const EPSILON = 1.0 / 1048576.0;

function circumcircle(vertices, i, j, k) {
    let one = {
        'x': vertices[i][0],
        'y': vertices[i][1]
    };
    
    let two = {
        'x': vertices[j][0],
        'y': vertices[j][1]
    };
    
    let three = {
        'x' = vertices[k][0],
        'y' = vertices[k][1]
    };
    
    let AbsOneYMinusTwoY = abs(one.y - two.y);
    let AbsTwoYMinusThreeY = abs(two.y - three.y);
    
    if(AbsOneYMinusTwoY < EPSILON && AbsTwoYMinusThreeY < EPSILON) throw new Error('Oops. Your points are touching.');
    
    let xc, yc, m1, m2, mx1, mx2, my1, my2;
    
    if (AbsOneYMinusTwoY < EPSILON) {
		m2  = -((three.x - two.x) / (three.y - two.y));
		mx2 = (two.x + three.x) / 2.0;
		my2 = (two.y + three.y) / 2.0;
		xc  = (two.x + one.x) / 2.0;
		yc  = m2 * (xc - mx2) + my2;
    } else if (AbsTwoYMinusThreeY < EPSILON) {
		m1  = -((two.x - one.x) / (two.y - one.y));
		mx1 = (one.x + two.x) / 2.0;
		my1 = (one.y + two.y) / 2.0;
		xc  = (three.x + two.x) / 2.0;
		yc  = m1 * (xc - mx1) + my1;
    } else {
		m1  = -((two.x - one.x) / (two.y - one.y));
		m2  = -((three.x - two.x) / (three.y - two.y));
		mx1 = (one.x + two.x) / 2.0;
		mx2 = (two.x + three.x) / 2.0;
		my1 = (one.y + two.y) / 2.0;
		my2 = (two.y + three.y) / 2.0;
		xc  = (m1 * mx1 - m2 * mx2 + my2 - my1) / (m1 - m2);
		yc  = (AbsOneYMinusTwoY > AbsTwoYMinusThreeY) ? m1 * (xc - mx1) + my1 : m2 * (xc - mx2) + my2;
	}
}

function dedup(edges) {
	var a, b, n, m;
	
	for (var j = edges.length; j; ) {
		b = edges[--j];
		a = edges[--j];

		for (var i = j; i; ) {
			n = edges[--i];
			m = edges[--i];

			if((a === m && b === n) || (a === n && b === m)) {
				edges.splice(j, 2);
				edges.splice(i, 2);
				break;
			}
		}
	}
}

function triangulate(vertices) {
	var n = vertices.length;

	/* Bail if there aren't enough vertices to form any triangles. */
	if (n < 3) return [];

	/* Slice out the actual vertices from the passed objects. (Duplicate the
	 * array even if we don't, though, since we need to make a supertriangle
	 * later on!) */
	vertices = vertices.slice(0);

	/* Make an array of indices into the vertex array, sorted by the
	 * vertices' x-position. Force stable sorting by comparing indices if
	 * the x-positions are equal. */
	var indices = new Array(n);

	for (var i = n - 1; i >= 0; i--) indices[i] = i;
	
	indices.sort(function(i, j) {
		var diff = vertices[j][0] - vertices[i][0];
		return diff !== 0 ? diff : i - j;
	});

	/* Next, find the vertices of the supertriangle (which contains all other
	 * triangles), and append them onto the end of a (copy of) the vertex
	 * array. */
	var st = supertriangle(vertices);
	vertices.push(st[0], st[1], st[2]);
      
	/* Initialize the open list (containing the supertriangle and nothing
	 * else) and the closed list (which is empty since we havn't processed
	 * any triangles yet). */
	var open   = [circumcircle(vertices, n + 0, n + 1, n + 2)];
	var closed = [];
	var edges  = [];

	/* Incrementally add each vertex to the mesh. */
	for (i = indices.length; i--; edges.length = 0) {
		var c = indices[i];

		/* For each open triangle, check to see if the current point is
		 * inside it's circumcircle. If it is, remove the triangle and add
		 * it's edges to an edge list. */
		for (var j = open.length - 1; j >= 0; j--) {
			/* If this point is to the right of this triangle's circumcircle,
			 * then this triangle should never get checked again. Remove it
			 * from the open list, add it to the closed list, and skip. */
			var dx = vertices[c][0] - open[j].x;
			if (dx > 0.0 && dx * dx > open[j].r) {
				closed.push(open[j]);
				open.splice(j, 1);
				continue;
			}

			/* If we're outside the circumcircle, skip this triangle. */
			var dy = vertices[c][1] - open[j].y;
			if (dx * dx + dy * dy - open[j].r > EPSILON) continue;

			/* Remove the triangle and add it's edges to the edge list. */
			edges.push(
				open[j].i, open[j].j,
				open[j].j, open[j].k,
				open[j].k, open[j].i
			);
			open.splice(j, 1);
		}

		/* Remove any doubled edges. */
		dedup(edges);

		/* Add a new triangle for each edge. */
		for (var j = edges.length; j; ) {
			b = edges[--j];
			a = edges[--j];
			open.push(circumcircle(vertices, a, b, c));
		}
	}

	/* Copy any remaining open triangles to the closed list, and then
	 * remove any triangles that share a vertex with the supertriangle,
	 * building a list of triplets that represent triangles. */
	for (i = open.length; i--; ) closed.push(open[i]);
	open.length = 0;

	for (i = closed.length; i--; ) if(closed[i].i < n && closed[i].j < n && closed[i].k < n) open.push(closed[i].i, closed[i].j, closed[i].k);

	/* Yay, we're done! */
	return open;
	
	function supertriangle(verts) {
		var xmin = Number.POSITIVE_INFINITY;
		var	ymin = Number.POSITIVE_INFINITY;
		var	xmax = Number.NEGATIVE_INFINITY;
		var	ymax = Number.NEGATIVE_INFINITY;

		for (var i = 0; i < verts.length; i++) {
			if (verts[i][0] < xmin) xmin = verts[i][0];
			if (verts[i][0] > xmax) xmax = verts[i][0];
			if (verts[i][1] < ymin) ymin = verts[i][1];
			if (verts[i][1] > ymax) ymax = verts[i][1];
		}

		var dx = xmax - xmin;
		var dy = ymax - ymin;
		var dmax = Math.max(dx, dy);
		var xmid = xmin + (dx * 0.5);
		var ymid = ymin + (dy * 0.5);
		
		return [
			[(xmid - 20 * dmax), (ymid - dmax)],
			[(xmid), (ymid + 20 * dmax)],
			[(xmid + 20 * dmax), (ymid - dmax)],
		];
	}
}

function contains(tri, p) {
	/* Bounding box test first, for quick rejections. */
	if ((p[0] < tri[0][0] && p[0] < tri[1][0] && p[0] < tri[2][0]) ||
		(p[0] > tri[0][0] && p[0] > tri[1][0] && p[0] > tri[2][0]) ||
		(p[1] < tri[0][1] && p[1] < tri[1][1] && p[1] < tri[2][1]) ||
		(p[1] > tri[0][1] && p[1] > tri[1][1] && p[1] > tri[2][1])) return null;

	var a = tri[1][0] - tri[0][0];
	var b = tri[2][0] - tri[0][0];
	var c = tri[1][1] - tri[0][1];
	var d = tri[2][1] - tri[0][1];
	var i = a * d - b * c;

	/* Degenerate tri. */
	if (i === 0.0) return null;

	var u = (d * (p[0] - tri[0][0]) - b * (p[1] - tri[0][1])) / i;
	var v = (a * (p[1] - tri[0][1]) - c * (p[0] - tri[0][0])) / i;

	/* If we're outside the tri, fail. */
	if(u < 0.0 || v < 0.0 || (u + v) > 1.0) return null;

	return [u, v];
}