const newArray = [];
const messages = document.querySelectorAll('details');
const spanId = localStorage.getItem('oldMessages');

if (localStorage.getItem('oldMessages') === null) {
  console.log('no local storage found');
} else {
  const storage = window.localStorage.oldMessages;
  const spanArray = storage.split(',')
    .filter((data, index, array) => array.indexOf(data) === index)
    .filter(data => data != "");

  spanArray.forEach(id => {
    document.getElementById(`${id}`).classList.remove('new');
  });
}

function messageSeen() {
  const oldMessage = this.children[0].children[0];
  oldMessage.classList.remove('new');

  newArray.push(spanId);
  newArray.push(oldMessage.id)

  localStorage.setItem('oldMessages', newArray);
}

messages.forEach(message => message.addEventListener('click', messageSeen));

window.addEventListener("hashchange", () => {
    window.scrollTo(window.scrollX, window.scrollY - 60);
});
