class Game {
  constructor() {
    this.container   = document.getElementById("game-container");
    this.world       = this.container.querySelector(".world");
    this.foreground  = this.container.querySelector(".foreground");
    this.worldX      = 0;
    this.personaje   = null;
    this.monedas     = [];
    this.puntuacion  = 0;

    this.crearEscenario();
    this.agregarEventos();
    this.puntosElement = document.getElementById("puntos");
  }

  crearEscenario() {
    const tileSize   = 32;
    const floorY     = this.container.clientHeight - tileSize;

    // 1) Definir ancho del mundo: 5× el contenedor
    const tilesCount = Math.ceil(this.container.clientWidth * 5 / tileSize);
    const levelWidth = tilesCount * tileSize;
    this.world.style.width = `${levelWidth}px`;

    // 2) Generar suelo con variantes de sprite
    const variants = [0, 32, 64, 96];
    for (let i = 0; i < tilesCount; i++) {
      const x     = i * tileSize;
      const floor = document.createElement("div");
      floor.classList.add("floor");
      floor.style.left = `${x}px`;
      floor.style.top  = `${floorY}px`;

      // variante aleatoria de sprite
      const variantX = variants[Math.floor(Math.random() * variants.length)];
      floor.style.backgroundPosition = `-${variantX}px 0`;

      this.world.appendChild(floor);
    }

    // 3) Añadir personaje en capa estática (.foreground)
    this.personaje = new Personaje();
    this.personaje.container = this.container;
    this.personaje.world     = this.world;
    this.personaje.game      = this;
    this.foreground.appendChild(this.personaje.element);

    // 4) Añadir monedas a lo largo de todo el nivel
    this.monedas = [];
    const coinCount = Math.ceil(levelWidth / 200); // una moneda cada 200px
    for (let i = 0; i < coinCount; i++) {
      const randomX = Math.random() * (levelWidth - tileSize) + tileSize;
      const randomY = Math.random() * (floorY   - tileSize) + tileSize;
      const moneda  = new Moneda(randomX, randomY);
      this.monedas.push(moneda);
      this.world.appendChild(moneda.element);
    }
  } // ← fin de crearEscenario()

  agregarEventos() {
    window.addEventListener("keydown", e => this.personaje.mover(e));
    this.checkColisiones();
  }

  checkColisiones() {
    setInterval(() => {
      this.monedas = this.monedas.filter(moneda => {
        if (this.personaje.colisionaCon(moneda)) {
          this.world.removeChild(moneda.element);
          this.actualizarPuntuacion(10);
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
    this.x            = 50;
    this.y            = 300;
    this.width        = 50;
    this.height       = 50;
    this.velocidad    = 10;
    this.jumpCount    = 0;
    this.saltoTimer   = null;
    this.gravedadTimer= null;
    this.spacePressed = false;

    // liberar flag al soltar Space
    window.addEventListener("keyup", e => {
      if (e.code === "Space") this.spacePressed = false;
    });

    this.element = document.createElement("div");
    this.element.classList.add("personaje");
    this.actualizarPosicion();
  }

  mover(evento) {
    const game      = this.game;
    const maxOffset = game.world.scrollWidth - game.container.clientWidth;
    const leftLimit = 20;
    const rightLimit= game.container.clientWidth - this.width - 20;
    const centerX   = game.container.clientWidth / 2 - this.width / 2;

    // Movimiento derecha: scroll y personaje al centro
    if (evento.key === "ArrowRight") {
      if (game.worldX < maxOffset) {
        game.worldX = Math.min(game.worldX + this.velocidad, maxOffset);
        game.world.style.transform = `translateX(-${game.worldX}px)`;
        this.x = centerX;
      } else if (this.x < rightLimit) {
        this.x += this.velocidad;
      }

    // Movimiento izquierda: scroll y personaje al centro
    } else if (evento.key === "ArrowLeft") {
      if (game.worldX > 0) {
        game.worldX = Math.max(game.worldX - this.velocidad, 0);
        game.world.style.transform = `translateX(-${game.worldX}px)`;
        this.x = centerX;
      } else if (this.x > leftLimit) {
        this.x -= this.velocidad;
      }

    // Doble salto: inicial o repeat tras primer salto
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
    let alturaMaxima = this.y - (this.jumpCount === 1 ? 100 : this.y);

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
      if (this.y < 300) {
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
    const coinX = objeto.x - this.game.worldX;
    return (
      this.x < coinX + objeto.width &&
      this.x + this.width > coinX &&
      this.y < objeto.y + objeto.height &&
      this.y + this.height > objeto.y
    );
  }
}

class Moneda {
  constructor(x, y) {
    this.x      = x;
    this.y      = y;
    this.width  = 30;
    this.height = 30;
    this.element= document.createElement("div");
    this.element.classList.add("moneda");
    this.actualizarPosicion();
  }

  actualizarPosicion() {
    this.element.style.left = `${this.x}px`;
    this.element.style.top  = `${this.y}px`;
  }
}

const juego = new Game();
