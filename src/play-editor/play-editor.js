import PlayEditor from './components/PlayEditor.svelte';
import { currentElement } from './stores/current-element';

const elements = window['playView'].playArea.elements;
for (const el of elements) {
	el.element.classList.add('editable')
	el.element.addEventListener('click', () => {
		currentElement.select(el);
	});
}

const container = document.body.querySelector('.play-view');

const playEditor = new PlayEditor({
	target: document.body
});

container.addEventListener('dragover', (e) => {
	e.preventDefault();
	if (e.dataTransfer.items.length) {

	}
});

container.addEventListener('drop', (e) => {
	e.preventDefault();
	// const files = e.dataTransfer.files;

	// const formData = new FormData();

	// formData.append(`file`, files[0]);

	// fetch('/api/play-upload', {
	// 	method: 'post',
	// 	headers: {
	// 		'Accept': 'application/json'
	// 	},
	// 	body: formData,
	// 	credentials: 'include'
	// });
});

