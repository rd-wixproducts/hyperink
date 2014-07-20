var canvas, ctx;
var client = BinaryClient('ws://hy.protobowl.com:3000/');

var lastrender = 0;

function get_ctx(){
	if(!document.getElementById('swag')){
		setTimeout(get_ctx, 10)
		return
	}
	canvas = document.getElementById('swag');
	ctx = canvas.getContext('2d')

	mini_width = Math.floor(canvas.width / 10)
	mini_height = Math.floor(canvas.height / 10);

	edit_times = new Float64Array(mini_width * mini_height);
}


get_ctx();

client.on('open', function(stream){
	console.log('wumbo')
	

	client.on('stream', function(stream, meta){
		var fuppies = (1000/(Date.now() - lastrender))
		if(document.getElementById('puppies')){
			document.getElementById('puppies').innerHTML = fuppies.toFixed(1) + ' FPS'	
		}
		
		lastrender = Date.now();

		var parts = [];
		stream.on('data', function(data){ parts.push(data); });
		stream.on('end', function(){
			var url = (window.URL || window.webkitURL).createObjectURL(new Blob(parts));
			var img = new Image();
			img.src = url;
			img.onload = function(){
				ctx.save()
				ctx.rotate(-3 * Math.PI / 2)
				ctx.drawImage(img, 0, -773)
				ctx.restore()

				var dat = ctx.getImageData(0, 0, canvas.width, canvas.height);
				var swt = do_magic(dat)
				var swat = dilate_contours(swt)
				for(var i = 0; i < swat.data.length; i++){
					if(!swat.data[i]) dat.data[i * 4 + 3] = 0;
				}


				most_recent_blob = dat;

				fucking_change_dat_shit(document.getElementById('zombocom').value)

			}
			
		});
		// var file = fs.createWriteStream(meta.file);
		// stream.pipe(file);
		console.log(stream, meta)
	}); 
});


function dilate_contours(marker){
	var dilation = new jsfeat.matrix_t(marker.cols, marker.rows, jsfeat.U8C1_t);
	for(var i = 0; i < marker.data.length; i++){
		if(marker.data[i]){
			dilation.data[i + 1] = dilation.data[i - 1] = dilation.data[i + dilation.cols] = dilation.data[i - marker.cols] = 1
		}
	}
	return dilation
}

function fucking_change_dat_shit(value){
	// console.log(value)

	ctx.putImageData(most_recent_blob, 0, 0)
	
	ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'

	for(var x = 0; x < mini_width; x++){
		for(var y = 0; y < mini_height; y++){
			if(edit_times[y * mini_width + x] > value){
				// console.log(x, y)
				ctx.fillRect(x * 10, y * 10, 10, 10)
			}
		}
	}

}


var most_recent_blob;

function do_magic(src){
	var params = {
		// the kernel size for the gaussian blur before canny
		kernel_size: 0,
		// low and high thresh are parameters for the canny edge detector
		low_thresh: 124,
		high_thresh: 204,
		max_stroke: 10
	}

	var width = src.width, height = src.height;
	
	var img_u8 = new jsfeat.matrix_t(width, height, jsfeat.U8C1_t)
	var img_dxdy = new jsfeat.matrix_t(width, height, jsfeat.S32C2_t);

	console.time("image processing")

	jsfeat.imgproc.grayscale(src.data, img_u8.data)
	jsfeat.imgproc.sobel_derivatives(img_u8, img_dxdy)
	// jsfeat.imgproc.gaussian_blur(img_u8, img_u8, params.kernel_size, 0)
	jsfeat.imgproc.canny(img_u8, img_u8, params.low_thresh, params.high_thresh)
	
	params.direction = -1;

	var swt = raw_swt(img_u8, img_dxdy, params);
	console.timeEnd("image processing")

	if(typeof visualize_matrix == 'function') visualize_matrix(swt);
	
	var now = Date.now();

	var zom = document.getElementById('zombocom');
	if(zom.getAttribute('min') == '0'){
		zom.setAttribute('min', now)	
	}
	zom.setAttribute('max', now)
	
	if(now - zom.value < 1500){
		// zom.setAttribute('value', now)	
		zom.value = now
	}
	

	var added = [];
	for(var i = 0; i < swt.data.length; i++){
		var x = i % swt.cols,
			y = Math.floor(i / swt.cols);
		
		var wumbo = Math.floor(x / 10) + Math.floor(y / 10) * mini_width;

		if(swt.data[i]){
			if(!edit_times[wumbo]){
				edit_times[wumbo] = now;
				added.push(wumbo)
			}
		}
	}
	function fightclub(gatsby){
		if(!edit_times[gatsby]){
			edit_times[gatsby] = now;
		}
	}
	added.forEach(function(x){
		fightclub(x + 1)
		fightclub(x - 1)
		fightclub(x + mini_width)
		fightclub(x - mini_width)
	})



	return swt
}




// canny & sobel dx/dy
function raw_swt(img_canny, img_dxdy, params){
	var max_stroke = params.max_stroke, // maximum stroke width
		direction = params.direction,
		width = img_canny.cols,
		height = img_canny.rows;

	// nonzero Math.min function, if a is zero, returns b, otherwise minimizes
	function nzmin(a, b){
		if(a === 0) return b;
		if(a < b) return a;
		return b;
	}
	
	var strokes = [];
	var swt = new jsfeat.matrix_t(width, height, jsfeat.U8C1_t)
	
	console.time("first pass")
	// first pass of stroke width transform 
	for(var i = 0; i < width * height; i++){
		if(img_canny.data[i] != 0xff) continue; // only apply on edge pixels

		var itheta = Math.atan2(img_dxdy.data[(i << 1) + 1], img_dxdy.data[i << 1]); // calculate the image gradient at this point by sobel
		var ray = [i];
		var step = 1;
		
		var ix = i % width, iy = Math.floor(i / width);
		while(step < max_stroke){
			// extrapolate the ray outwards depending on search direction
			// libccv is particularly clever in that it uses 
			// bresenham's line drawing algorithm to pick out
			// the points along the line and also checks 
			// neighboring pixels for corners

			var jx = Math.round(ix + Math.cos(itheta) * direction * step);
			var jy = Math.round(iy + Math.sin(itheta) * direction * step);
			step++;
			if(jx < 0 || jy < 0 || jx > width || jy > height) break;
			var j = jy * width + jx;
			ray.push(j)
			if(img_canny.data[j] != 0xff) continue;
			// calculate theta for this ray since we've reached the other side
			var jtheta = Math.atan2(img_dxdy.data[(j << 1) + 1], img_dxdy.data[j << 1]); 
			
			if(Math.abs(Math.abs(itheta - jtheta) - Math.PI) < Math.PI / 2){ // check if theta reflects the starting angle approximately
				strokes.push(i)
				var sw = Math.sqrt((jx - ix) * (jx - ix) + (jy - iy) * (jy - iy)) // derive the stroke width
				for(var k = 0; k < ray.length; k++){ // iterate rays and set points along ray to minimum stroke width
					swt.data[ray[k]] = nzmin(swt.data[ray[k]], sw) // use nzmin because it's initially all 0's
				}
			}
			break;
		}
	}
	console.timeEnd("first pass")
	console.time("refinement pass")

	// second pass, refines swt values as median
	for(var k = 0; k < strokes.length; k++){
		var i = strokes[k];
		var itheta = Math.atan2(img_dxdy.data[(i << 1) + 1], img_dxdy.data[i << 1]);
		var ray = [];
		var widths = []
		var step = 1;

		var ix = i % width, iy = Math.floor(i / width);
		while(step < max_stroke){
			var jx = Math.round(ix + Math.cos(itheta) * direction * step);
			var jy = Math.round(iy + Math.sin(itheta) * direction * step);
			step++;
			var j = jy * width + jx;
			// record position of the ray and the stroke width there
			widths.push(swt.data[j])
			ray.push(j)			
			// stop when the ray is terminated
			if(img_canny.data[j] == 0xff) break;
		}
		var median = widths.sort(function(a, b){return a - b})[Math.floor(widths.length / 2)];
		// set the high values to the median so that corners are nice
		for(var j = 0; j < ray.length; j++){
			swt.data[ray[j]] = nzmin(swt.data[ray[j]], median)
		}
		// swt.data[ray[0]] = 0
		// swt.data[ray[ray.length - 1]] = 0
	}

	console.timeEnd("refinement pass")
	
	return swt
}




client.on('close', function(){
	console.log('blah closed')
	document.getElementById('disco').style.display = '';
	// setTimeout(function(){
	// 	location.reload(true)
	// }, 5000)
	setInterval(function(){
		var xhr = new XMLHttpRequest();
		xhr.open('GET', location.href, true)
		xhr.onload = function(){
			location.reload(true)
		}
		xhr.onerror = function(){
			document.getElementById('walps').innerHTML += 'MOAR WALP '
		}
		xhr.send(null)
	}, 3000)
})