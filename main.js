//キャンバスに画像を描画する
function loadImage(id)
{
    //画像を読み込んでImageオブジェクトを作成する
    // ベース画像の読み込み
    const baseImage = new Image();
    baseImage.src = "img/base.png";
    baseImage.onload = function() {
        //画像ロードが完了してからキャンバスの準備をする
        let canvas = document.getElementById(id);
        let ctx = canvas.getContext('2d');
        // 画像の圧縮
        let resizeWidth = document.documentElement.clientWidth;
        let rate = document.documentElement.clientWidth / baseImage.width;
        let resizeHeight = rate * baseImage.height;
        //キャンバスのサイズを画像に合わせる
        canvas.width = resizeWidth;
        canvas.height = resizeHeight;
        //文字列画像を作成
        drawText("preview","sentence");
        const textImage = new Image();
        textImage.src = canvas.toDataURL();
        textImage.onload =  function () {
            //文字列画像を変形
            let cvImage = new cv.Mat();
            const tmpimg = cv.imread(textImage);
            cv.cvtColor(tmpimg,cvImage, cv.COLOR_RGB2RGBA);
            //alpha値を弱める
            let channels = new cv.MatVector();
            cv.split(cvImage, channels);
            let alphaChannel = channels.get(channels.size() - 1);
            alphaChannel.convertTo(alphaChannel, -1, 0.5);

            channels.set(channels.size() - 1, alphaChannel);
            cv.merge(channels, cvImage);
            const transformedImage = transformImage(cvImage,resizeHeight,resizeWidth);
            // MatオブジェクトをImageオブジェクトに変換
            cv.imshow(canvas, transformedImage);
            let imgElement = new Image();
            imgElement.src = canvas.toDataURL();
            // キャンバスをクリアする
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            //ベース画像をcanvasに描画
            ctx.drawImage(baseImage, 0, 0,resizeWidth,resizeHeight);
            //文字列画像をcanvasに描画
            imgElement.onload = function(){
                ctx.drawImage(imgElement, 0, 0,resizeWidth,resizeHeight);
            }
            //オブジェクトの削除
            cvImage.delete();
            transformedImage.delete();
            channels.delete();
        };
        
    };
    
}
//キャンバスに文字を描く
function drawText(canvas_id, text_id)
{
    let canvas = document.getElementById(canvas_id);
    let ctx = canvas.getContext('2d');
    let text = document.getElementById(text_id);
    let textArray = text.value.split('');
    //文字のスタイルを指定
    var font_size = Math.round(canvas.width / 5);
    ctx.font = String(font_size)+'px serif';
    ctx.fillStyle = '#000000';
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    //座標を指定して文字を描く
    let x = 0;
    let y = font_size*0.2;
    for(var i = 0; i < textArray.length; i++){
		ctx.fillText(textArray[i], x, y);
        x+=font_size;
        if((i+1)%5 == 0){
            y+=font_size;
            x = 0;
        }
    }
    
}
function onOpenCvReady()
{
    let sentence = document.getElementById('sentence');
    sentence.value = 'テストああああああああああ';
    cv['onRuntimeInitialized'] = () => {
        loadImage('preview');
    }
    
}
function transformImage(im,resizedRows,resizedCols) {

    let transformedIm = new cv.Mat();
    const rows = im.rows;
    const cols = im.cols;
    let dsize = new cv.Size(cols, rows);
    const fromPts = cv.matFromArray(4, 1, cv.CV_32FC2, [
        cols, 0, 0, 0, 0, rows, cols, rows
    ]);
    //変換先の行列.ベース画像に合わせた数字.
    const toPts = cv.matFromArray(4, 1, cv.CV_32FC2, [
        resizedCols*0.7275, resizedRows*0.24, resizedCols*0.28, resizedRows*0.19, resizedCols*0.24, resizedRows*0.73, resizedCols*0.725, resizedRows*0.725
    ]);
    const M = cv.getPerspectiveTransform(fromPts, toPts); 
    cv.warpPerspective(im, transformedIm, M, dsize);
    //オブジェクトの削除
    fromPts.delete();
    toPts.delete();
    return transformedIm;

}