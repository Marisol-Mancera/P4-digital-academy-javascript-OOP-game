class Game {
  constructor() { 
		this.container = document.getElementById("game-container");
        this.world = this.container.querySelector(".world"); // ← NUEVO
        this.worldX = 0; 
        this.personaje = null;
        this.monedas = [];
        this.puntuacion = 0;
        this.crearEscenario();
        this.agregarEventos();
        this.puntosElement = document.getElementById("puntos");
  }
  
  crearEscenario() {
    this.personaje = new Personaje();
    this.personaje.container = this.container;
    this.personaje.world     = this.world;
    this.world.appendChild(this.personaje.element);   // ← usa .world
    for (let i = 0; i < 5; i++) {
    const moneda = new Moneda();
    this.monedas.push(moneda);
    this.world.appendChild(moneda.element);         // ← usa .world
  }
}

  agregarEventos() {
	window.addEventListener("keydown", (e) => this.personaje.mover(e));
    this.checkColisiones();
}
  checkColisiones() {
	  setInterval(() => {
    this.monedas = this.monedas.filter(moneda => {
      if (this.personaje.colisionaCon(moneda)) {
        this.world.removeChild(moneda.element);  // ← eliminar del world
        this.actualizarPuntuacion(10);
        return false;                            // → la filtramos fuera del array
      }
      return true;
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
  const maxOffset = this.world.scrollWidth - this.container.clientWidth; 
  const leftLimit  = 20; // px desde el borde izquierdo
  const rightLimit = this.container.clientWidth - this.width - 20;


  if (evento.key === "ArrowRight") {
    // 1) Si el personaje no alcanzó el límite derecho del contenedor:
    if (this.x < rightLimit) {              
      this.x += this.velocidad;
    } else if (this.worldX < maxOffset) {
      // 2) Si ya está en el límite, movemos el mundo a la izquierda
      this.worldX = Math.min(this.worldX + this.velocidad, maxOffset);
      this.world.style.transform = `translateX(-${this.worldX}px)`;
    }
  } else if (evento.key === "ArrowLeft") {
    // 1) Si el personaje no alcanzó el límite izquierdo:
    if (this.x > leftLimit) {
      this.x -= this.velocidad;
    } else if (this.worldX > 0) {
      // 2) Si está en el límite izquierdo, movemos el mundo a la derecha
      this.worldX = Math.max(this.worldX - this.velocidad, 0);
      this.world.style.transform = `translateX(-${this.worldX}px)`;
    }
  } else if ((evento.code === "Space" || evento.key === " ") && this.jumpCount < 2 && !this.spacePressed) {
    evento.preventDefault();
    this.spacePressed = true;
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
