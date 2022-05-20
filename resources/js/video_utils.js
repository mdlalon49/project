var videoSelector = $('.jsp-env');
var videoDomain1 = videoSelector.attr('data-videoDomain1');
var videoDomain2 = videoSelector.attr('data-videoDomain2');
var videoDomain3 = videoSelector.attr('data-videoDomain3');
var videoDomain4 = videoSelector.attr('data-videoDomain4');

function openVideoFileInput() {
    document.getElementById('input_video').click();
}
function sendVideo(file, start_handler, succ_handler, err_handler, complete_handler, progress_handler) {

    var filename = Date.now() + ".mp4";
    var fd = new FormData();
    fd.append('filename', filename);
    fd.append('file', file);

    console.log('Sending video: ' + filename);

    jQuery.ajax({
        url: location.protocol + '//' + imageProcessorDomain + '/upload_video/',
        data: fd,
        cache: false,
        contentType: false,
        processData: false,
        crossDomain: true,
        type: 'POST',
        async: true,
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
function handlePostVideo(raw_data, videoList, callback) {
    var data = raw_data.data;
    var videoData = {
        domain: parseVideoDomain(data['video_name'], videoDomain1, videoDomain2, videoDomain3, videoDomain4),
        videoName: data['video_name'],
        coverName: data['cover_name'],
        hashContent: data['hash_content'],
        fileSize: data['file_size'],
        path: parseImagePath(data['video_name'], '_v.mp4'),
        type: data['type'],
        banned: data['banned'],
        id: data['id']
    };
    videoList.push(videoData);
    callback(postVideos);
}
function uploadVideoFile(file, loadstart, loadend, loadprogress, loadsuccess, loaderror, loadabort) {
    var fd = new FormData();
    fd.append('filename', file['filename']);
    fd.append('file', file['file']);

    console.log('Sending file via ajax: ' + file['filename']);
    console.log(fd);

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function (ev) {
        if (xhr.readyState == 4) {
            try {
                var response = JSON.parse(xhr.response);
                loadsuccess(response);
            }
            catch (e) {
                loaderror(xhr.responseText);
            }
        }
    };

    xhr.upload.onloadstart = loadstart;
    xhr.upload.onloadend = loadend;
    xhr.upload.onprogress = loadprogress;
    xhr.upload.onabort = loadabort;
    var uploadUrl = location.protocol + '//' + imageProcessorDomain + '/upload_video/';
    xhr.open('POST', uploadUrl, true);
    xhr.send(fd);
}

function shortVideoLink(videoData) {
    var domain = videoData.type !== 1 ? videoData.domain : imagePreviewDomain;
    var path = videoData.type !== 1 ? videoData.path : videoData.videoName;
    var ext = (path.search(/_v\.mp4/) > 0) ? '' : '_v.mp4';
    return location.protocol + '//' + domain + '/' + path + ext;
}

function posterLink(videoData) {
    var domain = videoData.type !== 1 ? parseVideoDomain(videoData.coverName, videoDomain1, videoDomain2, videoDomain3, videoDomain4) : imagePreviewDomain;
    var path = videoData.type !== 1 ? parseImagePath(videoData.coverName, '_c.jpg') : videoData.coverName + '_c.jpg';
    return location.protocol + '//' + domain + '/' + path;
}

function displayVideoContent(postVideoList, videoContainer) {
    videoContainer.innerHTML = "";
    for (var n = 0; n < 4; ++n) {
        var width_style = n > postVideoList.length ? 'width-25proc' : 'width-24proc';
        var videoSubContainer = document.createElement('div');
        var dragVideoClass = n === postVideoList.length ? 'drag-media drag-video ' : '';
        videoSubContainer.className = 'marg-top-10 delete_element fromLeft centered clickToHideErrorMessages ' +
            dragVideoClass + width_style;
        if (n > postVideoList.length) {
            var divPicLabel = document.createElement('div');
            divPicLabel.className = 'picLabel';
            divPicLabel.innerHTML = '<div>' + (n + 1) + '</div>';
            videoSubContainer.appendChild(divPicLabel);
        }

        if (n < postVideoList.length) {
            var videoControl = document.createElement('video');
            videoControl.controls = true;
            videoControl.loop = true;
            videoControl.preload = 'metadata';
            videoControl.poster = posterLink(postVideoList[n]);
            var videoUrl = shortVideoLink(postVideoList[n]);

            var innerSrc = document.createElement('source');
            innerSrc.src = videoUrl;
            innerSrc.type = "video/*";
            innerSrc.innerHTML = "Your browser does not support the video tag";
            videoControl.appendChild(innerSrc);
            videoSubContainer.appendChild(videoControl);
        }

        if (n === postVideoList.length) {
            var openFileElement = document.createElement('img');
            openFileElement.src = '/resources/img/select_video_button.png';
            openFileElement.onclick = function (ev) {
                openVideoFileInput();
            };
            videoSubContainer.appendChild(openFileElement);
            var progressBarDiv = document.createElement('div');
            progressBarDiv.setAttribute('id', 'upload_video_progress_id');
            progressBarDiv.style.display = 'none';
            progressBarDiv.innerHTML = "<progress class='videodelete' id='progress_bar_video_id' value='0' max='100'>";
            videoSubContainer.appendChild(progressBarDiv);
        }

        if (n > postVideoList.length) {
            var placeHolderElement = document.createElement('img');
            placeHolderElement.src = '/resources/img/pic_placeholder.png';
            videoSubContainer.appendChild(placeHolderElement);
        }

        if (n < postVideoList.length) {
            var delVideoElement = document.createElement('div');
            delVideoElement.className = 'imagedelete';
            delVideoElement.setAttribute('onclick', 'deleteVideo(' + n + ')');
            delVideoElement.innerHTML = 'remove';
            videoSubContainer.appendChild(delVideoElement);
        }

        if (n >= postVideoList.length) {
            var delEmptyElement = document.createElement('div');
            delEmptyElement.className = 'imageDeleteEmpty';
            videoSubContainer.appendChild(delEmptyElement);
        }

        videoContainer.appendChild(videoSubContainer);
    }
}
