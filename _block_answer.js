// allow pasting

const groups = {};

document.querySelectorAll('input[type="radio"]').forEach((radio) => {
  const name = radio.name;
  if (!groups[name]) groups[name] = [];
  groups[name].push(radio);
});


Object.values(groups).forEach((radios) => {
  const randomIndex = Math.floor(Math.random() * radios.length);
  radios[randomIndex].click();
});
