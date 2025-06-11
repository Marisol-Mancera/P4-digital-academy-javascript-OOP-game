class Game {
  constructor() { 
		this.container = document.getElementById("game-container");
        this.personaje = null;
        this.monedas = [];
        this.puntuacion = 0;
        this.crearEscenario();
        this.agregarEventos();
        this.puntosElement = document.getElementById("puntos");
  }
  
  crearEscenario() {
    this.personaje = new Personaje();
	this.container.appendChild(this.personaje.element);
	for (let i = 0; i < 5; i++) {
	const moneda = new Moneda();
	this.monedas.push(moneda);
	this.container.appendChild(moneda.element);
	}
}
  agregarEventos() {
	window.addEventListener("keydown", (e) => this.personaje.mover(e));
    this.checkColisiones();
}
  checkColisiones() {
	setInterval(() => {
        this.monedas.forEach((moneda, index) => {
            if (this.personaje.colisionaCon(moneda)) {
            this.container.removeChild(moneda.element);
            this.monedas.splice(index, 1);
            this.actualizarPuntuacion(10);
      }
    });
    
  }, 100);
} 

actualizarPuntuacion(puntos) {
    this.puntuacion += puntos;
    this.puntosElement.textContent = `Puntos: ${this.puntuacion}`;
}
}

class Personaje {
    constructor() {
        this.x = 50;
        this.y = 300;
        this.width = 50;
        this.height = 50;
        this.velocidad = 10; 
        this.saltando = false;
        this.jumpCount = 0;
        this.saltoTimer = null;
        this.gravedadTimer = null;
         // 🚩 Flag para saber si la barra sigue pulsada
    this.spacePressed = false;

    // 🔔 Cuando se suelte Space, liberamos el flag
    window.addEventListener('keyup', (e) => {
      if (e.code === 'Space') {
        this.spacePressed = false;
      }
    });
        this.element = document.createElement("div");
        this.element.classList.add("personaje");
        this.actualizarPosicion();
    }

    mover(evento) {
    if (evento.key === "ArrowRight") {
        this.x += this.velocidad;
    } else if (evento.key === "ArrowLeft") {
        this.x -= this.velocidad;
    } 
    else if (evento.code === "Space" 
             && this.jumpCount < 2 
             && !this.spacePressed) 
    {
        evento.preventDefault();
        this.spacePressed = true;  // 🚧 bloquea nuevos keydown hasta keyup
        this.saltar();
    }

    this.actualizarPosicion();
}



    saltar() {
        if (this._saltoTimer){
            clearInterval(this._saltoTimer);
            this._saltoTimer = null;
        }
        this.jumpCount++;
        this.saltando =true;
        let delta = this.jumpCount === 1 ? 100 : this.y;
        let alturaMaxima = this.y - delta;
        this._saltoTimer = setInterval(() => {
            if (this.y > alturaMaxima) {
                this.y -= 10;
                this.actualizarPosicion();
            } else {
                clearInterval(this._saltoTimer);
                this._saltoTimer = null;
                this.caer();
            }
        }, 20);
    }

    caer() {
        if (this._gravedadTimer) {
        clearInterval(this._gravedadTimer);
        this._gravedadTimer = null;
        }

        this._gravedadTimer = setInterval(() => {
            if (this.y < 300) {
                this.y += 10;
                this.actualizarPosicion();
            } else {
                clearInterval(this._gravedadTimer);
                this._gravedadTimer = null;
                this.saltando = false;
                this.jumpCount = 0;
    }
        }, 20);
}


    actualizarPosicion(){
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
    }
    colisionaCon(objeto) {
    return (
      this.x < objeto.x + objeto.width &&
      this.x + this.width > objeto.x &&
      this.y < objeto.y + objeto.height &&
      this.y + this.height > objeto.y
    );
    }
}

class Moneda {
    constructor() {
        this.x = Math.random() * 700 + 50;
        this.y =Math.random() * 250 + 50;   
        this.width = 30;
        this.height = 30;
        this.element = document.createElement("div");
        this.element.classList.add("moneda");
        this.actualizarPosicion();     
    }
    actualizarPosicion() {
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
    }
    }
const juego = new Game();

//esto es una prueba