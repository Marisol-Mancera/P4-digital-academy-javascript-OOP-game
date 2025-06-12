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

    // 1) definir ancho del mundo: 5× ancho del contenedor
    const tilesCount = Math.ceil(this.container.clientWidth * 5 / tileSize);
    const levelWidth = tilesCount * tileSize;
    this.world.style.width = `${levelWidth}px`;

    // 2) añadir personaje en .foreground
    this.personaje = new Personaje();
    this.personaje.container = this.container;
    this.personaje.world     = this.world;
    this.personaje.game      = this;
    this.foreground.appendChild(this.personaje.element);

    // 3.1) posicionar a 30px del fondo
    const bottomMargin = 30;
    const h = this.personaje.height;
    const newY = this.container.clientHeight - h - bottomMargin;
    this.personaje.y       = newY;
    this.personaje.groundY = newY;
    this.personaje.actualizarPosicion();

    // 4) añadir obstáculos
    this.obstaculos = [];
    const obstacleCount = Math.ceil(levelWidth / 200);
    const minY = this.personaje.groundY - 210;
    const maxY = this.personaje.groundY;

    for (let i = 0; i < obstacleCount; i++) {
      const x = Math.random() * (levelWidth - tileSize) + tileSize;
      const y = Math.random() * (maxY - minY) + minY;
      const enemigo = new Enemigo(x, y);
      this.obstaculos.push(enemigo);
      this.world.appendChild(enemigo.element);
    }
  }

  agregarEventos() {
    window.addEventListener("keydown", e => this.personaje.mover(e));
    window.addEventListener("keyup",   e => this.personaje.finMover(e));
    this.checkColisiones();
  }

  checkColisiones() {
    setInterval(() => {
      this.obstaculos = this.obstaculos.filter(enemigo => {
        if (this.personaje.colisionaCon(enemigo)) {
          this.world.removeChild(enemigo.element);
          this.actualizarPuntuacion(-10);
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
    this.x             = 50;
    this.y             = 300;
    this.width         = 200;
    this.height        = 200;
    this.groundY       = this.y;
    this.velocidad     = 10;
    this.jumpCount     = 0;
    this.saltoTimer    = null;
    this.gravedadTimer = null;
    this.spacePressed  = false;
    this.rightPressed  = false;
    this.leftPressed   = false;

    // controlar flags
    window.addEventListener("keydown", e => {
      if (e.key === "ArrowRight") this.rightPressed = true;
      if (e.key === "ArrowLeft")  this.leftPressed  = true;
      if (e.code === "Space" &&
          this.jumpCount < 2 &&
          ((!this.spacePressed && !e.repeat) ||
           (e.repeat && this.jumpCount === 1))
      ) {
        e.preventDefault();
        this.spacePressed = true;
        this.saltar();
      }
    });
    window.addEventListener("keyup", e => {
      if (e.key === "ArrowRight") this.rightPressed = false;
      if (e.key === "ArrowLeft")  this.leftPressed  = false;
      if (e.code === "Space")     this.spacePressed = false;
    });

    this.element = document.createElement("div");
    this.element.classList.add("personaje");
    this.actualizarPosicion();

    // bucle de movimiento continuo
    const loop = () => {
      this._moverEnAire();
      this.actualizarPosicion();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  mover(evento) {
    // solo necesario para salto; movimiento horizontal en el bucle
  }

  finMover(evento) {
    // ya gestionado en keyup del constructor
  }

  saltar() {
    if (this.saltoTimer) clearInterval(this.saltoTimer);
    this.jumpCount++;
    const saltoHeight = (this.jumpCount === 1 ? 100 : 170);
    const targetY = this.groundY - saltoHeight;

    this.saltoTimer = setInterval(() => {
      this._moverEnAire();
      if (this.y > targetY) {
        this.y -= 10;
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
      this._moverEnAire();
      if (this.y < this.groundY) {
        this.y += 10;
      } else {
        clearInterval(this.gravedadTimer);
        this.gravedadTimer = null;
        this.jumpCount = 0;
      }
    }, 20);
  }

  _moverEnAire() {
    const game      = this.game;
    const maxOffset = game.world.scrollWidth - game.container.clientWidth;
    const centerX   = game.container.clientWidth/2 - this.width/2;
    const rightLimit= game.container.clientWidth - this.width - 20;

    if (this.rightPressed) {
      if (this.x < centerX && game.worldX === 0) {
        this.x += this.velocidad;
      } else if (game.worldX < maxOffset) {
        game.worldX = Math.min(game.worldX + this.velocidad, maxOffset);
        game.world.style.transform = `translateX(-${game.worldX}px)`;
        this.x = centerX;
      } else if (this.x < rightLimit) {
        this.x += this.velocidad;
      }
    }

    if (this.leftPressed) {
      if (game.worldX > 0) {
        game.worldX = Math.max(game.worldX - this.velocidad, 0);
        game.world.style.transform = `translateX(-${game.worldX}px)`;
      } else if (this.x > 20) {
        this.x -= this.velocidad;
      }
    }
  }

  actualizarPosicion() {
    this.element.style.left = `${this.x}px`;
    this.element.style.top  = `${this.y}px`;
  }

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
    this.element = document.createElement("div");
    this.element.classList.add("enemigo");
    this.actualizarPosicion();
  }

  actualizarPosicion() {
    this.element.style.left = `${this.x}px`;
    this.element.style.top  = `${this.y}px`;
  }
}

const juego = new Game();