const newArray = [];
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


// TEST TIMEOUT FOR RECEIVING NEW MESSAGES (with audio)
const advice = document.querySelector('#advice');
const audio = document.querySelector('audio');

// hack to force-play audio on mobile
document.addEventListener('touchstart', () => {
    audio.play();
    audio.pause();
});

setTimeout(() => {
audio.play();
advice.insertAdjacentHTML('afterbegin',
  `<article>
    <details>
      <summary>Nieuw bericht<span id="1" class="new"></span></summary>
      <div>
        <h2>67%</h2>
        <p>Tijd om een andere generator aan te zetten</p>
      </div>
    </details>
  </article>
`)
}, 3000);

