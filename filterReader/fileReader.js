// 文件读取模块
// file 文件对象
// events 事件回调对象 包含 load  progress success

var FileLoader = function (file, events) {
    this.reader = new FileReader();
    this.file = file;
    this.loaded = 0;//已经读取的大小
    this.total = file.size;
    //分步上传， 每读取1M 上传1M
    this.step = 1024 * 1024;
    this.events = events || {};
    //读取第一块
    this.bindEvent();
    this.readBlob(0);
}

FileLoader.prototype = {
    bindEvent: function () {
        var _this = this;
        this.reader.onload = function (e) {
            _this.onLoad();
        }
        this.reader.onprogress = function (e) {
            _this.onProgress(e.loaded);
        }
        // loadstart  abort  error 回调函数暂时不加 
    },
    // onprogress 函数回调
    onProgress: function (loaded) {
        var percent,
            handler = this.events.progress;
        this.loaded += loaded;
        percent = (this.loaded / this.total) * 100;
        handler && handler(percent);
    },
    //读取结束 每一次执行readAsText结束时调用
    onLoad: function () {
        var handler = this.events.load;
        //上传数据到服务器
        handler && handler(this.reader.result);
        // 如果还没读取完(因为可能是分步读取), 则继续读取
        if (this.loaded < this.total) {
            this.readBlob(this.loaded);
        } else {
            this.loaded = this.total;
            // 执行成功的回调函数
            this.events.success && this.events.success();
        }
    },
    readBlob: function (start) {
        var blob,
            file = this.file;
            
        //如果支持分步读取，则分步读取；如果不支持，则一次读取；
        if (file.slice) {
            blob = file.slice(start, start + this.step);
        } else {
            blob = file;
        }
        this.reader.readAsText(blob);
    },
    //终止读取
    abort: function () {
        if (this.reader) {
            this.reader.abort();
        }
    }
}