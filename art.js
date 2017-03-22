function newRequest() {
	var request = {
		page: getRandomNumber(30),
		perPage: getRandomNumber(30),
		offset: getRandomNumber(30),
		sortBy: sortBy(),
		material: material()
	};

	return request;
}

function sortBy() {
	var sorts = ['Relevance', 'Title', 'Date', 'ArtistMaker', 'AccessionNumber'];
	var index = getRandomNumber(sorts.length);
	return sorts[index];
}

function material() {
	var materials = localStorage.getItem('materials');
	if (!materials) {
		materials = 			['Albumen','Albumen%20silver%20prints','Albums','Arms','Baseball%20cards','Beads','Bone','Books','Bottles','Bowls','Brass','Bronze','Canvas','Ceramics','Chalk','Clay','Color%20lithographs','Copper','Copper%20alloy','Costume','Cotton','Cups','Dishes','Drawings','Dresses','Drinking%20vessels','Earthenware','Edged%20weapons','Embroidery','Enamels','Engraving','Engravings','Ephemera','Etching','Faience','Figures','Figurines','Film','Fragments','Furniture','Gelatin%20silver%20prints','Gilt','Glass','Glaze','Glazing','Gold','Gouache','Graphite','Illustrations','Ink','Intaglio%20prints','Iron','Iron%20alloy','Iron%20and%20iron%20alloy','Ivory','Jars','Jewelry','Lace','Leather','Limestone','Linen','Lithographs','Metal','Metalwork','Musical%20instruments','Needlework','Negatives','Painting','Paintings','Paper','Photographs','Photolithographs','Photomechanical%20reproductions','Planographic%20prints','Porcelain','Pottery','Printing','Printing%20blocks','Prints','Relief%20prints','Reliefs','Scarabs','Sculpture','Silk','Silver','Statues','Steel','Stone','Swords','Terracotta','Textiles','Vases','Vessels','Watercolors','Wood','Wood%20blocks','Wood%20engravings','Woodblock%20prints','Wool','Woven'];
		localStorage.setItem('materials', materials.join(','));
	} else {
		materials = materials.split(',');
	}
	var index = getRandomNumber(materials.length);
	return materials[index];
}

function getRandomNumber(max) {
	return Math.floor(Math.random()*max);
}

function parseImage(res) {
	var json = JSON.parse(res.responseText);
	var index = getRandomNumber(json.results.length);
	return json.results[index];
}

var getImage = function(request) {
	return $.ajax({
		dataType: 'json',
		method: 'get',
		url: 'https://www.metmuseum.org/api/collection/collectionlisting?artist=&department=&era=&geolocation=&material='+request.material+'&offset=0&pageSize='+request.pageSize+'&perPage='+request.perPage+'&showOnly=withImage%7Copenaccess&sortBy='+request.sortBy+'&sortOrder=asc'
	});
}

// grab an image for now
function imageNow() {
	var i = localStorage.getItem('image');
	var m = localStorage.getItem('material')
	if (i && m) {
		i = JSON.parse(i);
		setImage(i, m);
	} else {
		var r = newRequest();
		var p = getImage(r);
		$.when(p).done(function() {
			i = parseImage(pNow);
			setImage(i, r.material);
		});
	}
	removeLoading();
}

function setImage(i, m) {
	$('img').attr('src', 'http://images.metmuseum.org/CRDImages/'+i.largeImage);
	$('#title').append($.parseHTML(i.title || 'Untitled'));
	$('#date').append(i.date || 'n.d.');
	$('#info').attr('href', 'http://metmuseum.org'+i.url);
	$('#like').attr('material', m)
}

// grab a new image for next time
function imageLater() {
	var r = newRequest();
	var p = getImage(r);
	$.when(p).done(function() {
		var i = parseImage(p);
		console.log(i);
		var s = JSON.stringify(i);
		localStorage.setItem('material', r.material);
		localStorage.setItem('image', s);
	});
}

function removeLoading() {
	$(window).on('load', function() {
		$('.loading').remove();
		$('.content').css('display', 'block');
	});
}

function addMaterial(m) {
	var materials = localStorage.getItem('materials').split(',');
	materials.push(m);
	localStorage.setItem('materials', materials.join(','));
}

function removeMaterial() {
	var materials = localStorage.getItem('materials').split(',');
	materials.pop();
	localStorage.setItem('materials', materials.join(','));
}

imageNow();
imageLater();

$('#like').click(function() {
	$(this).toggleClass('checked');
	var m = $(this).attr('material');
	if ($(this).hasClass('checked')) {
		addMaterial(m);
	} else {
		removeMaterial();
	}
});

$('#about').click(function() {
	$(this).toggleClass('checked');
	if ($(this).hasClass('checked')) {
		$('.about').removeClass('checked-move-left').addClass('checked-move-top');
	} else {
		$('.about').removeClass('checked-move-top').addClass('checked-move-left');
		setTimeout(function() { $('.about').removeClass('checked-move-left'); }, 300);
	}
});
