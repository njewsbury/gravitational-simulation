var RingBuffer = function (maxLength) {
    this.maxLength = maxLength;
    this.currentSize = 0;

    this.pointer = 0;
    this.buffer = [];
};

RingBuffer.prototype.push = function (element) {
    this.buffer[ this.pointer ] = element;
    this.pointer = (this.pointer + 1) % this.maxLength;
    if (this.currentSize < this.maxLength) {
        this.currentSize++;
    }
};

RingBuffer.prototype.toArray = function () {
    return this.buffer.slice(0, this.currentSize);
};

RingBuffer.prototype.getAverage = function () {
    var sum = 0.0;
    var avg = 0.0;
    
    if (this.buffer.length > 0) {
        $.each(this.buffer, function (index, element) {
            sum += element;
        });
        avg = (sum/this.currentSize);
    }
    return avg;
};

