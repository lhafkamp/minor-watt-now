const newArray = [];
const spanId = localStorage.getItem('oldMessages');
const main = document.querySelector('main');
const history = document.querySelector('#history');
const navItems = document.querySelectorAll('nav a');

// localStorage to check which messages have already been seen
if (localStorage.getItem('oldMessages') === null) {
  console.log('no local storage found');
} else {
  const storage = window.localStorage.oldMessages;
  const spanArray = storage.split(',')
    .filter((data, index, array) => array.indexOf(data) === index)
    .filter(data => data != "");

  spanArray.forEach(id => {
    const pressed = document.getElementById(`${id}`);
    if (document.body.contains(pressed)) {
      pressed.classList.remove('new');
    }
  });
}

// removing the 'new' indicator and send it to localStorage
function messageSeen(e) {
  if (e.target.nodeName === 'SUMMARY') {
    const oldMessage = e.target.querySelector('span');
    oldMessage.classList.remove('new');

    newArray.push(spanId);
    newArray.push(oldMessage.id)

    localStorage.setItem('oldMessages', newArray);
  }
}

document.body.addEventListener('click', messageSeen);

// adjust navigation because of the fixed nav
window.addEventListener("hashchange", () => {
    window.scrollTo(window.scrollX, window.scrollY - 60);
});

// Toggle between the main content and history
function toggle() {
  if (this.getAttribute('href') === '#history') {
    main.classList.add('hide');
    history.classList.remove('hide');
  } else {
    main.classList.remove('hide');
    history.classList.add('hide');
  }
}

navItems.forEach(item => item.addEventListener('click', toggle));
