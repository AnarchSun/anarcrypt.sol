// main.js

// Exemple : fonction pour afficher un message dans la console
console.log('Bienvenue dans le script principal de Chaos Magic !');

// Exemple : fonction pour ajouter un événement au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
  console.log('Document entièrement chargé et parsé.');

  // Exemple : changer dynamiquement le texte d'un élément avec l'id "title"
  const titleElement = document.getElementById('title');
  if (titleElement) {
    titleElement.textContent = 'Chaos Magic : Bienvenue !';
  }

  // Exemple : ajouter une fonction à un bouton
  const button = document.getElementById('actionButton');
  if (button) {
    button.addEventListener('click', () => {
      alert('Bouton cliqué !');
    });
  }
});

// Exemple : fonction générique pour manipuler une classe CSS
function toggleClass(elementId, className) {
  const element = document.getElementById(elementId);
  if (element) {
    element.classList.toggle(className);
  }
}

// Export des fonctions (si nécessaire dans des environnements comme Node.js ou modules)
export { toggleClass };