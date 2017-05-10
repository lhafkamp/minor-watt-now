const advice = document.querySelector('#advice');
const audio = document.querySelector('audio');
const io = require('socket.io-client');
const socket = io.connect();

// hack to force-play audio on mobile
document.addEventListener('touchstart', () => {
    audio.play();
    audio.pause();
});

socket.on('newMessage', (data) => {
  audio.play();
  messageDOM(data[0]);
});

function messageDOM(data) {
  return advice.insertAdjacentHTML('afterbegin',
  `<article>
    <details>
      <summary>${data.message}<span id="1" class="new"></span></summary>
      <div>
        <h2>${data.header}</h2>
        <p>${data.advice}</p>
      </div>
    </details>
  </article>
`)
}
