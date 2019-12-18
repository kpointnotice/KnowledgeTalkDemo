function pdfToCanvasBlob(file, callback) {
    try {
        let scale = 1.2;
        PDFJS.getDocument(file).then(function(pdf) {
            let pages = pdf.numPages;

            pdfUpStart();
            for (let index = 1; index <= pages; index ++) {
                pdf.getPage(index).then(function(page) {

                    let canvas = document.createElement('canvas');
                    let canvasContext = canvas.getContext('2d');
                    let viewport = page.getViewport(scale);
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    let renderTask = page.render({canvasContext, viewport});
                    
                    renderTask.promise.then(function() {
                        canvas.toBlob(function(blob) {
                            callback(null, blob, pages)
                        }, 'image/jpeg');
                    });
                    pdfUpMove(index, pages);
                });
            }
        });

    } catch (err) {
        callback(err, null)
    }

    function pdfUpStart() {
        let elem = document.querySelector("#pdfUploader .bar");
        document.getElementById("pdfUploader").style.display = "";
        
        elem.style.width = '0';
        elem.innerHTML = '0';
      }
    function pdfUpMove(cur, max) {
        let elem = document.querySelector("#pdfUploader .bar");
        if (cur < max) {
            elem.style.width = ((cur/max)*100) + '%';
            elem.innerHTML = ((cur/max)*100)  + '%';
        } else {
            elem.style.width = '100%';
            elem.innerHTML = '100%';
            pdfUpEnd();
        }
    }
    function pdfUpEnd() {
        document.getElementById("pdfUploader").style.display = "none";
    }
}
