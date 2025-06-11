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
  const tileSize   = 32;
  const floorY     = this.container.clientHeight - tileSize;
  const tilesCount = 50;
  const levelWidth = tilesCount * tileSize;
  this.world.style.width = `${levelWidth}px`;

  // 1) Generar suelo
  for (let x = 0; x < levelWidth; x += tileSize) {
    const floor = document.createElement('div');
    floor.classList.add('floor');
    floor.style.left = `${x}px`;
    floor.style.top  = `${floorY}px`;
    this.world.appendChild(floor);
  }

  // 2) Añadir personaje
  this.personaje = new Personaje();
  this.personaje.container = this.container;
  this.personaje.world = this.world;
  this.personaje.game  = this;
  this.world.appendChild(this.personaje.element);

  // 3) Añadir monedas
  this.monedas = [];
  for (let i = 0; i < 5; i++) {
    const moneda = new Moneda();
    this.monedas.push(moneda);
    this.world.appendChild(moneda.element);
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
  const game      = this.game;                                            // ← Alias a Game
  const maxOffset = game.world.scrollWidth - game.container.clientWidth;  // ← world y container de Game
  const leftLimit  = 20;
  const rightLimit = game.container.clientWidth - this.width - 20;       // ← Usamos this.width

  if (evento.key === "ArrowRight") {
    if (this.x < rightLimit) {
      this.x += this.velocidad;
    } else if (game.worldX < maxOffset) {                                 // ← Referencia correcta
      game.worldX = Math.min(
        game.worldX + this.velocidad,                                     // ← Usamos this.velocidad
        maxOffset
      );
      game.world.style.transform = `translateX(-${game.worldX}px)`;      // ← world de Game
    }
  } else if (evento.key === "ArrowLeft") {
    if (this.x > leftLimit) {
      this.x -= this.velocidad;
    } else if (game.worldX > 0) {
      game.worldX = Math.max(game.worldX - this.velocidad, 0);
      game.world.style.transform = `translateX(-${game.worldX}px)`;
    }
  } else if (
  evento.code === "Space" &&                                      // ← 1) Solo event.code
  this.jumpCount < 2 &&                                           // ← 2) Hasta dos saltos
  (                                                               // ← 3) Condición compuesta:
    (!this.spacePressed && !evento.repeat) ||                     //     • Primer salto: keydown inicial
    (evento.repeat && this.jumpCount === 1)                       //     • Segundo salto: key repeat tras primer salto
  )
) {
  evento.preventDefault();                                        // ← 4) Evitamos scroll o efectos por defecto
  this.spacePressed = true;                                       // ← 5) Marcamos la barra como pulsada
  this.saltar();                                                  // ← 6) Ejecutamos el salto (incrementa jumpCount)
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
