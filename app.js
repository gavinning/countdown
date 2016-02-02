var count = require('countdown');
var Class = require('aimee-class');
var App = Class.create();

exports.start = function(time, options, fn){
    App.instance().start(time, options, fn)
}

App.include({
    start: function(time, options, fn){
        var defaults, opt;

        if(typeof options === 'function'){
            fn = options;
            options = {};
        };

        defaults = {
            prefix: '',
            suffix: '',
            loop: false,
            fn: function(){},
            format: ['年', '月', '天', '小时', '分', '秒']
        };

        opt = Class.extend({}, defaults, options);

        try{
            time = (new Date(time)).getTime()
        }
        catch(e){
            fn(e)
        };

        opt.time = time + 1000;
        opt.initTime = time + 1000;
        opt.start = new Date().getTime();
        opt.fn = fn || opt.fn;
        this.stream = process.stderr;
        this.opt = opt;

        this.timer()
        this.timeHandler()
    },

    getStoptime: function(){
        this.opt.time -= 1000;
        this.opt.stop = this.opt.start + this.opt.time;
        return this.opt.stop;
    },

    render: function(string){
        this.stream.cursorTo(0);
        this.stream.write(string);
        this.stream.clearLine(1);
    },

    parse: function(){
        var last = [];
        var format = [];
        var time = count(this.opt.start, this.opt.stop);
        var arr = [time.years, time.months, time.days, time.hours, time.minutes, time.seconds];
        var length = arr.length;

        while(arr[0] === 0){
            arr.shift()
        }

        format = this.opt.format.slice(length - arr.length, length);

        arr.forEach(function(item, i){
            last.push([item, format[i]].join(''))
        })

        return last;
    },

    getString: function(){
        return [this.opt.prefix, this.parse().join(' '), this.opt.suffix].join(' ')
    },

    timeHandler: function(){
        this.getStoptime();
        this.render(this.getString());
        if(this.opt.time < 1000){
            this.clear();
            this.opt.fn(null);
            if(this.opt.loop && !this.timing){
                this.opt.time = this.opt.initTime;
                this.timer();
                this.timeHandler();
            }
        }
    },

    timer: function(){
        this.timing = true;
        this.settime = setInterval(this.timeHandler.bind(this), 1000)
    },

    clear: function(){
        this.stream.cursorTo(0);
        this.stream.clearLine(1);
        this.timing = false;
        clearInterval(this.settime);
    },

    stop: function(){
        this.clear()
        process.exit(1);
    }
})
