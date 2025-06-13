class Game {
  constructor() {
    // Inicialización de elementos del DOM
    this.container = document.getElementById("game-container");
    this.puntosElement = document.getElementById("puntos");

    // Inicialización de entidades del juego
    this.personaje = null;
    this.enemigos1 = []; // Array para los jabalíes
    this.enemigos2 = []; // Array para los orbes voladores

    // Variables de estado del juego
    this.puntuacion = 10; // Puntuación inicial del jugador
    this.gameIntervals = []; // Almacena los IDs de los intervalos para poder limpiarlos
    this.gameOver = false; // Flag que indica si el juego ha terminado
    this.gameStarted = false; // Flag que indica si el juego ha comenzado tras las instrucciones

    // Configuración del audio de fondo
    this.bgMusic = new Audio("Sonidos/As-far-as-the-eye.mp3"); // Carga el archivo de música de fondo
    this.bgMusic.loop = true; // Configura la música para que se repita
    this.bgMusic.volume = 0.5; // Establece el volumen de la música (1.0 es máximo)

    // Muestra las instrucciones del juego al cargar
    this.mostrarInstrucciones();
  }

  // Muestra la pantalla de instrucciones y el botón de inicio
  mostrarInstrucciones() {
    const instructionsBox = document.createElement("div");
    instructionsBox.id = "instructionsBox";
    instructionsBox.style.position = "absolute";
    instructionsBox.style.top = "50%";
    instructionsBox.style.left = "50%";
    instructionsBox.style.transform = "translate(-50%, -50%)";
    instructionsBox.style.backgroundColor = "rgba(0, 0, 0, 0.9)";
    instructionsBox.style.color = "#FFD700";
    instructionsBox.style.fontFamily = "'Cinzel', serif";
    instructionsBox.style.padding = "20px 40px 25px";
    instructionsBox.style.borderRadius = "15px";
    instructionsBox.style.textAlign = "center";
    instructionsBox.style.width = "calc(100% - 200px)";
    instructionsBox.style.maxWidth = "1000px";
    instructionsBox.style.height = "auto";
    instructionsBox.style.maxHeight = "calc(100vh - 40px)";
    instructionsBox.style.overflowY = "auto";
    instructionsBox.style.zIndex = "200";
    instructionsBox.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.5)";
    instructionsBox.style.boxSizing = "border-box";

    let instructionsHTML = `
      <h2 style="font-size: 2.7em; margin-bottom: 15px;">La Esencia del Mago</h2>
      <p style="font-size: 1.1em; line-height: 1.5;">
        Eres un mago encogido que debe restaurar su poder y tamaño.
      </p>
      <p style="font-size: 1.1em; line-height: 1.5; margin-bottom: 20px;">
        Recolecta los **Orbes Voladores** (los pequeños) para recuperar tu energía y crecer.
        ¡Cada orbe te da **3 puntos**!
      </p>
      <p style="font-size: 1.1em; line-height: 1.5; margin-bottom: 20px;">
        ¡Cuidado con los **Jabalíes Furiosos**! Si te tocan, perderás energía.
        ¡Cada golpe de jabalí te resta **6 puntos**!
      </p>
      <p style="font-size: 1.1em; line-height: 1.5;">
        Tu misión es alcanzar los **100 puntos** para recuperar tu tamaño original.
        Si tu energía llega a **0**, el juego termina.
      </p>
      <p style="font-size: 1.3em; font-weight: bold; margin-top: 25px;">
        Controles:
      </p>
      <p style="font-size: 1.1em;">
        **Flechas Izquierda/Derecha:** Moverse
      </p>
      <p style="font-size: 1.1em; margin-bottom: 20px;"> **Espacio:** Saltar (doble salto posible)
      </p>
    `;

    instructionsBox.innerHTML = instructionsHTML;

    const startButton = document.createElement("button");
    startButton.textContent = "¡Empezar Aventura!";
    startButton.style.marginTop = "20px";
    startButton.style.padding = "10px 20px";
    startButton.style.fontSize = "24px";
    startButton.style.fontWeight = "bold";
    startButton.style.backgroundColor = "#4CAF50";
    startButton.style.color = "white";
    startButton.style.border = "2px solid #388E3C";
    startButton.style.borderRadius = "8px";
    startButton.style.cursor = "pointer";
    startButton.style.fontFamily = "'Cinzel', serif";
    startButton.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.3)";
    startButton.style.transition = "background-color 0.3s ease";

    // Efecto hover
    startButton.onmouseover = () => { startButton.style.backgroundColor = "#5cb85c"; };
    startButton.onmouseout = () => { startButton.style.backgroundColor = "#4CAF50"; };

    startButton.addEventListener("click", () => {
      this.container.removeChild(instructionsBox);
      this.iniciarJuego();
    });

    this.container.appendChild(instructionsBox);
    instructionsBox.appendChild(startButton);
  }

  // Inicia la lógica principal del juego una vez que se pulsa el botón de empezar
  iniciarJuego() {
    this.gameStarted = true; // Marca el juego como iniciado
    this.puntuacion = 10; // Reinicia la puntuación al iniciar la partida
    this.puntosElement.textContent = `Puntos: ${this.puntuacion}`; // Actualiza la visualización de puntos

    // Prepara el escenario y los eventos del juego
    this.crearEscenario();
    this.agregarEventos();
    this.generarEnemigos1Continuamente(); // Inicia la generación de jabalíes
    this.generarEnemigos2Continuamente(); // Inicia la generación de orbes

    // Asegura que el bucle de movimiento del personaje se inicie
    if (this.personaje) {
        this.personaje.loop();
    }

    // Intenta iniciar la música de fondo. Envuelto en un try/catch para manejar promesas.
    this.bgMusic.play().then(() => {
        console.log("Música de fondo iniciada correctamente.");
    }).catch(error => {
        console.error("Error al iniciar la música de fondo:", error);
    });
  }

  // Configura el personaje y los orbes iniciales en el escenario
  crearEscenario() {
    this.personaje = new Personaje();
    this.personaje.container = this.container;
    this.container.appendChild(this.personaje.element);

    for (let i = 0; i < 2; i++) {
      const enemigo2 = new Enemigo2();
      this.enemigos2.push(enemigo2);
      this.container.appendChild(enemigo2.element);
      enemigo2.loop(); // Inicia el movimiento de los orbes
    }
  }

  // Agrega los event listeners para el control del personaje y las colisiones
  agregarEventos() {
    // Escucha las teclas para el movimiento del personaje
    window.addEventListener("keydown", (e) => {
      if (!this.gameOver && this.gameStarted) this.personaje.mover(e);
    });
    window.addEventListener("keyup", (e) => {
      if (!this.gameOver && this.gameStarted) this.personaje.finMover(e);
    });
    this.checkColisiones(); // Inicia la detección de colisiones
    this.loop(); // Inicia el bucle principal de actualización del juego
  }

  // Bucle principal del juego que actualiza la posición de los enemigos
  loop() {
    const loopId = setInterval(() => {
      if (!this.gameOver && this.gameStarted) {
        this.enemigos1.forEach((enemigo) => enemigo.perseguir(this.personaje.x));
      }
    }, 50);
    this.gameIntervals.push(loopId);
  }

  // Revisa constantemente las colisiones entre el personaje y los enemigos/orbes
  checkColisiones() {
    const checkColisionesId = setInterval(() => {
      if (this.gameOver || !this.gameStarted) return;

      // Colisiones con Jabalíes (enemigos1)
      this.enemigos1 = this.enemigos1.filter((enemigo) => {
        if (this.personaje.colisionaCon(enemigo)) {
          if (this.container.contains(enemigo.element)) {
            this.container.removeChild(enemigo.element);
          }
          this.actualizarPuntuacion(-6); // Resta puntos por colisión con jabalí
          return false; // Elimina el jabalí colisionado
        }
        return true;
      });

      // Colisiones con Orbes (enemigos2)
      this.enemigos2 = this.enemigos2.filter((enemigo2) => {
        if (this.personaje.colisionaCon(enemigo2)) {
          if (this.container.contains(enemigo2.element)) {
            this.container.removeChild(enemigo2.element);
          }
          this.actualizarPuntuacion(3); // Suma puntos por colisión con orbe
          return false; // Elimina el orbe colisionado
        }
        return true;
      });
    }, 100);
    this.gameIntervals.push(checkColisionesId);
  }

  // Genera nuevos jabalíes a intervalos regulares
  generarEnemigos1Continuamente() {
    const genEnemigo1Id = setInterval(() => {
      if (!this.gameOver && this.gameStarted) {
        const enemigo = new Enemigo();
        this.enemigos1.push(enemigo);
        this.container.appendChild(enemigo.element);
      }
    }, 4000); // Genera un jabalí cada 4 segundos
    this.gameIntervals.push(genEnemigo1Id);
  }

  // Genera nuevos orbes a intervalos regulares
  generarEnemigos2Continuamente() {
    const genEnemigo2Id = setInterval(() => {
      if (!this.gameOver && this.gameStarted) {
        const enemigo2 = new Enemigo2();
        this.enemigos2.push(enemigo2);
        this.container.appendChild(enemigo2.element);
        enemigo2.loop(); // Inicia el movimiento del nuevo orbe
      }
    }, 1500); // Genera un orbe cada 1.5 segundos
    this.gameIntervals.push(genEnemigo2Id);
  }

  // Actualiza la puntuación del jugador y verifica condiciones de victoria/derrota
  actualizarPuntuacion(puntos) {
    if (this.gameOver || !this.gameStarted) return;

    this.puntuacion += puntos;
    this.puntuacion = Math.max(0, this.puntuacion); // Asegura que la puntuación no baje de 0
    this.puntosElement.textContent = `Puntos: ${this.puntuacion}`;

    console.log("Puntos actuales:", this.puntuacion);

    if (this.puntuacion >= 100) { // Si la puntuación alcanza 100 o más, el jugador gana
        this.ganarJuego();
    } else if (this.puntuacion <= 0) { // Si la puntuación llega a 0 o menos, es Game Over
        this.finDelJuego();
    }
  }

  // Lógica ejecutada cuando el jugador alcanza los 100 puntos y gana
  ganarJuego() {
      if (this.gameOver) return; // Evita ejecuciones múltiples
      this.gameOver = true;
      this.gameStarted = false;

      console.log("¡HAS GANADO! EL MAGO HA RECUPERADO SU TAMAÑO.");

      this.bgMusic.pause();
      this.bgMusic.currentTime = 0;

      // Detiene todos los intervalos de juego
      this.gameIntervals.forEach(intervalId => clearInterval(intervalId));
      this.gameIntervals = [];

      if (this.personaje && this.personaje.element) {
          this.personaje.stopMoving();
          this.personaje.aumentarTamano(50); 
      }

      // Elimina todos los enemigos visibles
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

      // Muestra el mensaje de victoria
      const winMessage = document.createElement("div");
      winMessage.textContent = "¡HAS GANADO! EL MAGO HA RECUPERADO SU TAMAÑO.";
      winMessage.id = "winMessage";
      winMessage.style.position = "absolute";
      winMessage.style.fontSize = "2.5em";
      winMessage.style.fontWeight = "bold";
      winMessage.style.color = "#00FFff";
      winMessage.style.backgroundColor = "rgba(0, 0, 0, 0.85)";
      winMessage.style.fontFamily = "'Cinzel', serif";
      winMessage.style.padding = "40px";
      winMessage.style.borderRadius = "15px";
      winMessage.style.textAlign = "center";
      winMessage.style.width = "80%";
      winMessage.style.maxWidth = "800px";
      winMessage.style.top = "40%";
      winMessage.style.left = "50%";
      winMessage.style.transform = "translate(-50%, -50%)";
      winMessage.style.zIndex = "100";
      winMessage.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.5)";
      winMessage.style.boxSizing = "border-box";

      this.container.appendChild(winMessage);

      // Crea y añade el botón "Jugar de Nuevo"
      const restartButton = document.createElement("button");
      restartButton.textContent = "Jugar de Nuevo";
      restartButton.id = "restartButtonWin";
      restartButton.style.position = "absolute";
      restartButton.style.top = "60%";
      restartButton.style.left = "50%";
      restartButton.style.transform = "translate(-50%, -50%)";
      restartButton.style.zIndex = "101";
      restartButton.style.padding = "15px 30px";
      restartButton.style.fontSize = "24px";
      restartButton.style.fontWeight = "bold";
      restartButton.style.backgroundColor = "#4CAF50";
      restartButton.style.color = "white";
      restartButton.style.border = "2px solid #388E3C";
      restartButton.style.borderRadius = "8px";
      restartButton.style.cursor = "pointer";
      restartButton.style.fontFamily = "'Cinzel', serif";
      restartButton.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.3)";
      restartButton.style.transition = "background-color 0.3s ease";

      restartButton.onmouseover = () => { restartButton.style.backgroundColor = "#5cb85c"; };
      restartButton.onmouseout = () => { restartButton.style.backgroundColor = "#4CAF50"; };

      restartButton.addEventListener("click", () => {
          location.reload(); // Recarga la página para reiniciar el juego
      });

      this.container.appendChild(restartButton);
      console.log("Mensaje de victoria y botón de Reinicio añadidos.");
  }

  // Lógica ejecutada cuando la puntuación llega a 0 y el juego termina
  finDelJuego() {
    console.log("¡Se ha llamado a finDelJuego! GAME OVER.");
    this.gameOver = true;
    this.gameStarted = false;

    // Pausa y reinicia la música de fondo al perder
    this.bgMusic.pause();
    this.bgMusic.currentTime = 0;

    // Detiene todos los intervalos de juego
    this.gameIntervals.forEach(intervalId => clearInterval(intervalId));
    this.gameIntervals = [];

    // Oculta el personaje y detiene su movimiento
    if (this.personaje && this.personaje.element) {
        this.personaje.element.style.display = "none";
        this.personaje.stopMoving();
    }

    // Elimina todos los enemigos visibles
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

    // Muestra el mensaje de Game Over
    const gameOverMessage = document.createElement("div");
    gameOverMessage.textContent = "GAME OVER";
    gameOverMessage.id = "gameOverMessage";
    gameOverMessage.style.position = "absolute";
    gameOverMessage.style.fontSize = "60px";
    gameOverMessage.style.fontWeight = "bold";
    gameOverMessage.style.color = "#FFD700";
    gameOverMessage.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    gameOverMessage.style.fontFamily = "'Cinzel', serif";
    gameOverMessage.style.padding = "20px 40px";
    gameOverMessage.style.borderRadius = "10px";
    gameOverMessage.style.textAlign = "center";
    gameOverMessage.style.width = "auto";
    gameOverMessage.style.whiteSpace = "nowrap";
    gameOverMessage.style.top = "40%";
    gameOverMessage.style.left = "50%";
    gameOverMessage.style.transform = "translate(-50%, -50%)";
    gameOverMessage.style.zIndex = "100";
    gameOverMessage.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.5)";
    gameOverMessage.style.boxSizing = "border-box";

    this.container.appendChild(gameOverMessage);
    console.log("Mensaje de Game Over añadido al DOM.");

    // Crea y añade el botón de reinicio
    const restartButton = document.createElement("button");
    restartButton.textContent = "Reiniciar Juego";
    restartButton.id = "restartButton";
    restartButton.style.position = "absolute";
    restartButton.style.top = "60%";
    restartButton.style.left = "50%";
    restartButton.style.transform = "translate(-50%, -50%)";
    restartButton.style.zIndex = "101";
    restartButton.style.padding = "15px 30px";
    restartButton.style.fontSize = "24px";
    restartButton.style.fontWeight = "bold";
    restartButton.style.backgroundColor = "#4CAF50";
    restartButton.style.color = "white";
    restartButton.style.border = "2px solid #388E3C";
    restartButton.style.borderRadius = "8px";
    restartButton.style.cursor = "pointer";
    restartButton.style.fontFamily = "'Cinzel', serif";
    restartButton.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.3)";
    restartButton.style.transition = "background-color 0.3s ease";

    restartButton.onmouseover = () => { restartButton.style.backgroundColor = "#5cb85c"; };
    restartButton.onmouseout = () => { restartButton.style.backgroundColor = "#4CAF50"; };

    restartButton.addEventListener("click", () => {
        console.log("Botón Reiniciar clicado. Recargando la página.");
        location.reload();
    });

    this.container.appendChild(restartButton);
    console.log("Botón de Reinicio añadido al DOM.");
  }
}

// CLASE PERSONAJE
class Personaje {
  constructor() {
    // Propiedades de posición y tamaño
    this.x = 50;
    this.y = 0;
    this.width = 64;
    this.height = 100;
    this.velocidad = 10; // Velocidad de movimiento horizontal

    // Banderas de control de teclado
    this.rightPressed = false;
    this.leftPressed = false;
    this.spacePressed = false;

    // Propiedades de salto
    this.jumpCount = 0; // Para controlar el doble salto
    this.saltoSimple = 100; // Altura del primer salto
    this.saltoDoble = 170; // Altura del segundo salto (adicional al primero)
    this.saltoTimer = null; // ID del intervalo de salto
    this.gravedadTimer = null; // ID del intervalo de caída por gravedad

    // Elemento DOM del personaje
    this.element = document.createElement("div");
    this.element.classList.add("personaje");
    this.element.style.width = `${this.width}px`;
    this.element.style.height = `${this.height}px`;

    // Posición inicial en el suelo
    this.groundY = 600 - this.height + 30; // Calcula la posición Y del suelo (altura del contenedor - altura personaje + ajuste)
    this.y = this.groundY;
    this.actualizarPosicion();

    this.movementInterval = null; // Para controlar el bucle de movimiento
  }

  // Bucle principal para el movimiento horizontal del personaje
  loop() {
    if (!this.movementInterval) {
      this.movementInterval = setInterval(() => {
        if (juego.gameStarted && !juego.gameOver) {
          if (this.rightPressed) {
            this.x = Math.min(this.x + this.velocidad, 1200 - this.width); // Mueve a la derecha, limitado por el borde
          }
          if (this.leftPressed) {
            this.x = Math.max(this.x - this.velocidad, 0); // Mueve a la izquierda, limitado por el borde
          }
          this.actualizarPosicion();
        }
      }, 20);
    }
  }

  // Detiene todos los movimientos y animaciones del personaje
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

  // Maneja el inicio de movimiento por pulsación de tecla
  mover(e) {
    if (e.key === "ArrowRight") this.rightPressed = true;
    if (e.key === "ArrowLeft") this.leftPressed = true;
    // Permite saltar (hasta doble salto) solo si el juego está activo y la tecla espacio no está ya presionada
    if (juego.gameStarted && !juego.gameOver && e.code === "Space" && this.jumpCount < 2 && !this.spacePressed) {
      this.spacePressed = true;
      this.saltar();
    }
  }

  // Maneja el fin de movimiento por liberación de tecla
  finMover(e) {
    if (e.key === "ArrowRight") this.rightPressed = false;
    if (e.key === "ArrowLeft") this.leftPressed = false;
    if (e.code === "Space") this.spacePressed = false;
  }

  // Lógica del salto (simple o doble)
  saltar() {
    if (this.saltoTimer) clearInterval(this.saltoTimer);
    if (this.gravedadTimer) clearInterval(this.gravedadTimer);

    this.jumpCount++; // Incrementa el contador de saltos
    const saltoAltura = this.jumpCount === 1 ? this.saltoSimple : this.saltoDoble; // Define la altura según el número de saltos
    const targetY = this.y - saltoAltura; // Calcula la posición Y máxima del salto

    this.saltoTimer = setInterval(() => {
      if (this.y > targetY) {
        this.y -= 10; // Sube al personaje
        this.actualizarPosicion();
      } else {
        clearInterval(this.saltoTimer);
        this.caer(); // Cuando llega a la altura máxima, inicia la caída
      }
    }, 20);
  }

  // Lógica de caída por gravedad
  caer() {
    if (this.gravedadTimer) clearInterval(this.gravedadTimer);

    this.gravedadTimer = setInterval(() => {
      this.y += 10; // Baja al personaje
      if (this.y >= this.groundY) { // Si llega o pasa del suelo
        this.y = this.groundY; // Ajusta a la posición exacta del suelo
        this.jumpCount = 0; // Reinicia el contador de saltos
        clearInterval(this.gravedadTimer);
        this.gravedadTimer = null;
      }
      this.actualizarPosicion();
    }, 20);
  }

  // Actualiza la posición visual del elemento DOM del personaje
  actualizarPosicion() {
    this.element.style.left = `${this.x}px`;
    this.element.style.top = `${this.y}px`;
  }

  // Detecta si el personaje colisiona con otro objeto
  colisionaCon(objeto) {
    return (
      this.x < objeto.x + objeto.width &&
      this.x + this.width > objeto.x &&
      this.y < objeto.y + objeto.height &&
      this.y + this.height > objeto.y
    );
  }

  // Aumenta el tamaño visual del personaje (para la victoria)
  aumentarTamano(aumentoPx) {
      this.width += aumentoPx; // Aumenta el ancho
      this.height += aumentoPx; // Aumenta el alto

      this.y = this.groundY - (this.height - 100); // Ajusta la posición Y para que crezca "hacia arriba"
      this.actualizarPosicion();
      console.log(`¡Personaje ha crecido! Nuevo tamaño: ${this.width}x${this.height}px`);
  }
}

// CLASE ENEMIGO (Jabalí)
class Enemigo {
  constructor() {
    // Propiedades de tamaño y posición inicial aleatoria
    this.width = 30;
    this.height = 30;
    this.x = Math.random() * (1200 - this.width - 100) + 100; // Posición X aleatoria
    this.y = 600 - this.height; // Posición Y en el suelo

    // Elemento DOM del enemigo
    this.element = document.createElement("div");
    this.element.classList.add("enemigo");
    this.element.style.width = `${this.width}px`;
    this.element.style.height = `${this.height}px`;
    this.actualizarPosicion();
  }

  // Hace que el enemigo persiga al personaje
  perseguir(targetX, velocidad = 2) {
    if (this.x < targetX) this.x += velocidad; // Se mueve hacia la derecha si el personaje está a la derecha
    else if (this.x > targetX) this.x -= velocidad; // Se mueve hacia la izquierda si el personaje está a la izquierda
    this.actualizarPosicion();
  }

  // Actualiza la posición visual del elemento DOM del enemigo
  actualizarPosicion() {
    this.element.style.left = `${this.x}px`;
    this.element.style.top = `${this.y}px`;
  }
}

// CLASE ENEMIGO2 (Orbe Volador)
class Enemigo2 {
  constructor() {
    // Propiedades de tamaño y posición inicial fuera de la pantalla (arriba)
    this.width = 48;
    this.height = 48;
    this.x = Math.random() * (1200 - this.width); // Posición X aleatoria
    this.y = -this.height; // Comienza por encima del límite superior
    this.velocidadCaida = Math.random() * 2 + 1; // Velocidad de caída aleatoria

    // Elemento DOM del orbe
    this.element = document.createElement("div");
    this.element.classList.add("enemigo2");
    this.element.style.width = `${this.width}px`;
    this.element.style.height = `${this.height}px`;

    // Selección aleatoria de imagen para el orbe
    const orbImages = [
      "assets/orb1.png",
      "assets/orb2.png",
      "assets/orb3.png",
      "assets/orb4.png"
    ];
    const randomImage = orbImages[Math.floor(Math.random() * orbImages.length)];
    this.element.style.backgroundImage = `url("${randomImage}")`;
    this.element.style.backgroundSize = "cover";
    this.element.style.backgroundPosition = "center";
    this.element.style.backgroundRepeat = "no-repeat";

    this.actualizarPosicion();
  }

  // Bucle principal para el movimiento de caída del orbe
  loop() {
    setInterval(() => {
      if (juego.gameStarted && !juego.gameOver) {
        this.caer(); // Llama al método de caída
      }
    }, 50);
  }

  // Lógica de caída del orbe
  caer() {
    const gameContainerHeight = 600; // Altura del contenedor del juego

    this.y += this.velocidadCaida; // El orbe desciende

    if (this.y > gameContainerHeight) { // Si el orbe sale por la parte inferior
      this.resetearPosicion(); // Lo resetea a una nueva posición superior
    }
    this.actualizarPosicion();
  }

  // Reinicia la posición del orbe en la parte superior de la pantalla
  resetearPosicion() {
    this.x = Math.random() * (1200 - this.width);
    this.y = -this.height;
    this.velocidadCaida = Math.random() * 2 + 1;
  }

  // Actualiza la posición visual del elemento DOM del orbe
  actualizarPosicion() {
    this.element.style.left = `${this.x}px`;
    this.element.style.top = `${this.y}px`;
  }
}

// INICIAR EL JUEGO
// Crea una nueva instancia de la clase Game al cargar el script.
// El constructor de Game se encargará de mostrar las instrucciones iniciales.
const juego = new Game();

/*
// COMANDOS PARA LA CONSOLA DEL NAVEGADOR (para pruebas rápidas):

// Para probar el mensaje de "¡HAS GANADO!" y la animación del mago creciendo:
// 1. Abre el juego en tu navegador.
// 2. Abre las Herramientas de Desarrollador (F12) y ve a la pestaña "Console".
// 3. Escribe lo siguiente y presiona Enter:
juego.puntuacion = 99; // Establece la puntuación a 99
juego.actualizarPuntuacion(1); // Suma 1 punto, activando la victoria

// Para probar el mensaje de "GAME OVER":
// 1. Abre el juego en tu navegador.
// 2. Abre las Herramientas de Desarrollador (F12) y ve a la pestaña "Console".
// 3. Escribe lo siguiente y presiona Enter:
juego.puntuacion = 1; // Establece la puntuación a 1
juego.actualizarPuntuacion(-1); // Resta 1 punto, activando el Game Over
*/