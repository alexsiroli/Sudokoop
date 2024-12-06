<template>
  <div class="home-container">
    <div class="home-box">
      <div class="header">
        <h1>Sudokoop</h1>
      </div>
      <!-- Sezione principale del menu -->
      <div class="menu">
        <!-- Pulsante per giocare in singolo -->
        <div class="menu-item">
          <router-link to="/game" class="menu-button">Gioca in Singolo</router-link>
        </div>
        <!-- Pulsante per giocare in multiplayer -->
        <div class="menu-item">
          <router-link to="/multiplayer" class="menu-button">Gioca in Multiplayer</router-link>
        </div>
      </div>
      <!-- Sezione inferiore per opzioni aggiuntive -->
      <div class="footer">
        <div class="footer-item">
          <button class="footer-button">Impostazioni</button>
        </div>
        <div class="footer-item">
          <button class="footer-button">Crediti</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
};
</script>

<style scoped>
/* Contenitore principale della home */
.home-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  padding: 20px;
}

/* Contenitore principale con bordo stondato */
.home-box {
  max-width: 600px;
  padding: 20px;
  border: 3px solid #000;
  border-radius: 10px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);
  background-color: #f9f9f9;
  text-align: center;
}

/* Stile per l'intestazione */
.header {
  margin-bottom: 40px;
  text-align: center;
}

/* Stile per il menu principale */
.menu {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 40px;
}

/* Stile per ciascun elemento del menu */
.menu-item {
  text-align: center;
}

/* Pulsanti del menu */
.menu-button {
  padding: 15px 30px;
  font-size: 1.5em;
  text-decoration: none;
  border: 2px solid #000;
  border-radius: 10px;
  cursor: pointer;
  display: inline-block;
}

/* Stile per la sezione inferiore della home */
.footer {
  display: flex;
  gap: 20px;
  justify-content: center;
}

/* Stile per ciascun elemento della sezione inferiore */
.footer-item {
  text-align: center;
}

/* Pulsanti della sezione inferiore */
.footer-button {
  padding: 10px 20px;
  font-size: 1em;
  cursor: pointer;
  border: 2px solid #000;
  border-radius: 5px;
}
</style>
