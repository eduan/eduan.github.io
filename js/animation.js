class Animation{
    constructor(toAnimate, time){
        this.toAnimate = toAnimate;
        this.time = time;
    }
   
    play(){
        this.interval = setInterval(this.toAnimate, this.time) 
    }

    stop(){
        clearInterval(this.interval)
    }    
}
