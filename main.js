// main.js

class Game {
  constructor() {
    this.container = document.getElementById("game-container");
    this.puntosElement = document.getElementById("puntos");
    this.personaje = null;
    this.enemigos1 = [];
    this.enemigos2 = [];
    this.puntuacion = 10; // Puntuación inicial, ajústala si quieres más
    this.gameIntervals = []; // Array para guardar los IDs de los setInterval
    this.gameOver = false; // Flag para el estado del juego

    this.crearEscenario();
    this.agregarEventos();
    this.generarEnemigos1Continuamente();
    this.generarEnemigos2Continuamente();
  }

  crearEscenario() {
    this.personaje = new Personaje();
    this.personaje.container = this.container;
    this.container.appendChild(this.personaje.element);

    // Mantenemos la creación inicial de dos enemigos2, aunque luego se generen más continuamente
    for (let i = 0; i < 2; i++) {
      const enemigo2 = new Enemigo2();
      this.enemigos2.push(enemigo2);
      this.container.appendChild(enemigo2.element);
    }
  }

  agregarEventos() {
    // Solo permitimos mover si el juego NO ha terminado
    window.addEventListener("keydown", (e) => {
      if (!this.gameOver) this.personaje.mover(e);
    });
    window.addEventListener("keyup", (e) => {
      if (!this.gameOver) this.personaje.finMover(e);
    });
    this.checkColisiones();
    this.loop();
  }

  loop() {
    const loopId = setInterval(() => {
      if (!this.gameOver) { // Condición para detener el loop
        this.enemigos1.forEach((enemigo) => enemigo.perseguir(this.personaje.x));
      }
    }, 50);
    this.gameIntervals.push(loopId); // Guardamos el ID
  }

  checkColisiones() {
    const checkColisionesId = setInterval(() => {
      if (this.gameOver) return; // Condición para detener las colisiones

      this.enemigos1 = this.enemigos1.filter((enemigo) => {
        if (this.personaje.colisionaCon(enemigo)) {
          this.container.removeChild(enemigo.element);
          this.actualizarPuntuacion(-6); // Enemigo (jabalí) resta 6 puntos
          return false;
        }
        return true;
      });

      this.enemigos2 = this.enemigos2.filter((enemigo2) => {
        if (this.personaje.colisionaCon(enemigo2)) {
          this.container.removeChild(enemigo2.element);
          this.actualizarPuntuacion(3); // Enemigo2 (volador) suma 3 puntos
          return false;
        }
        return true;
      });
    }, 100);
    this.gameIntervals.push(checkColisionesId); // Guardamos el ID
  }

  generarEnemigos1Continuamente() {
    const genEnemigo1Id = setInterval(() => {
      if (!this.gameOver) { // Condición para detener la generación
        const enemigo = new Enemigo();
        this.enemigos1.push(enemigo);
        this.container.appendChild(enemigo.element);
      }
    }, 2000); // cada 2 segundos
    this.gameIntervals.push(genEnemigo1Id); // Guardamos el ID
  }

  generarEnemigos2Continuamente() {
    const genEnemigo2Id = setInterval(() => {
      if (!this.gameOver) { // Condición para detener la generación
        const enemigo2 = new Enemigo2();
        this.enemigos2.push(enemigo2);
        this.container.appendChild(enemigo2.element);
      }
    }, 1500); // Genera un Enemigo2 cada 1.5 segundos
    this.gameIntervals.push(genEnemigo2Id); // Guardamos el ID
  }

  actualizarPuntuacion(puntos) {
    if (this.gameOver) return; // Si ya es Game Over, no hagas nada más

    this.puntuacion += puntos;
    this.puntuacion = Math.max(0, this.puntuacion); // Asegura que no baje de 0
    this.puntosElement.textContent = `Puntos: ${this.puntuacion}`;

    console.log("Puntos actuales:", this.puntuacion);

    if (this.puntuacion <= 0) {
      this.finDelJuego();
    }
  }

  finDelJuego() {
    console.log("¡Se ha llamado a finDelJuego! GAME OVER.");
    this.gameOver = true; // Establece el flag de juego terminado

    // Detener todos los bucles de juego (persecución, generación, colisiones)
    this.gameIntervals.forEach(intervalId => clearInterval(intervalId)); // Limpiamos los intervalos
    this.gameIntervals = []; // Vaciamos el array de IDs

    // Ocultar al personaje y detener su movimiento
    if (this.personaje && this.personaje.element) { // Asegurarse de que el personaje existe
        this.personaje.element.style.display = "none";
        this.personaje.stopMoving(); // Nueva función para el personaje
    }

    // Eliminar todos los enemigos visibles
    // Usamos [...array] para crear una copia y evitar problemas al modificar el array mientras se itera
    [...this.enemigos1].forEach(enemigo => {
        if (enemigo.element && this.container.contains(enemigo.element)) {
             this.container.removeChild(enemigo.element);
        }
    });
    this.enemigos1 = [];

    [...this.enemigos2].forEach(enemigo => {
        if (enemigo.element && this.container.contains(enemigo.element)) {
            this.container.removeChild(enemigo.element);
        }
    });
    this.enemigos2 = [];

    // Mostrar mensaje de Game Over
    const gameOverMessage = document.createElement("div");
    gameOverMessage.textContent = "GAME OVER";
    gameOverMessage.id = "gameOverMessage";
    gameOverMessage.style.position = "absolute";
    gameOverMessage.style.fontSize = "60px";
    gameOverMessage.style.fontWeight = "bold";
    gameOverMessage.style.color = "#FFD700"; // Color oro
    gameOverMessage.style.backgroundColor = "rgba(0, 0, 0, 0.7)"; // Fondo oscuro semitransparente
    gameOverMessage.style.fontFamily = "'Cinzel', serif"; // Fuente Cinzel
    gameOverMessage.style.padding = "20px 40px";
    gameOverMessage.style.borderRadius = "10px";
    gameOverMessage.style.textAlign = "center";
    gameOverMessage.style.width = "auto";
    gameOverMessage.style.whiteSpace = "nowrap";
    gameOverMessage.style.top = "40%"; // Ajustado un poco más arriba para dejar espacio para el botón
    gameOverMessage.style.left = "50%";
    gameOverMessage.style.transform = "translate(-50%, -50%)";
    gameOverMessage.style.zIndex = "100"; // Asegura que esté por encima de todo

    this.container.appendChild(gameOverMessage);
    console.log("Mensaje de Game Over añadido al DOM.");

    // --- AÑADIR EL BOTÓN DE REINICIO ---
    const restartButton = document.createElement("button");
    restartButton.textContent = "Reiniciar Juego";
    restartButton.id = "restartButton";
    restartButton.style.position = "absolute";
    restartButton.style.top = "60%"; // Posicionado debajo del mensaje de Game Over
    restartButton.style.left = "50%";
    restartButton.style.transform = "translate(-50%, -50%)";
    restartButton.style.zIndex = "101"; // Z-index superior al mensaje
    restartButton.style.padding = "15px 30px";
    restartButton.style.fontSize = "24px";
    restartButton.style.fontWeight = "bold";
    restartButton.style.backgroundColor = "#00ffff"; // Un verde atractivo
    restartButton.style.color = "white";
    restartButton.style.border = "2px solid #ffff";
    restartButton.style.borderRadius = "8px";
    restartButton.style.cursor = "pointer";
    restartButton.style.fontFamily = "'Cinzel', serif"; // También con la fuente del juego
    restartButton.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.3)"; // Sombra para que resalte

    // Evento de clic para reiniciar el juego
    restartButton.addEventListener("click", () => {
        console.log("Botón Reiniciar clicado. Recargando la página.");
        location.reload(); // Recarga la página para reiniciar
    });

    this.container.appendChild(restartButton);
    console.log("Botón de Reinicio añadido al DOM.");
  }
} // <<< --- CIERRE DE LA CLASE GAME ---


// --- CLASE PERSONAJE ---
class Personaje {
  constructor() {
    this.x = 50;
    this.y = 0;
    // Ajusta estos valores si quieres que el personaje sea más grande o más pequeño
    this.width = 64;
    this.height = 100;
    this.velocidad = 10;
    this.rightPressed = false;
    this.leftPressed = false;
    this.jumpCount = 0;
    this.saltoTimer = null;
    this.gravedadTimer = null;
    this.spacePressed = false;
    this.saltoSimple = 100; // Altura del primer salto
    this.saltoDoble = 170; // Altura del segundo salto
    this.movementInterval = null; // Para guardar el ID del intervalo de movimiento

    this.element = document.createElement("div");
    this.element.classList.add("personaje");
    this.element.style.width = `${this.width}px`;
    this.element.style.height = `${this.height}px`;

    // Calcula la posición Y del suelo basándose en la altura del contenedor del juego (600px)
    // y un pequeño ajuste para que la imagen se vea "en el suelo" (ajusta '30' si es necesario)
    this.groundY = 600 - this.height + 30;
    this.y = this.groundY;
    this.actualizarPosicion();

    this.loop();
  }

  loop() {
    // Guardamos el ID del intervalo de movimiento del personaje
    this.movementInterval = setInterval(() => {
      if (this.rightPressed) {
        this.x = Math.min(this.x + this.velocidad, 1200 - this.width);
      }
      if (this.leftPressed) {
        this.x = Math.max(this.x - this.velocidad, 0);
      }
      this.actualizarPosicion();
    }, 20);
  }

  // Nuevo método para detener el movimiento del personaje y los timers de salto/gravedad
  stopMoving() {
    if (this.movementInterval) {
      clearInterval(this.movementInterval);
      this.movementInterval = null;
    }
    if (this.saltoTimer) clearInterval(this.saltoTimer);
    if (this.gravedadTimer) clearInterval(this.gravedadTimer);
    this.rightPressed = false;
    this.leftPressed = false;
    this.spacePressed = false;
  }

  mover(e) {
    if (e.key === "ArrowRight") this.rightPressed = true;
    if (e.key === "ArrowLeft") this.leftPressed = true;
    if (e.code === "Space" && this.jumpCount < 2 && !this.spacePressed) {
      this.spacePressed = true; // Previene saltos múltiples si la tecla se mantiene pulsada
      this.saltar();
    }
  }

  finMover(e) {
    if (e.key === "ArrowRight") this.rightPressed = false;
    if (e.key === "ArrowLeft") this.leftPressed = false;
    if (e.code === "Space") this.spacePressed = false; // Permite un nuevo salto cuando se suelta la tecla
  }

  saltar() {
    if (this.saltoTimer) clearInterval(this.saltoTimer); // Detener el timer de salto anterior si existe
    if (this.gravedadTimer) clearInterval(this.gravedadTimer); // Detener la gravedad si está cayendo

    this.jumpCount++;
    const saltoAltura = this.jumpCount === 1 ? this.saltoSimple : this.saltoDoble;
    const targetY = this.y - saltoAltura;

    this.saltoTimer = setInterval(() => {
      if (this.y > targetY) {
        this.y -= 10; // Mueve hacia arriba
        this.actualizarPosicion();
      } else {
        clearInterval(this.saltoTimer); // Detiene el ascenso
        this.caer(); // Inicia la caída
      }
    }, 20);
  }

  caer() {
    if (this.gravedadTimer) clearInterval(this.gravedadTimer); // Detener el timer de gravedad anterior si existe

    this.gravedadTimer = setInterval(() => {
      this.y += 10; // Mueve hacia abajo
      if (this.y >= this.groundY) {
        this.y = this.groundY; // Asegura que no pase del suelo
        this.jumpCount = 0; // Reinicia el contador de saltos
        clearInterval(this.gravedadTimer); // Detiene la caída
        this.gravedadTimer = null; // Limpia la referencia
      }
      this.actualizarPosicion();
    }, 20);
  }

  actualizarPosicion() {
    this.element.style.left = `${this.x}px`;
    this.element.style.top = `${this.y}px`;
  }

  // Método para verificar colisiones con otros objetos
  colisionaCon(objeto) {
    return (
      this.x < objeto.x + objeto.width &&
      this.x + this.width > objeto.x &&
      this.y < objeto.y + objeto.height &&
      this.y + this.height > objeto.y
    );
  }
}

// --- CLASE ENEMIGO (Jabalí) ---
class Enemigo {
  constructor() {
    // Dimensiones del enemigo
    this.width = 30;
    this.height = 30;
    // Posición inicial aleatoria dentro del ancho del contenedor, evitando bordes
    this.x = Math.random() * (1200 - this.width - 100) + 100;
    // Posición Y en el suelo (600px es la altura del contenedor)
    this.y = 600 - this.height;
    this.element = document.createElement("div");
    this.element.classList.add("enemigo"); // Clase CSS para aplicar estilos
    this.element.style.width = `${this.width}px`;
    this.element.style.height = `${this.height}px`;
    this.actualizarPosicion();
  }

  // Método para que el enemigo persiga al personaje en el eje X
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

// --- CLASE ENEMIGO2 (Orbe Volador) ---
class Enemigo2 {
  constructor() {
    this.width = 24;
    this.height = 24;
    this.x = Math.random() * (1200 - this.width); // Posición X aleatoria en todo el ancho
    this.y = -this.height; // Inicia por encima del límite superior del contenedor
    this.velocidadCaida = Math.random() * 2 + 1; // Velocidad de caída aleatoria entre 1 y 3

    this.element = document.createElement("div");
    this.element.classList.add("enemigo2"); // Clase CSS para aplicar estilos
    this.element.style.width = `${this.width}px`;
    this.element.style.height = `${this.height}px`;
    this.actualizarPosicion();

    this.loop(); // Inicia el ciclo de movimiento para el enemigo2
  }

  loop() {
    // Usa setInterval para un control de tiempo consistente con tus otros loops
    setInterval(() => {
      this.caer();
    }, 50); // Ajusta la frecuencia para la suavidad de la caída
  }

  caer() {
    // Límite inferior del contenedor (600px es la altura del contenedor del juego)
    const gameContainerHeight = 600;

    this.y += this.velocidadCaida; // Incrementa la posición Y para simular la caída

    // Si el enemigo cae por debajo del límite inferior, lo reseteamos arriba
    if (this.y > gameContainerHeight) {
      this.resetearPosicion();
    }
    this.actualizarPosicion();
  }

  resetearPosicion() {
    this.x = Math.random() * (1200 - this.width); // Nueva posición X aleatoria
    this.y = -this.height; // Vuelve a iniciar por encima del límite superior
    this.velocidadCaida = Math.random() * 2 + 1; // Nueva velocidad de caída
  }

  actualizarPosicion() {
    this.element.style.left = `${this.x}px`;
    this.element.style.top = `${this.y}px`;
  }
}

// --- INICIAR EL JUEGO ---
const juego = new Game();