class Game {
  constructor() {
    this.container = document.getElementById("game-container");
    this.puntosElement = document.getElementById("puntos");
    this.personaje = null;
    this.enemigos1 = [];
    this.enemigos2 = [];
    this.puntuacion = 30; // Puntuación inicial antes de empezar el juego
    this.gameIntervals = []; // Array para guardar los IDs de los setInterval
    this.gameOver = false; // Flag para el estado de GAME OVER
    this.gameStarted = false; // Flag para saber si el juego ha empezado

    this.mostrarInstrucciones(); // Mostrar instrucciones al inicio
  }

  // --- MÉTODO MODIFICADO: mostrarInstrucciones() ---
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
    instructionsBox.style.padding = "20px 40px 25px"; // Ajuste: padding (top right bottom left) -> 20px arriba, 40px lados, 25px abajo
    instructionsBox.style.borderRadius = "15px";
    instructionsBox.style.textAlign = "center";
    instructionsBox.style.width = "calc(100% - 200px)";
    instructionsBox.style.maxWidth = "1000px";
    instructionsBox.style.height = "auto";
    instructionsBox.style.maxHeight = "calc(100vh - 40px)"; // Ajuste: Altura máxima de la ventana - 40px (20px arriba y 20px abajo para un margen visual)
    instructionsBox.style.overflowY = "auto"; // Añade scroll vertical si el contenido es demasiado largo
    instructionsBox.style.zIndex = "200";
    instructionsBox.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.5)";
    instructionsBox.style.boxSizing = "border-box"; // Asegura que padding y border se incluyan en el width/height

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
    startButton.style.marginTop = "20px"; // Ajuste: un poco menos de margen superior para el botón
    startButton.style.padding = "10px 20px"; // Ajuste: padding del botón ligeramente más pequeño
    startButton.style.fontSize = "24px"; // Ajuste: tamaño de fuente del botón un poco más pequeño
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

  // --- NUEVO MÉTODO: iniciarJuego() ---
  iniciarJuego() {
    this.gameStarted = true; // Marca el juego como iniciado
    this.puntuacion = 10; // Reinicia la puntuación al iniciar
    this.puntosElement.textContent = `Puntos: ${this.puntuacion}`; // Actualiza la visualización de puntos

    // Llamadas para iniciar los componentes del juego
    this.crearEscenario();
    this.agregarEventos(); // Esto incluye checkColisiones y loop
    this.generarEnemigos1Continuamente();
    this.generarEnemigos2Continuamente();

    // Asegurarse de que el personaje empiece su movimiento
    if (this.personaje) {
        this.personaje.loop();
    }
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
      enemigo2.loop();
    }
  }

  agregarEventos() {
    // Solo permitimos mover si el juego NO ha terminado y ha empezado
    window.addEventListener("keydown", (e) => {
      if (!this.gameOver && this.gameStarted) this.personaje.mover(e);
    });
    window.addEventListener("keyup", (e) => {
      if (!this.gameOver && this.gameStarted) this.personaje.finMover(e);
    });
    this.checkColisiones();
    this.loop();
  }

  loop() {
    const loopId = setInterval(() => {
      if (!this.gameOver && this.gameStarted) { // Condición para detener el loop
        this.enemigos1.forEach((enemigo) => enemigo.perseguir(this.personaje.x));
      }
    }, 50);
    this.gameIntervals.push(loopId); // Guardamos el ID
  }

  checkColisiones() {
    const checkColisionesId = setInterval(() => {
      if (this.gameOver || !this.gameStarted) return;

      this.enemigos1 = this.enemigos1.filter((enemigo) => {
        if (this.personaje.colisionaCon(enemigo)) {
          // --- CORRECCIÓN AQUÍ: Verificar si el elemento es hijo antes de remover ---
          if (this.container.contains(enemigo.element)) {
            this.container.removeChild(enemigo.element);
          }
          // --- FIN CORRECCIÓN ---
          this.actualizarPuntuacion(-6);
          return false; // Elimina el enemigo del array
        }
        return true;
      });

      this.enemigos2 = this.enemigos2.filter((enemigo2) => {
        if (this.personaje.colisionaCon(enemigo2)) {
          // --- CORRECCIÓN AQUÍ: Verificar si el elemento es hijo antes de remover ---
          if (this.container.contains(enemigo2.element)) { // Aunque no de error aquí, es buena práctica
            this.container.removeChild(enemigo2.element);
          }
          // --- FIN CORRECCIÓN ---
          this.actualizarPuntuacion(3);
          return false; // Elimina el enemigo del array
        }
        return true;
      });
    }, 100);
    this.gameIntervals.push(checkColisionesId);
  }
  generarEnemigos1Continuamente() {
    const genEnemigo1Id = setInterval(() => {
      if (!this.gameOver && this.gameStarted) { // Condición para detener la generación
        const enemigo = new Enemigo();
        this.enemigos1.push(enemigo);
        this.container.appendChild(enemigo.element);
      }
    }, 4000); // cada 2 segundos
    this.gameIntervals.push(genEnemigo1Id); // Guardamos el ID
  }

  generarEnemigos2Continuamente() {
    const genEnemigo2Id = setInterval(() => {
      if (!this.gameOver && this.gameStarted) { // Condición para detener la generación
        const enemigo2 = new Enemigo2();
        this.enemigos2.push(enemigo2);
        this.container.appendChild(enemigo2.element);
        enemigo2.loop();
      }
    }, 1500); // Genera un Enemigo2 cada 1.5 segundos
    this.gameIntervals.push(genEnemigo2Id); // Guardamos el ID
  }

  actualizarPuntuacion(puntos) {
    if (this.gameOver || !this.gameStarted) return; // Si ya es Game Over o no ha iniciado, no hagas nada

    this.puntuacion += puntos;
    this.puntuacion = Math.max(0, this.puntuacion); // Asegura que no baje de 0
    this.puntosElement.textContent = `Puntos: ${this.puntuacion}`;

    console.log("Puntos actuales:", this.puntuacion);

    if (this.puntuacion >= 100) { // CONDICIÓN DE VICTORIA
        this.ganarJuego(); // Llama a un nuevo método para la victoria
    } else if (this.puntuacion <= 0) {
        this.finDelJuego();
    }
  }

  // --- NUEVO MÉTODO: ganarJuego() para cuando se llega a 100 puntos ---
  ganarJuego() {
      if (this.gameOver) return; // Evitar que se llame dos veces
      this.gameOver = true;
      this.gameStarted = false; // El juego ya no está "activo"

      console.log("¡HAS GANADO! EL MAGO HA RECUPERADO SU TAMAÑO.");

      // Detener todos los bucles de juego
      this.gameIntervals.forEach(intervalId => clearInterval(intervalId));
      this.gameIntervals = [];

      // Ocultar al personaje y detener su movimiento
      if (this.personaje && this.personaje.element) {
          // Si quieres que el personaje "crezca", podrías cambiar su CSS o sprite aquí
          // Por ahora, solo lo detendremos.
          this.personaje.stopMoving();
          // this.personaje.element.style.display = "block"; // Si lo ocultaste al perder puntos
      }

      // Eliminar todos los enemigos
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

      // Mostrar mensaje de victoria
      const winMessage = document.createElement("div");
      winMessage.textContent = "¡HAS GANADO! EL MAGO HA RECUPERADO SU TAMAÑO.";
      winMessage.id = "winMessage";
      winMessage.style.position = "absolute";
      winMessage.style.fontSize = "4em";
      winMessage.style.fontWeight = "bold";
      winMessage.style.color = "#00FF00"; // Verde brillante para la victoria
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

      // Botón de Reinicio también para la victoria
      const restartButton = document.createElement("button");
      restartButton.textContent = "Jugar de Nuevo";
      restartButton.id = "restartButtonWin"; // ID diferente para distinguirlo
      restartButton.style.position = "absolute";
      restartButton.style.top = "60%";
      restartButton.style.left = "50%";
      restartButton.style.transform = "translate(-50%, -50%)";
      restartButton.style.zIndex = "101";
      restartButton.style.padding = "15px 30px";
      restartButton.style.fontSize = "24px";
      restartButton.style.fontWeight = "bold";
      restartButton.style.backgroundColor = "#4CAF50"; // Verde
      restartButton.style.color = "white";
      restartButton.style.border = "2px solid #388E3C";
      restartButton.style.borderRadius = "8px";
      restartButton.style.cursor = "pointer";
      restartButton.style.fontFamily = "'Cinzel', serif";
      restartButton.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.3)";
      restartButton.style.transition = "background-color 0.3s ease";

      // Efecto hover
      restartButton.onmouseover = () => { restartButton.style.backgroundColor = "#5cb85c"; };
      restartButton.onmouseout = () => { restartButton.style.backgroundColor = "#4CAF50"; };

      restartButton.addEventListener("click", () => {
          location.reload();
      });

      this.container.appendChild(restartButton);
      console.log("Mensaje de victoria y botón de Reinicio añadidos.");
  }


  finDelJuego() {
    console.log("¡Se ha llamado a finDelJuego! GAME OVER.");
    this.gameOver = true; // Establece el flag de juego terminado
    this.gameStarted = false; // El juego ya no está "activo"

    // Detener todos los bucles de juego (persecución, generación, colisiones)
    this.gameIntervals.forEach(intervalId => clearInterval(intervalId));
    this.gameIntervals = [];

    // Ocultar al personaje y detener su movimiento
    if (this.personaje && this.personaje.element) {
        this.personaje.element.style.display = "none"; // Ocultar al personaje al perder
        this.personaje.stopMoving();
    }

    // Eliminar todos los enemigos visibles
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
    gameOverMessage.style.color = "#FFD700"; // Oro
    gameOverMessage.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    gameOverMessage.style.fontFamily = "'Cinzel', serif";
    gameOverMessage.style.padding = "20px 40px";
    gameOverMessage.style.borderRadius = "10px";
    gameOverMessage.style.textAlign = "center";
    gameOverMessage.style.width = "auto";
    gameOverMessage.style.whiteSpace = "nowrap";
    gameOverMessage.style.top = "40%"; // Ajustado un poco más arriba para dejar espacio para el botón
    gameOverMessage.style.left = "50%";
    gameOverMessage.style.transform = "translate(-50%, -50%)";
    gameOverMessage.style.zIndex = "100";
    gameOverMessage.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.5)";
    gameOverMessage.style.boxSizing = "border-box";


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
    restartButton.style.backgroundColor = "#4CAF50"; // Un verde atractivo
    restartButton.style.color = "white";
    restartButton.style.border = "2px solid #388E3C";
    restartButton.style.borderRadius = "8px";
    restartButton.style.cursor = "pointer";
    restartButton.style.fontFamily = "'Cinzel', serif"; // También con la fuente del juego
    restartButton.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.3)"; // Sombra para que resalte
    restartButton.style.transition = "background-color 0.3s ease";

    // Efecto hover
    restartButton.onmouseover = () => { restartButton.style.backgroundColor = "#5cb85c"; };
    restartButton.onmouseout = () => { restartButton.style.backgroundColor = "#4CAF50"; };


    // Evento de clic para reiniciar el juego
    restartButton.addEventListener("click", () => {
        console.log("Botón Reiniciar clicado. Recargando la página.");
        location.reload(); // Recarga la página para reiniciar
    });

    this.container.appendChild(restartButton);
    console.log("Botón de Reinicio añadido al DOM.");
  }
}

// --- CLASE PERSONAJE ---
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
    this.movementInterval = null; // Para guardar el ID del intervalo de movimiento

    this.element = document.createElement("div");
    this.element.classList.add("personaje");
    this.element.style.width = `${this.width}px`;
    this.element.style.height = `${this.height}px`;

    this.groundY = 600 - this.height + 30; // 600px es la altura del game-container
    this.y = this.groundY; // Posiciona el personaje en el suelo inicialmente
    this.actualizarPosicion();

    // El loop del personaje ahora se iniciará solo cuando el juego comience
    // Eliminado: this.loop();
  }

  loop() {
    // Solo iniciar el intervalo de movimiento si no está ya activo
    if (!this.movementInterval) {
      this.movementInterval = setInterval(() => {
        // Solo mover si el juego ha iniciado y no ha terminado
        if (juego.gameStarted && !juego.gameOver) {
          if (this.rightPressed) {
            this.x = Math.min(this.x + this.velocidad, 1200 - this.width);
          }
          if (this.leftPressed) {
            this.x = Math.max(this.x - this.velocidad, 0);
          }
          this.actualizarPosicion();
        }
      }, 20);
    }
  }

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
    // Asegurarse de que el salto solo ocurra si el juego está iniciado y no ha terminado
    if (juego.gameStarted && !juego.gameOver && e.code === "Space" && this.jumpCount < 2 && !this.spacePressed) {
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

  aumentarTamano(aumentoPx) {
        // Aumenta el ancho y el alto actuales del personaje
        this.width += aumentoPx;
        this.height += aumentoPx;

        // Ajusta la posición Y para que el personaje "crezca hacia arriba"
        // (es decir, su base permanezca en el suelo)
        this.y = this.groundY - (this.height - 100); // 100 es la altura inicial

        // Vuelve a aplicar el tamaño y la posición al elemento HTML
        this.actualizarPosicion();
        console.log(`¡Personaje ha crecido! Nuevo tamaño: ${this.width}x${this.height}px`);
    }
}


// --- CLASE ENEMIGO (Jabalí) ---
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

// --- CLASE ENEMIGO2 (Orbe Volador) ---
class Enemigo2 {
  constructor() {
    this.width = 48;
    this.height = 48;
    this.x = Math.random() * (1200 - this.width);
    this.y = -this.height;
    this.velocidadCaida = Math.random() * 2 + 1;

    this.element = document.createElement("div");
    this.element.classList.add("enemigo2");
    this.element.style.width = `${this.width}px`;
    this.element.style.height = `${this.height}px`;

    // --- CÓDIGO NUEVO PARA IMÁGENES ALEATORIAS DE ORBES ---
    // Define las rutas a tus imágenes de orbes.
    // ASEGÚRATE de que estos nombres de archivo coincidan exactamente
    // con los nombres de tus PNGs en la misma carpeta.
    const orbImages = [
      "assets/orb1.png",   // <--- Rutas con "assets/" y comillas dobles
      "assets/orb2.png",
      "assets/orb3.png",
      "assets/orb4.png"
    ];

    // Selecciona una imagen al azar del array
    const randomImage = orbImages[Math.floor(Math.random() * orbImages.length)];

    // Asigna la imagen de fondo al elemento del orbe
    this.element.style.backgroundImage = `url("${randomImage}")`;
    this.element.style.backgroundSize = "cover"; // Ajusta la imagen para que cubra el elemento
    this.element.style.backgroundPosition = "center"; // Centra la imagen dentro del elemento
    this.element.style.backgroundRepeat = "no-repeat"; // Evita que la imagen se repita

    this.actualizarPosicion();
  }

  loop() {
    setInterval(() => {
      if (juego.gameStarted && !juego.gameOver) {
        this.caer();
      }
    }, 50);
  }

  caer() {
    const gameContainerHeight = 600;

    this.y += this.velocidadCaida;

    if (this.y > gameContainerHeight) {
      this.resetearPosicion();
    }
    this.actualizarPosicion();
  }

  resetearPosicion() {
    this.x = Math.random() * (1200 - this.width);
    this.y = -this.height;
    this.velocidadCaida = Math.random() * 2 + 1;
  }

  actualizarPosicion() {
    this.element.style.left = `${this.x}px`;
    this.element.style.top = `${this.y}px`;
  }
}

// --- INICIAR EL JUEGO ---
// Instanciamos el juego. Ahora, el constructor llamará a mostrarInstrucciones()
// y el juego en sí no empezará hasta que se pulse el botón "Empezar Aventura".
const juego = new Game();