const canvas = document.getElementById('canvas')
const context = canvas.getContext('2d')
const color_picker = document.getElementById('color-picker')
context.lineWidth = 3;

const btnClear = document.getElementById('clear-btn')
const btnDraw = document.getElementById('draw-btn')
const rectangleBtn = document.getElementById('rectangle-btn')
const btnEraser = document.getElementById('erase-btn')
const btnPicker = document.getElementById('picker-btn')
const btnElipse = document.getElementById('elipse-btn')

//const modes
const MODES = {
    DRAW: 'draw',
    ERASE:'erase',
    RECTANGULE: 'rectangule',
    ELIPSE: 'elipse',
    PICKER: 'picker'
}

let isDrawing = false
let isShiftPressed = false
let startX,startY
let lastX = 0
let lastY = 0
let mode = MODES.DRAW
let imageData

//canvas events
canvas.addEventListener('pointerdown',startDrawing)
canvas.addEventListener('pointermove',draw)
canvas.addEventListener('pointerup',stopDrawing)
canvas.addEventListener('pointerleave',stopDrawing)
//buttons events
btnClear.addEventListener('click',() => context.clearRect(0,0,300,200))
rectangleBtn.addEventListener('click',() => setMode(MODES.RECTANGULE))
btnDraw.addEventListener('click',() => setMode(MODES.DRAW))
btnEraser.addEventListener('click',() => setMode(MODES.ERASE))
btnPicker.addEventListener('click',() => setMode(MODES.PICKER))
btnElipse.addEventListener('click',() => setMode(MODES.ELIPSE))
//documents listeners
document.addEventListener('keydown',startPerfectFigure)
document.addEventListener('keyup',endPerfectFigure)

color_picker.addEventListener('change',changeColor)

function startDrawing(event) {
    isDrawing = true
    const {offsetX,offsetY} = event;

    [startX,startY] = [offsetX,offsetY];
    [lastX,lastY] = [offsetX,offsetY]; 

    //Recuperacion de una foto del canvas
    imageData = context.getImageData(0,0,canvas.width,canvas.height)
}

function draw(event) {
    if (!isDrawing) return;

    const {offsetX,offsetY} = event; 
    if(mode === MODES.DRAW) {
        //Comenzar un trazado
        context.beginPath()
        //Mover el trazado a las coordenadas actuales (ultimas)
        context.moveTo(lastX,lastY)
        context.lineTo(offsetX,offsetY)
        context.stroke()

        ;[lastX,lastY] = [offsetX,offsetY]
    }
    if(mode === MODES.RECTANGULE) {
        //colocacion de la imagen dal canva cada vez que movemos el cursor
        context.putImageData(imageData,0,0)
        let width = offsetX - startX
        let height = offsetY - startY

        if(isShiftPressed) {
            const sideLength = Math.min(
                Math.abs(width),
                Math.abs(height)
            )

            width = width > 0 ? sideLength:-sideLength
            height = height > 0 ? sideLength:-sideLength
        } 

        context.beginPath()
        context.rect(startX,startY,width,height)
        context.stroke()
    }
    if(mode === MODES.ERASE) {
        context.beginPath()
        context.moveTo(lastX,lastY)
        context.lineTo(offsetX,offsetY)
        context.stroke()
    
        ;[lastX,lastY] = [offsetX,offsetY]
    }
    if(mode === MODES.ELIPSE) {
        context.putImageData(imageData,0,0)
        let width = offsetX - startX
        let height = offsetY - startY
        
        if(isShiftPressed) {
            const sideLength = Math.min(
                Math.abs(width),
                Math.abs(height)
            )

            width = width > 0 ? sideLength:-sideLength
            height = height > 0 ? sideLength:-sideLength
        } 

        context.beginPath()
        context.ellipse(startX,startY,Math.abs(width)/2,Math.abs(height)/2,0,0,2*Math.PI)
        context.stroke()
    }
}

function stopDrawing() {
    isDrawing = false
}

function changeColor() {
    let {value} = color_picker
    //Se le pasa el color (hexadecimal) al contexto de dibujo
   context.strokeStyle = value
}
async function setMode(newMode) {
    mode = newMode
    const ACTIVE_CLASS = 'active'

    let activeButton = document.getElementsByClassName('active')[0]
    activeButton.classList.remove(ACTIVE_CLASS)

    switch(newMode) {
        case MODES.DRAW:
            btnDraw.classList.add(ACTIVE_CLASS)
            canvas.style.cursor = 'default'
            context.globalCompositeOperation = 'source-over'
            context.lineWidth = 3;
            break;
        case MODES.RECTANGULE:
            rectangleBtn.classList.add(ACTIVE_CLASS)
            canvas.style.cursor = 'crosshair'
            context.globalCompositeOperation = 'source-over'
            context.lineWidth = 3;
            break;
        case MODES.ERASE:
            btnEraser.classList.add(ACTIVE_CLASS)
            canvas.style.cursor = 'url("./images/eraser.svg") 0 24, auto';
            context.globalCompositeOperation = 'destination-out'
            context.lineWidth = 15;
            break;
        case MODES.PICKER:
            context.lineWidth = 3;
            btnPicker.classList.add(ACTIVE_CLASS)
            try {
                const eyeDropper = new window.EyeDropper()
                const result = await eyeDropper.open()
                const {sRGBHex} = result
                context.strokeStyle = sRGBHex
                color_picker.value = sRGBHex
                setMode(MODES.DRAW)

            }catch(e) {
                console.error(`No se pudo capturar el color ${e}`)
                alert('Tu navegador no soporta esta funcion')
                setMode(MODES.DRAW)
            }
            break;
        case MODES.ELIPSE:
            context.lineWidth = 3;
            btnElipse.classList.add(ACTIVE_CLASS)
            canvas.style.cursor = 'crosshair'
            break;
    }
}

function startPerfectFigure({key}) {
    isShiftPressed = key === 'Shift'
}

function endPerfectFigure({key}) {
    if(key === 'Shift') isShiftPressed = false
}
