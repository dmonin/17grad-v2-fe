const loadingEl = document.body.querySelector('.loading');
const loadingTextEl = document.body.querySelector('.loading-text');
const texts = [
  'Making Things Nice',
  'Uno momento',
  'Please, Hold the Line',
  'Enjoy',
  '17 degrees',
  'You look nice!',
  'Gimme a smile',
  'Curious?',
  'Give us a call',
  '17° is Fresh',
  'Cooling Down to 17°',
  'Skewing to 17°',
  'Ready?',
  'Siebzehn Grad',
  'Go! Go! Go!'
];

const loading = {
  isVisible: () => {
    return loadingEl.classList.contains('--visible');
  },
  show: (earlierTiming) => {
    return new Promise((resolve, reject) => {
      const index = Math.floor(Math.random() * texts.length);
      loadingTextEl.innerHTML = texts[index];
      loadingEl.classList.add('--visible');
      loadingEl.classList.remove('--hidden');
      setTimeout(resolve, 1000 - earlierTiming);
    });
  },
  hide: (earlierTiming = 0) => {
    return new Promise((resolve, reject) => {
      loadingEl.classList.add('--hidden');
      loadingEl.classList.remove('--visible');
      setTimeout(resolve, 1000 - earlierTiming);
      setTimeout(() => {
        loadingEl.classList.remove('--hidden');
      }, 1000);
    })

  }
}
export default loading;