let timeouts = [];

class Timeout {
    constructor(func, timeoutInSec, param){
        this.startTime = null;
        this.id = null;
        this.execute = func;
        this.timeoutInSec = timeoutInSec;
        this.param = param;
    }

    begin(){
        this.startTime = new Date();
        this.id = setTimeout(this.execute, this.timeoutInSec*1000, this.param);
        timeouts.push(this);
        return this.id;
    }

    extend(seconds){
        clearTimeout(this.id);
        this.id = setTimeout(this.execute, (seconds + this.timeoutInSec - ((new Date().getTime() - this.startTime.getTime()) / 1000))*1000, this.param);
    }
}