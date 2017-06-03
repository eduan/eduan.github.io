"use strict";

const POINT = 'point';
const LINE = 'line';
const PROBABILITY = 0.5;
const COLORS = ['red', 'green', 'blue', 'olive', 'gray', 'yellow', 'orange', 'navy', 'purple', 'royalblue'];
class Draw{
    constructor(){
        this.offsetx = 0;
        this.offsety = 0;   
        this.color = 'black';  
    }
    draw(){
        throw 'It should be overwritten'; 
    }
    setColor(color){
        this.color = color;
        return this;
    }
    setOffset(x, y){
        this.offsetx = x;
        this.offsety = y;
        return this;
    }
}

class Context{
    static getContext(){
       return document.getElementById("escopo").getContext("2d");
    }
    static clean(){
        this.getContext().clearRect(0, 0, 1200, 650);
    }
}

class DrawFactory{
    static getInstance(drawType){
        switch(drawType){
            case POINT:
                return new Point();
            case LINE:
                return new Line();
            default:
                throw 'The type is undefined';
        }
    }
}

class Point extends Draw{
    setPosition(x, y){
        this.setted = true;
        this.x = x;
        this.y = y
        return this;
    }
    diff(point){
        if(!this.setted)
            throw "Point didn't receive the position";
        return Math.abs(point.x - this.x) + Math.abs(point.y - this.y);
    }
    draw(){
        var escopo = Context.getContext();
        escopo.beginPath();
        escopo.fillRect(this.x + this.offsetx, this.y + this.offsety,1,1)
        escopo.stroke();
    }
}

class Line extends Draw{
    setPoints(points){
        this.setted = true;
        this.points = points
        this.cost = 10000;
        return this;
    }
    calcCost(idealLine){
        if(!this.setted)
            throw "The line is not defined";
        if(idealLine.points.length != this.points.length)
            throw "The lines must match the length";
        var total = 0;
        for (var i = 0; i < this.points.length; i++) {
            total += this.points[i].diff(idealLine.points[i]);
        };
        this.cost = total;
    }
    bornRandom(size){
        var points = []
        while(size--){
            points.push(DrawFactory.getInstance(POINT).setPosition(Math.round(300 * Math.random()), Math.round(300 * Math.random()))); 
        }
        return this.setPoints(points);
    }
    cross(otherLine){
        if(otherLine.points.length != this.points.length)
            throw "The lines must match the length";
        var halfPart = (otherLine.points.length/2);
        return [
            DrawFactory.getInstance(LINE).setPoints(otherLine.points.slice(0, halfPart).concat(this.points.slice(halfPart, otherLine.points.length))),
            DrawFactory.getInstance(LINE).setPoints(this.points.slice(0, halfPart).concat(otherLine.points.slice(halfPart, otherLine.points.length)))
        ];
    }
    mutate(){
        if(Math.random() > PROBABILITY)
            return;
        var randomPoint = Math.floor(Math.random() * this.points.length);
        var variationx = Math.random() <= PROBABILITY ? 0 : (Math.random() <= PROBABILITY ? -1 : 1);
        var variationy = Math.random() <= PROBABILITY ? 0 : (Math.random() <= PROBABILITY ? -1 : 1);
        this.points[randomPoint] = DrawFactory.getInstance(POINT).setPosition(this.points[randomPoint].x + variationx, this.points[randomPoint].y + variationy);
    }
    draw(){
        var escopo = Context.getContext();
        escopo.beginPath();
        escopo.moveTo(this.points[0].x + this.offsetx, this.points[0].y + this.offsety);
        escopo.strokeStyle = this.color;
        for (var i = 1; i < this.points.length; i++) {
            escopo.lineTo(this.points[i].x  + this.offsetx, this.points[i].y + this.offsety)
        }
        escopo.stroke();
    }
}


class Population{
    constructor(objective, size){
        this.members = [];
        this.objective = objective;
        this.generation = 0;
        while(size--){
            this.members.push(DrawFactory.getInstance(LINE).bornRandom(this.objective.points.length))
        }
    }

    sortByCost(){
        this.members.sort(function(a, b) {
            return a.cost - b.cost;
        });
    }

    nextGeneration(){
        Context.clean();
        this.objective.setOffset(300, 100).draw();
        for(var i in this.members){
            this.members[i].calcCost(this.objective);
            this.members[i].setOffset(100, i*50).setColor(COLORS[i]).draw();
        }
        this.sortByCost();
        var children = this.members[0].cross(this.members[1]);
        this.members.splice(this.members.length - 2, 2, children[0], children[1])
        for(var i in this.members){
            this.members[i].mutate()
            this.members[i].calcCost(this.objective);
            if(this.members[i].cost == 0){
                Context.getContext().font = "20px Arial";
                Context.getContext().fillStyle = COLORS[i];
                Context.getContext().fillText("Ideal line found, line color: " +  COLORS[i] , 300, 400);
                Context.getContext().fillText("Genetarion: " + this.generation, 300, 440);
                this.sortByCost();
                return true;
            }
        }
        this.generation++;
        var that = this;
        setTimeout(function(){ that.nextGeneration(); }, 1);
    }
}

let idealLine = DrawFactory.getInstance(LINE).setPoints([
    DrawFactory.getInstance(POINT).setPosition(0,0), 
    DrawFactory.getInstance(POINT).setPosition(50, 0), 
    DrawFactory.getInstance(POINT).setPosition(50, 50), 
    DrawFactory.getInstance(POINT).setPosition(0, 50),
    DrawFactory.getInstance(POINT).setPosition(0, 0),
    ]);

let randomLine = DrawFactory.getInstance(LINE).bornRandom(idealLine.points.length);

let p = new Population(idealLine, 10);
