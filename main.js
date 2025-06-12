class Game {
  constructor() {
    this.container = document.getElementById("game-container");
    this.puntosElement = document.getElementById("puntos");
    this.personaje = null;
    this.enemigos1 = [];
    this.enemigos2 = [];
    this.puntuacion = 100;

    this.crearEscenario();
    this.agregarEventos();
    this.generarEnemigos1Continuamente();
  }

  crearEscenario() {
    this.personaje = new Personaje();
    this.personaje.container = this.container;
    this.container.appendChild(this.personaje.element);

    for (let i = 0; i < 2; i++) {
      const enemigo2 = new Enemigo2();
      this.enemigos2.push(enemigo2);
      this.container.appendChild(enemigo2.element);
    }
  }

  agregarEventos() {
    window.addEventListener("keydown", (e) => this.personaje.mover(e));
    window.addEventListener("keyup", (e) => this.personaje.finMover(e));
    this.checkColisiones();
    this.loop();
  }

  loop() {
    setInterval(() => {
      this.enemigos1.forEach(enemigo => enemigo.perseguir(this.personaje.x));
    }, 50);
  }

  checkColisiones() {
    setInterval(() => {
      this.enemigos1 = this.enemigos1.filter(enemigo => {
        if (this.personaje.colisionaCon(enemigo)) {
          this.container.removeChild(enemigo.element);
          this.actualizarPuntuacion(-10);
          return false;
        }
        return true;
      });

      this.enemigos2 = this.enemigos2.filter(enemigo2 => {
        if (this.personaje.colisionaCon(enemigo2)) {
          this.container.removeChild(enemigo2.element);
          this.actualizarPuntuacion(-10);
          return false;
        }
        return true;
      });
    }, 100);
  }

  generarEnemigos1Continuamente() {
    setInterval(() => {
      const enemigo = new Enemigo();
      this.enemigos1.push(enemigo);
      this.container.appendChild(enemigo.element);
    }, 2000); // cada 2 segundos
  }

  actualizarPuntuacion(puntos) {
    this.puntuacion += puntos;
    this.puntosElement.textContent = `Puntos: ${this.puntuacion}`;
  }
}

// Resto del código permanece igual...

class Personaje {
  constructor() {
    this.x = 50;
    this.y = 0;
    this.width = 64;
    this.height = 100;
    this.velocidad = 10;
    this.rightPressed = false;
    this.leftPressed = false;
    this.jumpCount = 0;
    this.saltoTimer = null;
    this.gravedadTimer = null;
    this.spacePressed = false;
    this.saltoSimple = 100;
    this.saltoDoble = 170;

    this.element = document.createElement("div");
    this.element.classList.add("personaje");
    this.element.style.width = `${this.width}px`;
    this.element.style.height = `${this.height}px`;

    this.groundY = 600 - this.height;
    this.y = this.groundY;
    this.actualizarPosicion();

    this.loop();
  }

  loop() {
    setInterval(() => {
      if (this.rightPressed) {
        this.x = Math.min(this.x + this.velocidad, 1200 - this.width);
      }
      if (this.leftPressed) {
        this.x = Math.max(this.x - this.velocidad, 0);
      }
      this.actualizarPosicion();
    }, 20);
  }

  mover(e) {
    if (e.key === "ArrowRight") this.rightPressed = true;
    if (e.key === "ArrowLeft") this.leftPressed = true;
    if (e.code === "Space" && this.jumpCount < 2 && !this.spacePressed) {
      this.spacePressed = true;
      this.saltar();
    }
  }

  finMover(e) {
    if (e.key === "ArrowRight") this.rightPressed = false;
    if (e.key === "ArrowLeft") this.leftPressed = false;
    if (e.code === "Space") this.spacePressed = false;
  }

  saltar() {
    if (this.saltoTimer) clearInterval(this.saltoTimer);
    if (this.gravedadTimer) clearInterval(this.gravedadTimer);

    this.jumpCount++;
    const saltoAltura = this.jumpCount === 1 ? this.saltoSimple : this.saltoDoble;
    const targetY = this.y - saltoAltura;

    this.saltoTimer = setInterval(() => {
      if (this.y > targetY) {
        this.y -= 10;
        this.actualizarPosicion();
      } else {
        clearInterval(this.saltoTimer);
        this.caer();
      }
    }, 20);
  }

  caer() {
    if (this.gravedadTimer) clearInterval(this.gravedadTimer);

    this.gravedadTimer = setInterval(() => {
      this.y += 10;
      if (this.y >= this.groundY) {
        this.y = this.groundY;
        this.jumpCount = 0;
        clearInterval(this.gravedadTimer);
        this.gravedadTimer = null;
      }
      this.actualizarPosicion();
    }, 20);
  }

  actualizarPosicion() {
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

class Enemigo {
  constructor() {
    this.width = 30;
    this.height = 30;
    this.x = Math.random() * (1200 - this.width - 100) + 100;
    this.y = 600 - this.height;
    this.element = document.createElement("div");
    this.element.classList.add("enemigo");
    this.element.style.width = `${this.width}px`;
    this.element.style.height = `${this.height}px`;
    this.actualizarPosicion();
  }

  perseguir(targetX, velocidad = 2) {
    if (this.x < targetX) this.x += velocidad;
    else if (this.x > targetX) this.x -= velocidad;
    this.actualizarPosicion();
  }

  actualizarPosicion() {
    this.element.style.left = `${this.x}px`;
    this.element.style.top = `${this.y}px`;
  }
}

class Enemigo2 {
  constructor() {
    this.width = 24;
    this.height = 24;
    this.x = Math.random() * (1200 - this.width - 100) + 100;
    const minY = 200;
    const maxY = 600 - 150;
    this.y = Math.random() * (maxY - minY) + minY;

    this.element = document.createElement("div");
    this.element.classList.add("enemigo2");
    this.element.style.width = `${this.width}px`;
    this.element.style.height = `${this.height}px`;
    this.actualizarPosicion();
  }

  actualizarPosicion() {
    this.element.style.left = `${this.x}px`;
    this.element.style.top = `${this.y}px`;
  }
}

const juego = new Game();
