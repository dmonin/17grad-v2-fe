export default {
  decorate: (element) => {
    const text = 'magic';
    const html = [];
    text.match(/./g).forEach(l => {
      html.push(`<span class="letter letter-${l}">${l}</span>`);
    });
    element.querySelector('.decoration').innerHTML = html.join('');
  },
  undecorate: (element) => {
    element.querySelector('.decoration').innerHTML = '';
  }
}