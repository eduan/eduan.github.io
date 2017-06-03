"use strict";
const XY = 50;
const IDEALPOPULATION = 3
const LESSPOPULATION = 2
class Cell{
    constructor(x, y, colony){
        this.x = x;
        this.y = y;
        this.colony = colony;
        this.status = false;
        this.nextStatus = false;
    }
    
    react(){
        if((this.getLiveNeighborhood() < LESSPOPULATION || this.getLiveNeighborhood() > IDEALPOPULATION)  && this.status){
            this.nextStatus = false;    
        }else if(this.getLiveNeighborhood() == IDEALPOPULATION && !this.status){
            this.nextStatus = true;    
        }else{
            this.nextStatus = this.status 
        }
    }

    getLiveNeighborhood(){
        var neighborhood = 0;
        for(var h = this.x - 1; h < this.x + 2; h++){
            for(var k = this.y - 1; k < this.y + 2; k++){
                if(h > -1 && k > -1 && h < XY  && k < XY){
                    if(!(h == this.x && k == this.y) && this.colony.cells[h][k].status){
                        neighborhood++;
                    }
                }
            }
        }   
        return neighborhood;
    }
}

class Colony{
    
    constructor(){
        this.cells = new Array(XY)
        for (var i = 0; i < XY; i++) {
          this.cells[i] = new Array(XY);
        }
    }
    
    add(cell){
        this.cells[cell.x][cell.y] = cell;
    }

    initialize(){
        for (var i = 0; i < XY; i++) {
            for (var j = 0; j < XY; j++) {
                var cell = CellsFactory.getInstance(i, j, this);
                cell.status = (Math.round(Math.random() * 10)) % 2;
                this.add(cell);
            }
        }
        return this;
    }
    runOnCycle(){
        for (var i = 0; i < XY; i++) {
            for (var j = 0; j < XY; j++) {
                this.cells[i][j].react();
            }
        }
        for (var i = 0; i < XY; i++) {
            for (var j = 0; j < XY; j++) {
                this.cells[i][j].status = this.cells[i][j].nextStatus;
                this.cells[i][j].nextStatus = this.cells[i][j].status;
            }
        }
        return this;
    }
}

class CellsFactory{
    static getInstance(x, y, colony){
        return new Cell(x, y, colony)
    }
}

class Render{
    constructor(colony){
        this.colony = colony;
    }
    doRender(){
        throw 'It should be overwritten'; 
    }
}

class RenderTXT extends Render{
    doRender(){
        var matrix = '';
        for (var i = 0; i < XY; i++) {
            for (var j = 0; j < XY; j++) {
                matrix += this.colony.cells[i][j].status ? '*' : ' ';
            }
            matrix += "\n";
        }
        console.log(matrix);
    }
}

class RenderHTML extends Render{
    doRender(){
        var matrix = '';
        for (var i = 0; i < XY; i++) {
            matrix += "<tr>";
            for (var j = 0; j < XY; j++) {
                matrix += "<td " + (this.colony.cells[i][j].status ? 'class="viva"' : '') + "></td>";
            }
            matrix += "</tr>";
        }
        document.getElementById("canvas").innerHTML = matrix
    }
}

class RenderFactory{
    static getInstance(type, colony){
        switch(type){
            case 'txt':
                return new RenderTXT(colony)
            case 'html':
                return new RenderHTML(colony)
        }
    }
}


let c = new Colony();

c.initialize();

//first frame
RenderFactory.getInstance('html', c.runOnCycle()).doRender();

let a = new Animation(function(){RenderFactory.getInstance('html', c.runOnCycle()).doRender()}, 83)
