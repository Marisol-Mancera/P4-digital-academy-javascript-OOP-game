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

    // Bucle que mueve obstáculos hacia el personaje
    const gameLoop = () => {
      const targetX = this.personaje.x + this.worldX;
      this.obstaculos.forEach(obs => {
        if (typeof obs.moveTowards === 'function') {
          obs.moveTowards(targetX);
        }
      });
      requestAnimationFrame(gameLoop);
    };
    requestAnimationFrame(gameLoop);

    this.puntosElement = document.getElementById("puntos");
  }

  crearEscenario() {
    const tileSize   = 32;
    const floorY     = this.container.clientHeight - tileSize;

    // 1) Definir ancho del mundo: 10× el ancho del contenedor
    const tilesCount = Math.ceil(this.container.clientWidth * 10 / tileSize);
    const levelWidth = tilesCount * tileSize;
    this.world.style.width = `${levelWidth}px`;

    // 2) Añadir personaje en .foreground
    this.personaje = new Personaje();
    this.personaje.container = this.container;
    this.personaje.world     = this.world;
    this.personaje.game      = this;
    this.foreground.appendChild(this.personaje.element);

    // 3) Posicionar personaje a 30px del fondo
    const bottomMargin = 30;
    const h            = this.personaje.height;
    const newY         = this.container.clientHeight - h - bottomMargin;
    this.personaje.y       = newY;
    this.personaje.groundY = newY;
    this.personaje.actualizarPosicion();

    // 4) Generar obstáculos de dos tipos
    this.obstaculos    = [];
    const obstacleCount = Math.ceil(levelWidth / 200);
    const saltoSimple   = this.personaje.saltoSimple;
    const minY          = this.personaje.groundY - saltoSimple;
    const maxY          = this.personaje.groundY;

    for (let i = 0; i < obstacleCount; i++) {
      const x = Math.random() * (levelWidth - tileSize) + tileSize;

      if (i % 2 === 0) {
        // Enemigo terrestre: en el suelo
        const y       = this.personaje.groundY;
        const enemigo = new Enemigo(x, y, this.personaje.height);
        this.obstaculos.push(enemigo);
        this.world.appendChild(enemigo.element);

      } else {
        // Enemigo volador: dentro del rango de salto
        const y        = Math.random() * (maxY - minY) + minY;
        const enemigo2 = new Enemigo2(x, y);
        this.obstaculos.push(enemigo2);
        this.world.appendChild(enemigo2.element);
      }
    }
  }

  agregarEventos() {
    // mover() solo gestiona salto; el bucle RAF hace horizontal
    window.addEventListener("keydown", e => this.personaje.mover(e));
    window.addEventListener("keyup",   e => this.personaje.finMover(e));
    this.checkColisiones();
  }

  checkColisiones() {
    setInterval(() => {
      this.obstaculos = this.obstaculos.filter(obs => {
        if (this.personaje.colisionaCon(obs)) {
          this.world.removeChild(obs.element);
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
    this.velocidad     = 14;
    this.jumpCount     = 0;
    this.saltoTimer    = null;
    this.gravedadTimer = null;
    this.spacePressed  = false;
    this.rightPressed  = false;
    this.leftPressed   = false;
    this.saltoSimple   = 100;  // altura primer salto
    this.saltoDoble    = 170;  // altura segundo salto

    // Listeners de teclado
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

    // Bucle de movimiento continuo
    const loop = () => {
      this._moverEnAire();
      this.actualizarPosicion();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  mover(evento) {
    // Solo necesario para salto; horizontal lo hace el bucle
  }

  finMover(evento) {
    // Mantenido en keyup
  }

  saltar() {
    if (this.saltoTimer) clearInterval(this.saltoTimer);
    this.jumpCount++;
    const saltoAltura = (this.jumpCount === 1 ? this.saltoSimple : this.saltoDoble);
    const targetY     = this.groundY - saltoAltura;

    this.saltoTimer = setInterval(() => {
      if (this.y > targetY) {
        this.y -= 10;
      } else {
        clearInterval(this.saltoTimer);
        this.caer();
      }
    }, 20);
  }

  caer() {
    if (this.gravedadTimer) clearInterval(this.gravedadTimer);

    this.gravedadTimer = setInterval(() => {
      // Avanzar vertical sin pasarse de groundY
      this.y = Math.min(this.y + 10, this.groundY);
      if (this.y === this.groundY) {
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
        game.container.style.backgroundPositionX = `-${game.worldX/2}px`;
        this.x = centerX;
      } else if (this.x < rightLimit) {
        this.x += this.velocidad;
      }
    }

    if (this.leftPressed) {
      if (game.worldX > 0) {
        game.worldX = Math.max(game.worldX - this.velocidad, 0);
        game.world.style.transform = `translateX(-${game.worldX}px)`;
        game.container.style.backgroundPositionX = `-${game.worldX/2}px`;
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
    const obsX       = objeto.x - this.game.worldX;
    // Hitbox reducido: 10px inset X, 20px inset Y
    const left   = this.x + 10;
    const right  = this.x + this.width - 10;
    const top    = this.y + 20;
    const bottom = this.y + this.height;
    return (
      left   < obsX + objeto.width &&
      right  > obsX &&
      top    < objeto.y + objeto.height &&
      bottom > objeto.y
    );
  }
}

class Enemigo {
  constructor(x, y, size = 180) {
    this.x       = x;
    this.y       = y;
    this.width   = size;
    this.height  = size;
    this.element = document.createElement("div");
    this.element.classList.add("enemigo");
    this.element.style.width  = `${size}px`;
    this.element.style.height = `${size}px`;
    this.actualizarPosicion();
  }

  moveTowards(targetX, speed = 2) {
    this.x += (this.x < targetX ? speed : -speed);
    this.actualizarPosicion();
  }

  actualizarPosicion() {
    this.element.style.left = `${this.x}px`;
    this.element.style.top  = `${this.y}px`;
  }
}

class Enemigo2 {
  constructor(x, y, size = 120) {
    this.x       = x;
    this.y       = y;
    this.width   = size;
    this.height  = size;
    this.element = document.createElement("div");
    this.element.classList.add("enemigo2");
    this.element.style.width  = `${size}px`;
    this.element.style.height = `${size}px`;
    this.actualizarPosicion();
  }

  moveTowards(targetX, speed = 1.5) {
    this.x += (this.x < targetX ? speed : -speed);
    this.actualizarPosicion();
  }

  actualizarPosicion() {
    this.element.style.left = `${this.x}px`;
    this.element.style.top  = `${this.y}px`;
  }
}

const juego = new Game();