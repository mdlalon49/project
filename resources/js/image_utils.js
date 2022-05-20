var imageSelector = $('.jsp-env');
var imageDomain1 = imageSelector.attr('data-imageDomain1');
var imageDomain2 = imageSelector.attr('data-imageDomain2');

var imagePreviewDomain = imageSelector.attr('data-imagePreview');
var imageProcessorDomain = imageSelector.attr('data-imageUpload');
var deletedImageDomain = imageSelector.attr('data-deletedImage');
var imageMiddle = imageSelector.attr('data-imageMiddle');
var image2Middle = imageSelector.attr('data-image2Middle');
var image3Middle = imageSelector.attr('data-image3Middle');

function openImageFileInput() {
    document.getElementById('input_image').click();
}

function parseImageDomain(imageName, domain1, domain2) {
    if (imageName === undefined || imageName == null || domain1 == null || domain2 == null) {
        return "";
    }

    if (parseInt(imageName, 16) < parseInt(imageMiddle, 16)) {
        return domain1;
    }

    return domain2;
}

function parseVideoDomain(imageName, domain1, domain2, domain3, domain4) {
    if (imageName === undefined || imageName == null || domain1 == null || domain2 == null || domain3 == null || domain4 == null) {
        return "";
    }

    console.log(">>>>PARSE VIDEO DOMAIN")
    console.log("imageMiddle "+imageMiddle)
    console.log("image2Middle "+image2Middle)
    console.log("image3Middle "+image3Middle)
    console.log("imageName "+imageName)


    if (parseInt(imageName, 16) < parseInt(image2Middle, 16)) {

        console.log("domain1 "+domain1)
        return domain1;
    }

    if (parseInt(imageName, 16) < parseInt(imageMiddle, 16)) {

        console.log("domain3 "+domain3)
        return domain3;
    }

    if (parseInt(imageName, 16) < parseInt(image3Middle, 16)) {

        console.log("domain2 "+domain2)
        return domain2;
    }

    console.log("domain4 "+domain4)
    return domain4;
}

function parseImageDomainView(imageName, type) {
    if (imageName === undefined || imageName == null) {
        return "";
    }
    if (type === undefined || type == null || (type !== 1 && type !==5)) {
        return parseImageDomain(imageName, imageDomain1, imageDomain2);
    }
    else if (type === 1) {
        return imagePreviewDomain;
    } else if (type === 5) {
        return deletedImageDomain;
    }
    else return "";
}

function parseImagePath(imageName, ext) {
    if (imageName === undefined || imageName == null) {
        return "";
    }
    var subdir = imageName.charAt(0) + '/' + imageName.charAt(1) + '/' + imageName.charAt(2) + '/' + imageName.charAt(3);
    return subdir + '/' + imageName + ext;
}
function parseImagePathView(imageName, type, ext) {
    if (type === undefined || type == null || type !== 1) {
        return parseImagePath(imageName, ext);
    } else if (type === 1) {
        return '/' + imageName + ext;
    } else {
        return "";
    }

}
function shorterImageLink(imageInfo) {
    var viewDomain = parseImageDomainView(imageInfo.imageName, imageInfo.type);

    var fullPath = viewDomain + '/' + parseImagePathView(imageInfo.imageName, imageInfo.type, '.jpg');

    if (fullPath !== undefined && fullPath != null) {

        var i = fullPath.search(/_f./);
        if (i >= 0) {
            return fullPath.replace(/_f./, '_s.');
        }
        else {
            i = fullPath.search(/.jpe?g/);
            return fullPath.substr(0, i) + '_s' + fullPath.substr(i);
        }
    }
    else {
        var path = imageInfo.path;
        if (path.indexOf('/') !== 0) {
            path = '/' + path;
        }

        var i = path.search(/.jpe?g/);
        console.log('Path: ' + path);
        console.log('Index ext: ' + j);
        if (i === -1) {
            path = path + '_s.jpg';
            console.log('New path: ' + path);
        } else {
            var j = path.search(/_f./);
            if (j < 0) {
                path = path.substr(0, i) + '_s' + path.substr(i);
            }
            else {
                path = path.replace(/_f./, '_s.');
            }

            console.log('Updated suffix: ' + path);
        }
        return imageInfo.domain + path;
    }

}
function sendImage(resizedImage, start_handler, succ_handler, err_handler, complete_handler, progress_handler) {
    var fd = new FormData();
    var filename = Date.now() + ".jpg";
    fd.append("file", resizedImage, filename);

    console.log('Sending image: ' + filename);
    console.log(fd);

    jQuery.ajax({
        url: location.protocol + "//" + imageProcessorDomain + '/upload_image/',
        data: fd,
        cache: false,
        contentType: false,
        processData: false,
        crossDomain: true,
        type: 'POST',
        success: function (data) {
            succ_handler(data);
        },
        error: function (err) {
            err_handler(err);
        },
        complete: function (data) {
            complete_handler(data);
        },
        xhr: function () {
            var xhr = $.ajaxSettings.xhr();
            if (xhr.upload) {
                if (start_handler) {
                    xhr.upload.onloadstart = start_handler;
                }
                if (progress_handler) {
                    xhr.upload.onprogress = progress_handler;
                }
            }
            else {
                console.warn("Browser does not support upload");
            }

            return xhr;
        }
    });
}
/* Utility function to convert a canvas to a BLOB */
function dataURLToBlob(dataURL) {
    var BASE64_MARKER = ';base64,';
    if (dataURL.indexOf(BASE64_MARKER) == -1) {
        var parts = dataURL.split(',');
        var contentType = parts[0].split(':')[1];
        var raw = parts[1];

        return new Blob([raw], {type: contentType});
    }

    var parts = dataURL.split(BASE64_MARKER);
    var contentType = parts[0].split(':')[1];
    var raw = window.atob(parts[1]);
    var rawLength = raw.length;

    var uInt8Array = new Uint8Array(rawLength);

    for (var i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], {type: contentType});
}
function resizeImage(image, callback) {
    // Resize the image
    var canvas = document.createElement('canvas'),
        max_size = 540,
        width = image.width,
        height = image.height;
    if (width > height) {
        if (width > max_size) {
            height *= max_size / width;
            width = max_size;
        }
    } else {
        if (height > max_size) {
            width *= max_size / height;
            height = max_size;
        }
    }

    canvas.width = width;
    canvas.height = height;
    canvas.getContext('2d')
        .drawImage(image, 0, 0, width, height);
    var dataUrl = canvas.toDataURL('image/jpeg');
    var resizedImage = dataURLToBlob(dataUrl);
    callback(resizedImage);
}
function displayImageContent(imageInfoList, imageContainer) {
    imageContainer.innerHTML = "";
    var n = imageInfoList.length;
    for (var i = 0; i < 12; ++i) {
        if (i < n)
        {
            var imageDiv = document.createElement('div');
            imageDiv.className = "marg-top-10 delete_element fromLeft centered clickToHideErrorMessages width-24proc";
            var imageUrl = shorterImageLink(imageInfoList[i]);
            imageDiv.innerHTML = "<img src='" + location.protocol + "//" + imageUrl + "' onerror='imageReloadForFail(this)'> <div class='imagedelete' onclick='deleteImage(" + i + ")'>remove</div>";
            imageContainer.appendChild(imageDiv);
        }

        if (i === n)
        {
            var addImageDiv = document.createElement('div');
            addImageDiv.className = "marg-top-10 delete_element fromLeft fixbag centered clickToHideErrorMessages width-24proc drag-media drag-image";
            addImageDiv.innerHTML = i === 0 ? "<img src='/resources/img/select_main_pic_button.png' onclick='openImageFileInput()'/>" : "<img src='/resources/img/select_pic_button.png' onclick='openImageFileInput()'/>";
            var progressBarDiv = document.createElement('div');
            progressBarDiv.setAttribute('id', 'upload_image_progress_id');
            progressBarDiv.style.display = 'none';
            progressBarDiv.innerHTML = "<progress class='videodelete' id='progress_bar_image_id' value='0' max='100'>";
            addImageDiv.appendChild(progressBarDiv);
            imageContainer.appendChild(addImageDiv);
        }

        if (i > n)
        {
            var numberDiv = document.createElement('div');
            var supportDiv1 = document.createElement('div');
            var supportImg = document.createElement('img');
            var supportDiv2 = document.createElement('div');
            numberDiv.className = "marg-top-10 delete_element fromLeft centered clickToHideErrorMessages width-25proc";
            supportDiv1.className = "picLabel";
            supportDiv1.innerHTML = "<div>" + (i + 1) + "</div>";
            supportImg.src = '/resources/img/pic_placeholder.png';
            supportDiv2.className = "imageDeleteEmpty";
            numberDiv.appendChild(supportDiv1);
            numberDiv.appendChild(supportImg);
            numberDiv.appendChild(supportDiv2);
            imageContainer.appendChild(numberDiv);
        }
    }
}
function handlePostImage(rawImage, imageList, callback) {
    var imageName = rawImage["image_name"];
    var imageDomain = parseImageDomain(imageName, imageDomain1, imageDomain2);
    var imagePath = parseImagePath(imageName, '.jpg');
    var imageInfo = {
        imageName: imageName,
        fileSize: rawImage["file_size"],
        hashContent: rawImage["hash_content"],
        dhashContent: rawImage["dhash_content"],
        width: rawImage["width"],
        height: rawImage["height"],
        domain: imageDomain,
        path: imagePath,
        fullPath: imageDomain + imagePath,
        type: rawImage["type"]
    };
    imageList.push(imageInfo);
    callback(imageList);
}
function preloadImages(jsonImageList) {
    var imageList = JSON.parse(jsonImageList);
    console.log(imageList);
    if (imageList) {
        imageList.forEach(function (img) {
            var image = new Image();
            var imgPath = 'https://' + img.fullPath;
            console.log("Path: " + imgPath);
            image.src = imgPath;
            image.load();
        })
    }
}
function imageReloadForFail(image) {
    image.onerror = null;
    setTimeout(function () {
        image.src += '?' + new Date();
    }, 3000);
}
