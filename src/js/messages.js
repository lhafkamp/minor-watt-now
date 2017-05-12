const history = document.querySelector('#history div');
const advice = document.querySelector('#advice div');
const audio = document.querySelector('audio');
const io = require('socket.io-client');

const socket = io.connect();

// Hack to force-play audio on mobile
document.addEventListener('touchstart', () => {
  audio.play();
  audio.pause();
});

// Create new message
socket.on('newMessage', data => {
  audio.play();
  messageDOM(data[0]);
});

function messageDOM(data) {
  let spanColor;
  if (data.type === 'credit') {
    spanColor = 'newYellow';
  } else if (data.type === 'drop') {
    spanColor = 'newBlue';
  } else {
    spanColor = 'new';
  }

  return advice.insertAdjacentHTML('afterbegin',
  `<article>
    <details>
      <summary>${data.message}<span id="1" class="${spanColor}"></span></summary>
      <div>
        <h2>${data.header}</h2>
        <p>${data.advice}</p>
      </div>
    </details>
  </article>
  `);
}

// Remove message
socket.on('removeMessage', data => {
  const oldMessages = [];

  document.body.querySelectorAll('summary').forEach(msg => {
    oldMessages.push(msg.innerText);
  });

  const deadMessage = oldMessages.filter(msg => msg === data[0].message);

  document.body.querySelectorAll('article').forEach(msg => {
    if (msg.innerHTML.indexOf(deadMessage) !== -1) {
      historyDOM(data[0]);
      msg.remove();
    }
  });
});

function historyDOM(data) {
  return history.insertAdjacentHTML('afterbegin',
  `
    <details>
      <summary>${data.message}</summary>
      <div>
        <h2>${data.header}</h2>
        <p>${data.advice}</p>
      </div>
    </details>
  `);
}
