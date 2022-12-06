export default {
  decorate: (element) => {
    const html = `<div class="magic-text">Magic</div>`;
    element.querySelector('.decoration').innerHTML = html;
  },
  undecorate: (element) => {
    element.querySelector('.decoration').innerHTML = '';
  }
}