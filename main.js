class Game {
  constructor() {
    this.container   = document.getElementById("game-container");
    this.world       = this.container.querySelector(".world");
    this.foreground  = this.container.querySelector(".foreground");
    this.worldX      = 0;
    this.personaje   = null;
    this.obstaculos  = [];
    this.puntuacion  = 0;

    this.crearEscenario();
    this.agregarEventos();
    this.puntosElement = document.getElementById("puntos");
  }

  crearEscenario() {
    const tileSize   = 32;
    const floorY     = this.container.clientHeight - tileSize;

    // 1) Definir ancho del mundo: 5× el ancho del contenedor
    const tilesCount = Math.ceil(this.container.clientWidth * 5 / tileSize);
    const levelWidth = tilesCount * tileSize;
    this.world.style.width = `${levelWidth}px`;

    // (Se elimina la generación de .floor; ahora el background es CSS)

    // 2) Añadir personaje en la capa estática (.foreground)
    this.personaje = new Personaje();
    this.personaje.container = this.container;
    this.personaje.world     = this.world;
    this.personaje.game      = this;
    this.foreground.appendChild(this.personaje.element);

  /// 3.1) Ajustar vertical para que quede a 100px del fondo
   const bottomMarginPersonaje = 100;
   const personajeHeight = this.personaje.height;  
   const newY = this.container.clientHeight - personajeHeight - bottomMarginPersonaje;
   this.personaje.y       = newY;
   this.personaje.groundY = newY;
   this.personaje.actualizarPosicion();


    // 3) Añadir obstáculos a lo largo de todo el nivel
  this.obstaculos = [];
  const obstacleCount = Math.ceil(levelWidth / 200); // uno cada 200px
  const topMargin = 20;
  const bottomMarginObs = 30;
  const maxY = floorY - this.personaje.height - bottomMarginObs;

    for (let i = 0; i < obstacleCount; i++) {
      const randomX = Math.random() * (levelWidth - tileSize) + tileSize;
      const randomY = Math.random() * (maxY - topMargin) + topMargin;
      const enemigo = new Enemigo(randomX, randomY);
      this.obstaculos.push(enemigo);
      this.world.appendChild(enemigo.element);
    }
  } // fin de crearEscenario()

  agregarEventos() {
    window.addEventListener("keydown", e => this.personaje.mover(e));
    this.checkColisiones();
  }

  checkColisiones() {
    setInterval(() => {
      this.obstaculos = this.obstaculos.filter(enemigo => {
        if (this.personaje.colisionaCon(enemigo)) {
          this.world.removeChild(enemigo.element);
          this.actualizarPuntuacion(-10);  // resta puntos
          return false;
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
    this.width = 200;
    this.height = 200 ;
    this.groundY = this.y;
    this.velocidad = 10;
    this.jumpCount = 0;
    this.saltoTimer = null;
    this.gravedadTimer = null;
    this.spacePressed = false;
    // Liberar flag al soltar Space
    window.addEventListener("keyup", e => {
      if (e.code === "Space") this.spacePressed = false;
    });

    this.element = document.createElement("div");
    this.element.classList.add("personaje");
    this.actualizarPosicion();
  }

  mover(evento) {
    console.log("mover() fired:", evento.key, "this.game =", this.game);
    const game      = this.game;
    const maxOffset = game.world.scrollWidth - game.container.clientWidth;
    const leftLimit = 20;
    const rightLimit= game.container.clientWidth - this.width - 20;

    // Movimiento DERECHA: primero mover personaje, luego scroll + centrado
    if (evento.key === "ArrowRight") {
      const centerX = game.container.clientWidth / 2 - this.width / 2;

      // 1) Mover hasta centro si no se ha desplazado mundo aún
      if (this.x < centerX && game.worldX === 0) {
        this.x += this.velocidad;

      // 2) Si queda mundo por desplazar, desplazar y fijar personaje en centro
      } else if (game.worldX < maxOffset) {
        game.worldX = Math.min(game.worldX + this.velocidad, maxOffset);
        game.world.style.transform = `translateX(-${game.worldX}px)`;
        this.x = centerX;

      // 3) Cuando no queda scroll, mover personaje al borde derecho
      } else if (this.x < rightLimit) {
        this.x += this.velocidad;
      }

    // Movimiento IZQUIERDA: solo scroll o mover al borde
    } else if (evento.key === "ArrowLeft") {
      if (game.worldX > 0) {
        game.worldX = Math.max(game.worldX - this.velocidad, 0);
        game.world.style.transform = `translateX(-${game.worldX}px)`;
      } else if (this.x > leftLimit) {
        this.x -= this.velocidad;
      }

    // Doble salto: keydown inicial o repeat tras primer salto
    } else if (
      evento.code === "Space" &&
      this.jumpCount < 2 &&
      ((!this.spacePressed && !evento.repeat) ||
       (evento.repeat && this.jumpCount === 1))
    ) {
      evento.preventDefault();
      this.spacePressed = true;
      this.saltar();
    }

    this.actualizarPosicion();
  }

  saltar() {
    if (this.saltoTimer) clearInterval(this.saltoTimer);
  this.jumpCount++;

  // 2) Altura máxima relativa a groundY, no a y actual
  const saltoSimple = 100;
  const saltoDoble  = 170;
  const alturaMaxima = this.groundY - (this.jumpCount === 1 ? saltoSimple : saltoDoble);

    this.saltoTimer = setInterval(() => {
      if (this.y > alturaMaxima) {
        this.y -= 10;
        this.actualizarPosicion();
      } else {
        clearInterval(this.saltoTimer);
        this.saltoTimer = null;
        this.caer();
      }
    }, 20);
  }

  caer() {
    if (this.gravedadTimer) clearInterval(this.gravedadTimer);

    this.gravedadTimer = setInterval(() => {
      if (this.y < this.groundY) {
        this.y += 10;
        this.actualizarPosicion();
      } else {
        clearInterval(this.gravedadTimer);
        this.gravedadTimer = null;
        this.jumpCount = 0;
      }
    }, 20);
  }

  actualizarPosicion() {
    this.element.style.left = `${this.x}px`;
    this.element.style.top  = `${this.y}px`;
  }

  // detección de colisión compensando scroll
  colisionaCon(objeto) {
    const obsX = objeto.x - this.game.worldX;
    return (
      this.x < obsX + objeto.width &&
      this.x + this.width > obsX &&
      this.y < objeto.y + objeto.height &&
      this.y + this.height > objeto.y
    );
  }
}

class Enemigo {
  constructor(x, y) {
    this.x      = x;
    this.y      = y;
    this.width  = 30;
    this.height = 30;
    this.element= document.createElement("div");
    this.element.classList.add("enemigo");
    this.actualizarPosicion();
  }

  actualizarPosicion() {
    this.element.style.left = `${this.x}px`;
    this.element.style.top  = `${this.y}px`;
  }
}

const juego = new Game();